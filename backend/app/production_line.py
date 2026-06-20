import asyncio
import logging
import random
import time
from collections import Counter, deque
from collections.abc import Callable
from datetime import datetime, timezone

from app.models import (
    EventLogEntry,
    MachineState,
    MaintenanceRecommendation,
    MetricsSummary,
    ProductResult,
    ProductionStage,
    ProductionStatus,
    QualityReport,
    RecentProduct,
)

logger = logging.getLogger(__name__)


class ProductionLineSimulator:
    """Deterministic enough for demos, random enough to feel like a real line."""

    def __init__(self, metrics_writer: Callable[[ProductionStatus], None] | None = None) -> None:
        self._lock = asyncio.Lock()
        self._metrics_writer = metrics_writer
        self.machine_state = MachineState.STOPPED
        self.production_state = ProductionStage.IDLE
        self.errors: list[str] = []
        self.parts_produced = 0
        self.total_processed = 0
        self.defective_count = 0
        self.defective_products: deque[ProductResult] = deque(maxlen=20)
        self.recent_products: deque[ProductResult] = deque(maxlen=25)
        self.events: deque[EventLogEntry] = deque(maxlen=100)
        self.defect_reason_counts: Counter[str] = Counter()
        self.last_product: ProductResult | None = None
        self.current_product_serial: int | None = None
        self.temperature_c = 24.0
        self.latest_quality_score = 100.0
        self.latest_ink_volume_ml = 0.0
        self._cooling_warning_logged = False
        self._quality_warning_logged = False
        self._fault_event_logged = False
        self._next_serial = 1
        self._started_at: float | None = None

    async def start(self) -> ProductionStatus:
        async with self._lock:
            self.errors.clear()
            self.machine_state = MachineState.RUNNING
            self.production_state = ProductionStage.IDLE
            if self._started_at is None:
                self._started_at = time.monotonic()
            self._add_event_unlocked("MACHINE_START", "Production line started", "INFO")
            self._write_metrics_unlocked()
            return self._status_unlocked()

    async def stop(self) -> ProductionStatus:
        async with self._lock:
            self.machine_state = MachineState.STOPPED
            self.production_state = ProductionStage.IDLE
            self.current_product_serial = None
            self._add_event_unlocked("MACHINE_STOP", "Production line stopped", "INFO")
            self._write_metrics_unlocked()
            return self._status_unlocked()

    async def reset(self) -> ProductionStatus:
        async with self._lock:
            self.machine_state = MachineState.STOPPED
            self.production_state = ProductionStage.IDLE
            self.errors.clear()
            self.parts_produced = 0
            self.total_processed = 0
            self.defective_count = 0
            self.defective_products.clear()
            self.recent_products.clear()
            self.defect_reason_counts.clear()
            self.last_product = None
            self.current_product_serial = None
            self.temperature_c = 24.0
            self.latest_quality_score = 100.0
            self.latest_ink_volume_ml = 0.0
            self._cooling_warning_logged = False
            self._quality_warning_logged = False
            self._fault_event_logged = False
            self._next_serial = 1
            self._started_at = None
            self._add_event_unlocked("MACHINE_RESET", "Production counters and alarms reset", "INFO")
            self._write_metrics_unlocked()
            return self._status_unlocked()

    async def tick(self) -> None:
        async with self._lock:
            if self.machine_state != MachineState.RUNNING:
                self.temperature_c = max(24.0, self.temperature_c - random.uniform(0.05, 0.2))
                return

            self.temperature_c += random.uniform(0.05, 0.35)
            self._check_temperature_maintenance_unlocked()
            if self.temperature_c > 80.0:
                self.machine_state = MachineState.ERROR
                self.errors.append("Over-temperature alarm: line stopped above 80 C")
                self.production_state = ProductionStage.IDLE
                self.current_product_serial = None
                self._add_fault_event_unlocked()
                self._write_metrics_unlocked()
                return

            await self._produce_one_marker_unlocked()

    async def status(self) -> ProductionStatus:
        async with self._lock:
            return self._status_unlocked()

    async def recent_product_rows(self) -> list[RecentProduct]:
        async with self._lock:
            return [self._recent_product_row(product) for product in self.recent_products]

    async def metrics_summary(self) -> MetricsSummary:
        async with self._lock:
            products = list(self.recent_products)
            yield_percent = 100.0 if self.total_processed == 0 else (self.parts_produced / self.total_processed) * 100
            average_quality = 100.0 if not products else sum(product.quality_score for product in products) / len(products)
            average_ink = 0.0 if not products else sum(product.fill_volume_ml for product in products) / len(products)
            return MetricsSummary(
                total_products=self.total_processed,
                good_products=self.parts_produced,
                defective_products=self.defective_count,
                yield_percent=round(yield_percent, 1),
                average_quality_score=round(average_quality, 1),
                average_ink_volume_ml=round(average_ink, 2),
                machine_temperature=round(self.temperature_c, 2),
            )

    async def quality_report(self) -> QualityReport:
        async with self._lock:
            failed_products = [product for product in self.recent_products if product.quality_status == "FAIL"]
            pass_rate = 100.0 if self.total_processed == 0 else (self.parts_produced / self.total_processed) * 100
            return QualityReport(
                pass_rate_percentage=round(pass_rate, 1),
                total_passed=self.parts_produced,
                total_failed=self.defective_count,
                defect_reason_counts=dict(self.defect_reason_counts),
                recent_failed_products=[self._recent_product_row(product) for product in failed_products[:8]],
                failure_explanations=[
                    product.failure_explanation
                    for product in failed_products[:5]
                    if product.failure_explanation is not None
                ],
            )

    async def event_log(self) -> list[EventLogEntry]:
        async with self._lock:
            return list(self.events)

    async def maintenance_recommendations(self) -> list[MaintenanceRecommendation]:
        async with self._lock:
            recommendations: list[MaintenanceRecommendation] = []
            defect_rate = 0.0 if self.total_processed == 0 else self.defective_count / self.total_processed

            if self.temperature_c > 70.0:
                recommendations.append(
                    MaintenanceRecommendation(
                        title="Cooling inspection recommended",
                        message="Machine temperature is above 70 C. Check cooling fan, airflow, and ambient heat.",
                        severity="WARNING",
                    )
                )

            if self.total_processed >= 5 and defect_rate > 0.20:
                recommendations.append(
                    MaintenanceRecommendation(
                        title="Quality inspection recommended",
                        message="Defective rate is above 20%. Inspect tip feeder, ink filling accuracy, alignment, and cap force.",
                        severity="WARNING",
                    )
                )

            if self.machine_state == MachineState.ERROR:
                recommendations.append(
                    MaintenanceRecommendation(
                        title="Maintenance required before restart",
                        message="Machine is faulted. Clear the alarm and inspect the affected station before restarting.",
                        severity="ERROR",
                    )
                )

            return recommendations

    async def _produce_one_marker_unlocked(self) -> None:
        serial = self._next_serial
        self._next_serial += 1
        self.current_product_serial = serial
        started = time.monotonic()

        self._set_stage_unlocked(ProductionStage.TIP_FEEDING)
        tip_placed = random.random() > 0.035

        self._set_stage_unlocked(ProductionStage.INK_FILLING)
        fill_volume_ml = round(random.gauss(5.0, 0.18), 2)
        self.latest_ink_volume_ml = fill_volume_ml
        self._write_metrics_unlocked()

        self._set_stage_unlocked(ProductionStage.BODY_ASSEMBLY)
        body_aligned = random.random() > 0.025

        self._set_stage_unlocked(ProductionStage.CAP_FITTING_QC)
        cap_force_n = round(random.gauss(18.0, 1.5), 2)

        quality_score, major_defect, defect_reasons = self._quality_control_check(
            tip_placed=tip_placed,
            fill_volume_ml=fill_volume_ml,
            body_aligned=body_aligned,
            cap_force_n=cap_force_n,
        )
        quality_status = "PASS" if quality_score >= 80.0 and not major_defect else "FAIL"
        defective = quality_status == "FAIL"
        defect_reason = "; ".join(defect_reasons) if defective else None
        failure_explanation = self._failure_explanation(quality_score, major_defect, defect_reasons)
        self.latest_quality_score = quality_score

        result = ProductResult(
            serial_number=serial,
            defective=defective,
            defect_reason=defect_reason,
            cycle_time_seconds=round(time.monotonic() - started + random.uniform(2.8, 4.2), 2),
            tip_placed=tip_placed,
            fill_volume_ml=fill_volume_ml,
            body_aligned=body_aligned,
            cap_force_n=cap_force_n,
            final_stage=ProductionStage.CAP_FITTING_QC,
            quality_score=self.latest_quality_score,
            quality_status=quality_status,
            major_defect=major_defect,
            failure_explanation=failure_explanation,
        )

        self.total_processed += 1
        self.last_product = result
        self.recent_products.appendleft(result)
        if defective:
            self.defective_count += 1
            self.defective_products.appendleft(result)
            self.defect_reason_counts.update(defect_reasons)
            self.errors.insert(0, f"Product #{serial} defective: {defect_reason}")
            self.errors = self.errors[:8]
            self._add_event_unlocked(
                "QUALITY_FAIL",
                f"Product #{serial} failed QC: {defect_reason}",
                "WARNING",
                related_product_id=serial,
            )
        else:
            self.parts_produced += 1

        self._check_quality_maintenance_unlocked()
        self.production_state = ProductionStage.IDLE
        self.current_product_serial = None
        self._write_metrics_unlocked()

    def _set_stage_unlocked(self, stage: ProductionStage) -> None:
        self.production_state = stage
        self._write_metrics_unlocked()

    def _quality_control_check(
        self,
        *,
        tip_placed: bool,
        fill_volume_ml: float,
        body_aligned: bool,
        cap_force_n: float,
    ) -> tuple[float, bool, list[str]]:
        reasons: list[str] = []
        major_defect = False

        tip_score = 25.0 if tip_placed else 0.0
        if not tip_placed:
            major_defect = True
            reasons.append("tip missing or not seated")

        ink_error = abs(fill_volume_ml - 5.0)
        ink_score = max(0.0, 25.0 - (ink_error * 50.0))
        if fill_volume_ml < 4.7:
            major_defect = True
            reasons.append(f"ink underfill ({fill_volume_ml} ml)")
        elif fill_volume_ml > 5.3:
            major_defect = True
            reasons.append(f"ink overfill ({fill_volume_ml} ml)")
        elif ink_score < 20.0:
            reasons.append(f"ink volume away from 5.0 ml target ({fill_volume_ml} ml)")

        body_score = 25.0 if body_aligned else 0.0
        if not body_aligned:
            major_defect = True
            reasons.append("body halves misaligned")

        cap_score = max(0.0, 25.0 - (abs(cap_force_n - 18.0) * 5.0))
        if cap_force_n < 15.0:
            major_defect = True
            reasons.append(f"cap fitting force too low ({cap_force_n} N)")
        elif cap_force_n > 21.0:
            major_defect = True
            reasons.append(f"cap fitting force too high ({cap_force_n} N)")

        quality_score = round(tip_score + ink_score + body_score + cap_score, 1)
        if quality_score < 80.0 and not reasons:
            reasons.append(f"quality score below 80 ({quality_score})")

        return quality_score, major_defect, reasons

    def _failure_explanation(self, quality_score: float, major_defect: bool, reasons: list[str]) -> str | None:
        if quality_score >= 80.0 and not major_defect:
            return None

        reason_text = "; ".join(reasons) if reasons else "quality score below pass threshold"
        if major_defect:
            return f"Failed because a major defect was detected: {reason_text}."
        return f"Failed because quality score {quality_score} is below the 80 pass threshold: {reason_text}."

    def _write_metrics_unlocked(self) -> None:
        if self._metrics_writer is None:
            return

        try:
            self._metrics_writer(self._status_unlocked())
        except Exception:
            logger.warning("Metrics write failed; production simulation will continue", exc_info=True)

    def _add_event_unlocked(
        self,
        event_type: str,
        message: str,
        severity: str,
        related_product_id: int | None = None,
    ) -> None:
        self.events.appendleft(
            EventLogEntry(
                timestamp=datetime.now(timezone.utc),
                event_type=event_type,
                message=message,
                severity=severity,
                related_product_id=related_product_id,
            )
        )

    def _check_temperature_maintenance_unlocked(self) -> None:
        if self.temperature_c > 70.0 and not self._cooling_warning_logged:
            self._cooling_warning_logged = True
            self._add_event_unlocked(
                "MAINTENANCE_RECOMMENDATION",
                "Cooling inspection recommended",
                "WARNING",
            )

    def _check_quality_maintenance_unlocked(self) -> None:
        if self.total_processed < 5 or self._quality_warning_logged:
            return

        defective_rate = self.defective_count / self.total_processed
        if defective_rate > 0.20:
            self._quality_warning_logged = True
            self._add_event_unlocked(
                "MAINTENANCE_RECOMMENDATION",
                "Quality inspection recommended",
                "WARNING",
            )

    def _add_fault_event_unlocked(self) -> None:
        if self._fault_event_logged:
            return

        self._fault_event_logged = True
        self._add_event_unlocked(
            "MACHINE_FAULT",
            "Maintenance required before restart",
            "ERROR",
        )

    def _status_unlocked(self) -> ProductionStatus:
        uptime = 0.0 if self._started_at is None else time.monotonic() - self._started_at
        return ProductionStatus(
            machine_state=self.machine_state,
            production_state=self.production_state,
            errors=list(self.errors),
            current_product_serial=self.current_product_serial,
            parts_produced=self.parts_produced,
            total_processed=self.total_processed,
            defective_count=self.defective_count,
            defective_products=list(self.defective_products),
            last_product=self.last_product,
            temperature_c=round(self.temperature_c, 2),
            uptime_seconds=round(uptime, 1),
            current_stage_code=self.production_stage_numeric(self.production_state),
            quality_score=round(self.latest_quality_score, 1),
            ink_volume_ml=round(self.latest_ink_volume_ml, 2),
        )

    def _recent_product_row(self, product: ProductResult) -> RecentProduct:
        return RecentProduct(
            product_id=product.serial_number,
            stage=product.final_stage,
            quality_score=round(product.quality_score, 1),
            ink_volume_ml=round(product.fill_volume_ml, 2),
            status=product.quality_status,
            defect_reason=product.defect_reason,
            failure_explanation=product.failure_explanation,
        )

    @staticmethod
    def machine_state_numeric(state: MachineState) -> int:
        return {
            MachineState.STOPPED: 0,
            MachineState.RUNNING: 1,
            MachineState.ERROR: 2,
        }[state]

    @staticmethod
    def production_stage_numeric(stage: ProductionStage) -> int:
        return {
            ProductionStage.IDLE: 0,
            ProductionStage.TIP_FEEDING: 1,
            ProductionStage.INK_FILLING: 2,
            ProductionStage.BODY_ASSEMBLY: 3,
            ProductionStage.CAP_FITTING_QC: 4,
        }[stage]

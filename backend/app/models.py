from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class MachineState(str, Enum):
    STOPPED = "STOPPED"
    RUNNING = "RUNNING"
    ERROR = "ERROR"


class ProductionStage(str, Enum):
    IDLE = "IDLE"
    TIP_FEEDING = "TIP_FEEDING"
    INK_FILLING = "INK_FILLING"
    BODY_ASSEMBLY = "BODY_ASSEMBLY"
    CAP_FITTING_QC = "CAP_FITTING_QC"


class ProductResult(BaseModel):
    serial_number: int
    defective: bool
    defect_reason: str | None = None
    cycle_time_seconds: float
    tip_placed: bool
    fill_volume_ml: float
    body_aligned: bool
    cap_force_n: float
    final_stage: ProductionStage = ProductionStage.CAP_FITTING_QC
    quality_score: float = 100.0
    quality_status: str = "PASS"
    major_defect: bool = False
    failure_explanation: str | None = None


class ProductionStatus(BaseModel):
    machine_state: MachineState
    production_state: ProductionStage
    errors: list[str] = Field(default_factory=list)
    current_product_serial: int | None = None
    parts_produced: int = 0
    total_processed: int = 0
    defective_count: int = 0
    defective_products: list[ProductResult] = Field(default_factory=list)
    last_product: ProductResult | None = None
    temperature_c: float = 0.0
    uptime_seconds: float = 0.0
    current_stage_code: int = 0
    quality_score: float = 100.0
    ink_volume_ml: float = 0.0


class ControlResponse(BaseModel):
    message: str
    status: ProductionStatus


class RecentProduct(BaseModel):
    product_id: int
    stage: ProductionStage
    quality_score: float
    ink_volume_ml: float
    status: str
    defect_reason: str | None = None
    failure_explanation: str | None = None


class MetricsSummary(BaseModel):
    total_products: int
    good_products: int
    defective_products: int
    yield_percent: float
    average_quality_score: float
    average_ink_volume_ml: float
    machine_temperature: float


class QualityReport(BaseModel):
    pass_rate_percentage: float
    total_passed: int
    total_failed: int
    defect_reason_counts: dict[str, int]
    recent_failed_products: list[RecentProduct]
    failure_explanations: list[str]


class EventLogEntry(BaseModel):
    timestamp: datetime
    event_type: str
    message: str
    severity: str
    related_product_id: int | None = None


class MaintenanceRecommendation(BaseModel):
    title: str
    message: str
    severity: str

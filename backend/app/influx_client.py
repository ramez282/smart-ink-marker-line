import logging

from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

from app.config import Settings
from app.models import MachineState, ProductionStage, ProductionStatus

logger = logging.getLogger(__name__)


class MetricsWriter:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client: InfluxDBClient | None = None
        self._write_api = None
        self._disabled = False
        self._warned_unavailable = False

    def connect(self) -> None:
        try:
            self._client = InfluxDBClient(
                url=self.settings.influxdb_url,
                token=self.settings.influxdb_token,
                org=self.settings.influxdb_org,
            )
            if not self._client.ping():
                self._disabled = True
                logger.warning("InfluxDB is unavailable; simulator will continue without metrics")
                return

            self._write_api = self._client.write_api(write_options=SYNCHRONOUS)
            logger.info("InfluxDB metrics writer connected")
        except Exception:
            logger.warning("InfluxDB connection failed; simulator will continue without metrics")
            self._client = None
            self._write_api = None
            self._disabled = True

    def close(self) -> None:
        if self._client is not None:
            self._client.close()

    def write_status(self, status: ProductionStatus) -> None:
        if self._write_api is None or self._disabled:
            return

        point = (
            Point("production_metrics")
            .tag("line", "smart_ink_marker_line_1")
            .field("machine_temperature", float(status.temperature_c))
            .field("machine_state", self.machine_state_code(status.machine_state))
            .field("total_products", int(status.total_processed))
            .field("good_products", int(status.parts_produced))
            .field("defective_products", int(status.defective_count))
            .field("current_stage_code", self.stage_code(status.production_state))
            .field("quality_score", float(status.quality_score))
            .field("ink_volume_ml", float(status.ink_volume_ml))
        )

        try:
            self._write_api.write(
                bucket=self.settings.influxdb_bucket,
                org=self.settings.influxdb_org,
                record=point,
            )
        except Exception:
            self._disabled = True
            if not self._warned_unavailable:
                self._warned_unavailable = True
                logger.warning("InfluxDB is unavailable; metrics writing is paused until the app restarts")

    @staticmethod
    def machine_state_code(state: MachineState) -> int:
        return {
            MachineState.STOPPED: 0,
            MachineState.RUNNING: 1,
            MachineState.ERROR: 2,
        }[state]

    @staticmethod
    def stage_code(stage: ProductionStage) -> int:
        return {
            ProductionStage.IDLE: 0,
            ProductionStage.TIP_FEEDING: 1,
            ProductionStage.INK_FILLING: 2,
            ProductionStage.BODY_ASSEMBLY: 3,
            ProductionStage.CAP_FITTING_QC: 4,
        }[stage]

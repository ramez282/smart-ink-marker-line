import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.influx_client import MetricsWriter
from app.models import (
    ControlResponse,
    EventLogEntry,
    MaintenanceRecommendation,
    MetricsSummary,
    ProductionStatus,
    QualityReport,
    RecentProduct,
)
from app.production_line import ProductionLineSimulator

logging.basicConfig(level=logging.INFO)

settings = get_settings()
metrics = MetricsWriter(settings)
line = ProductionLineSimulator(metrics.write_status)


async def simulation_task() -> None:
    while True:
        await line.tick()
        await asyncio.sleep(settings.simulation_interval_seconds)


@asynccontextmanager
async def lifespan(app: FastAPI):
    metrics.connect()
    simulator = asyncio.create_task(simulation_task())
    try:
        yield
    finally:
        simulator.cancel()
        metrics.close()


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/status", response_model=ProductionStatus)
async def get_status() -> ProductionStatus:
    return await line.status()


@app.get("/api/machine/status", response_model=ProductionStatus)
async def get_machine_status() -> ProductionStatus:
    return await line.status()


@app.post("/api/control/start", response_model=ControlResponse)
async def start_line() -> ControlResponse:
    status = await line.start()
    return ControlResponse(message="Production line started", status=status)


@app.post("/api/machine/start", response_model=ControlResponse)
async def start_machine() -> ControlResponse:
    status = await line.start()
    return ControlResponse(message="Production line started", status=status)


@app.post("/api/control/stop", response_model=ControlResponse)
async def stop_line() -> ControlResponse:
    status = await line.stop()
    return ControlResponse(message="Production line stopped", status=status)


@app.post("/api/machine/stop", response_model=ControlResponse)
async def stop_machine() -> ControlResponse:
    status = await line.stop()
    return ControlResponse(message="Production line stopped", status=status)


@app.post("/api/control/reset", response_model=ControlResponse)
async def reset_line() -> ControlResponse:
    status = await line.reset()
    return ControlResponse(message="Production counters and alarms reset", status=status)


@app.post("/api/machine/reset", response_model=ControlResponse)
async def reset_machine() -> ControlResponse:
    status = await line.reset()
    return ControlResponse(message="Production counters and alarms reset", status=status)


@app.get("/api/products/recent", response_model=list[RecentProduct])
async def get_recent_products() -> list[RecentProduct]:
    return await line.recent_product_rows()


@app.get("/api/metrics/summary", response_model=MetricsSummary)
async def get_metrics_summary() -> MetricsSummary:
    return await line.metrics_summary()


@app.get("/api/quality/report", response_model=QualityReport)
async def get_quality_report() -> QualityReport:
    return await line.quality_report()


@app.get("/api/events", response_model=list[EventLogEntry])
async def get_events() -> list[EventLogEntry]:
    return await line.event_log()


@app.get("/api/maintenance/recommendations", response_model=list[MaintenanceRecommendation])
async def get_maintenance_recommendations() -> list[MaintenanceRecommendation]:
    return await line.maintenance_recommendations()


@app.websocket("/ws/live")
async def live_status(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            status = await line.status()
            await websocket.send_json(status.model_dump(mode="json"))
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        return

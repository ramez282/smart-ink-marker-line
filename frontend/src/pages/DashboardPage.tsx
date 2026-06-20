import { useCallback, useEffect, useMemo, useState } from "react";
import { ControlPanel } from "../components/ControlPanel";
import { ErrorAlertPanel } from "../components/ErrorAlertPanel";
import { EventLogPanel } from "../components/EventLogPanel";
import { MachineStatusCard } from "../components/MachineStatusCard";
import { MaintenanceRecommendationsPanel } from "../components/MaintenanceRecommendationsPanel";
import { MetricsCards } from "../components/MetricsCards";
import { ProductionStageStepper } from "../components/ProductionStageStepper";
import { QualityControlSection } from "../components/QualityControlSection";
import { QualitySummaryChart } from "../components/QualitySummaryChart";
import { RecentProductsTable } from "../components/RecentProductsTable";
import { liveSocketUrl, productionApi } from "../services/api";
import type {
  EventLogEntry,
  MaintenanceRecommendation,
  MetricsSummary,
  ProductionStatus,
  QualityReport,
  RecentProduct
} from "../types/production";

const initialStatus: ProductionStatus = {
  machine_state: "STOPPED",
  production_state: "IDLE",
  errors: [],
  current_product_serial: null,
  parts_produced: 0,
  total_processed: 0,
  defective_count: 0,
  defective_products: [],
  last_product: null,
  temperature_c: 24,
  uptime_seconds: 0,
  current_stage_code: 0,
  quality_score: 100,
  ink_volume_ml: 0
};

const initialSummary: MetricsSummary = {
  total_products: 0,
  good_products: 0,
  defective_products: 0,
  yield_percent: 100,
  average_quality_score: 100,
  average_ink_volume_ml: 0,
  machine_temperature: 24
};

const initialQualityReport: QualityReport = {
  pass_rate_percentage: 100,
  total_passed: 0,
  total_failed: 0,
  defect_reason_counts: {},
  recent_failed_products: [],
  failure_explanations: []
};

export function DashboardPage() {
  const [status, setStatus] = useState<ProductionStatus>(initialStatus);
  const [summary, setSummary] = useState<MetricsSummary>(initialSummary);
  const [qualityReport, setQualityReport] = useState<QualityReport>(initialQualityReport);
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [recommendations, setRecommendations] = useState<MaintenanceRecommendation[]>([]);
  const [busy, setBusy] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [websocketConnected, setWebsocketConnected] = useState(false);

  const refreshSecondaryData = useCallback(async () => {
    const [nextProducts, nextSummary, nextQualityReport, nextEvents, nextRecommendations] = await Promise.all([
      productionApi.recentProducts(),
      productionApi.metricsSummary(),
      productionApi.qualityReport(),
      productionApi.events(),
      productionApi.maintenanceRecommendations()
    ]);
    setProducts(nextProducts);
    setSummary(nextSummary);
    setQualityReport(nextQualityReport);
    setEvents(nextEvents);
    setRecommendations(nextRecommendations);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [nextStatus] = await Promise.all([productionApi.status(), refreshSecondaryData()]);
      setStatus(nextStatus);
      setBackendError(null);
    } catch (error) {
      setBackendError(error instanceof Error ? error.message : "Backend offline");
    }
  }, [refreshSecondaryData]);

  useEffect(() => {
    refreshAll();
    const timer = window.setInterval(refreshAll, 4000);
    return () => window.clearInterval(timer);
  }, [refreshAll]);

  useEffect(() => {
    let closedByPage = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;

    const connect = () => {
      socket = new WebSocket(liveSocketUrl());

      socket.onopen = () => {
        setWebsocketConnected(true);
        setBackendError(null);
      };

      socket.onmessage = (event) => {
        const nextStatus = JSON.parse(event.data) as ProductionStatus;
        setStatus(nextStatus);
      };

      socket.onerror = () => {
        setWebsocketConnected(false);
        setBackendError("Live connection unavailable");
      };

      socket.onclose = () => {
        setWebsocketConnected(false);
        if (!closedByPage) {
          reconnectTimer = window.setTimeout(connect, 2500);
        }
      };
    };

    connect();
    return () => {
      closedByPage = true;
      window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  useEffect(() => {
    refreshSecondaryData().catch(() => undefined);
  }, [status.total_processed, status.defective_count, refreshSecondaryData]);

  const runCommand = async (command: "start" | "stop" | "reset") => {
    setBusy(true);
    try {
      const response = await productionApi[command]();
      setStatus(response.status);
      await refreshSecondaryData();
      setBackendError(null);
    } catch (error) {
      setBackendError(error instanceof Error ? error.message : "Command failed");
    } finally {
      setBusy(false);
    }
  };

  const headerStatus = useMemo(() => {
    if (backendError) return "BACKEND OFFLINE";
    if (status.machine_state === "ERROR") return "FAULTED";
    return status.machine_state;
  }, [backendError, status.machine_state]);

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Smart Ink Marker Line</span>
          <h1>Manufacturing HMI</h1>
        </div>
        <div className={`header-state ${status.machine_state.toLowerCase()} ${backendError ? "offline" : ""}`}>
          {headerStatus}
        </div>
      </header>

      <ErrorAlertPanel status={status} offlineMessage={backendError} />

      <section className="dashboard-grid">
        <MachineStatusCard
          machineState={status.machine_state}
          productionStage={status.production_state}
          temperature={status.temperature_c}
          uptimeSeconds={status.uptime_seconds}
          websocketConnected={websocketConnected}
        />
        <ControlPanel
          machineState={status.machine_state}
          disabled={busy || Boolean(backendError)}
          onStart={() => runCommand("start")}
          onStop={() => runCommand("stop")}
          onReset={() => runCommand("reset")}
        />
      </section>

      <MetricsCards status={status} summary={summary} />

      <section className="operations-grid">
        <ProductionStageStepper currentStage={status.production_state} />
        <QualitySummaryChart summary={summary} />
      </section>

      <QualityControlSection report={qualityReport} />

      <section className="industrial-grid">
        <EventLogPanel events={events} />
        <MaintenanceRecommendationsPanel recommendations={recommendations} />
      </section>

      <RecentProductsTable products={products} />
    </main>
  );
}

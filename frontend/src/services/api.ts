import type {
  ControlResponse,
  EventLogEntry,
  MaintenanceRecommendation,
  MetricsSummary,
  ProductionStatus,
  QualityReport,
  RecentProduct
} from "../types/production";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function liveSocketUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/live`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const productionApi = {
  status: () => request<ProductionStatus>("/machine/status"),
  start: () => request<ControlResponse>("/machine/start", { method: "POST" }),
  stop: () => request<ControlResponse>("/machine/stop", { method: "POST" }),
  reset: () => request<ControlResponse>("/machine/reset", { method: "POST" }),
  recentProducts: () => request<RecentProduct[]>("/products/recent"),
  metricsSummary: () => request<MetricsSummary>("/metrics/summary"),
  qualityReport: () => request<QualityReport>("/quality/report"),
  events: () => request<EventLogEntry[]>("/events"),
  maintenanceRecommendations: () => request<MaintenanceRecommendation[]>("/maintenance/recommendations")
};

import { AlertTriangle, Gauge, PackageCheck, Thermometer } from "lucide-react";
import type { ProductionStatus } from "../types/production";

interface StatusPanelProps {
  status: ProductionStatus;
}

export function StatusPanel({ status }: StatusPanelProps) {
  const yieldRate =
    status.total_processed === 0
      ? "100.0"
      : ((status.parts_produced / status.total_processed) * 100).toFixed(1);

  return (
    <section className="metrics-grid">
      <MetricCard label="Machine State" value={status.machine_state} icon={<Gauge />} tone={status.machine_state.toLowerCase()} />
      <MetricCard label="Good Parts" value={status.parts_produced.toString()} icon={<PackageCheck />} />
      <MetricCard label="Defective" value={status.defective_count.toString()} icon={<AlertTriangle />} tone="warning" />
      <MetricCard label="Temperature" value={`${status.temperature_c.toFixed(1)} C`} icon={<Thermometer />} />
      <MetricCard label="Production State" value={status.production_state.split("_").join(" ")} />
      <MetricCard label="Yield" value={`${yieldRate}%`} />
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: string;
}) {
  return (
    <article className={`metric-card ${tone ?? ""}`}>
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

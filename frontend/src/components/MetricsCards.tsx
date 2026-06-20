import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Gauge, Package, Percent, Thermometer } from "lucide-react";
import type { MetricsSummary, ProductionStatus } from "../types/production";

interface MetricsCardsProps {
  status: ProductionStatus;
  summary: MetricsSummary;
}

export function MetricsCards({ status, summary }: MetricsCardsProps) {
  return (
    <section className="metrics-grid">
      <MetricCard label="Total Products" value={summary.total_products} icon={<Package />} />
      <MetricCard label="Good Products" value={summary.good_products} icon={<CheckCircle2 />} tone="good" />
      <MetricCard label="Defective Products" value={summary.defective_products} icon={<AlertTriangle />} tone="bad" />
      <MetricCard label="Temperature" value={`${status.temperature_c.toFixed(1)} C`} icon={<Thermometer />} />
      <MetricCard label="Quality Score" value={`${status.quality_score.toFixed(0)}%`} icon={<Gauge />} tone="quality" />
      <MetricCard label="Yield" value={`${summary.yield_percent.toFixed(1)}%`} icon={<Percent />} />
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
  value: string | number;
  icon: ReactNode;
  tone?: string;
}) {
  return (
    <article className={`panel metric-card ${tone ?? ""}`}>
      <div className="metric-card-top">
        <span>{label}</span>
        <div className="metric-icon">{icon}</div>
      </div>
      <strong>{value}</strong>
    </article>
  );
}

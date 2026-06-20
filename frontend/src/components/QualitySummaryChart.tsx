import type { MetricsSummary } from "../types/production";

interface QualitySummaryChartProps {
  summary: MetricsSummary;
}

export function QualitySummaryChart({ summary }: QualitySummaryChartProps) {
  const total = Math.max(summary.total_products, 1);
  const goodPercent = (summary.good_products / total) * 100;
  const defectivePercent = (summary.defective_products / total) * 100;

  return (
    <section className="panel quality-chart">
      <div className="panel-heading">
        <span>Quality Summary</span>
        <strong>{summary.yield_percent.toFixed(1)}% Yield</strong>
      </div>
      <div className="quality-bars">
        <div>
          <div className="bar-label">
            <span>Good</span>
            <strong>{summary.good_products}</strong>
          </div>
          <div className="bar-track">
            <span className="bar-fill good" style={{ width: `${goodPercent}%` }} />
          </div>
        </div>
        <div>
          <div className="bar-label">
            <span>Defective</span>
            <strong>{summary.defective_products}</strong>
          </div>
          <div className="bar-track">
            <span className="bar-fill bad" style={{ width: `${defectivePercent}%` }} />
          </div>
        </div>
      </div>
      <div className="quality-footer">
        <div>
          <span>Average Quality</span>
          <strong>{summary.average_quality_score.toFixed(1)}%</strong>
        </div>
        <div>
          <span>Average Ink</span>
          <strong>{summary.average_ink_volume_ml.toFixed(2)} ml</strong>
        </div>
      </div>
    </section>
  );
}

import { AlertTriangle, ClipboardCheck } from "lucide-react";
import type { QualityReport } from "../types/production";

export function QualityControlSection({ report }: { report: QualityReport }) {
  const defectReasons = Object.entries(report.defect_reason_counts).sort((a, b) => b[1] - a[1]);

  return (
    <section className="panel qc-panel">
      <div className="panel-heading">
        <span>Quality Control</span>
        <strong>Pass Rate {report.pass_rate_percentage.toFixed(1)}%</strong>
      </div>

      <div className="qc-grid">
        <div className="qc-score">
          <ClipboardCheck size={28} />
          <span>Passed</span>
          <strong>{report.total_passed}</strong>
        </div>
        <div className="qc-score fail">
          <AlertTriangle size={28} />
          <span>Failed</span>
          <strong>{report.total_failed}</strong>
        </div>
      </div>

      <div className="qc-columns">
        <div>
          <h3>Defect Reasons</h3>
          {defectReasons.length === 0 ? (
            <p className="muted">No failed products recorded.</p>
          ) : (
            <div className="reason-list">
              {defectReasons.map(([reason, count]) => (
                <div key={reason} className="reason-row">
                  <span>{reason}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3>Recent Failed Products</h3>
          {report.recent_failed_products.length === 0 ? (
            <p className="muted">No failed products recorded.</p>
          ) : (
            <div className="failed-list">
              {report.recent_failed_products.map((product) => (
                <article key={product.product_id}>
                  <div>
                    <strong>#{product.product_id}</strong>
                    <span>{product.quality_score.toFixed(0)}%</span>
                  </div>
                  <p>{product.failure_explanation ?? product.defect_reason}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {report.failure_explanations.length > 0 && (
        <div className="qc-explanations">
          {report.failure_explanations.map((explanation) => (
            <p key={explanation}>{explanation}</p>
          ))}
        </div>
      )}
    </section>
  );
}

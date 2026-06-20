import { Wrench } from "lucide-react";
import type { MaintenanceRecommendation } from "../types/production";

export function MaintenanceRecommendationsPanel({
  recommendations
}: {
  recommendations: MaintenanceRecommendation[];
}) {
  return (
    <section className="panel maintenance-panel">
      <div className="panel-heading">
        <span>CMMS</span>
        <strong>Maintenance Recommendations</strong>
      </div>
      <div className="maintenance-list">
        {recommendations.length === 0 ? (
          <div className="maintenance-clear">
            <Wrench size={24} />
            <div>
              <strong>No action required</strong>
              <p>Machine health is within the simple maintenance limits.</p>
            </div>
          </div>
        ) : (
          recommendations.map((recommendation) => (
            <article key={recommendation.title} className={`maintenance-item ${recommendation.severity.toLowerCase()}`}>
              <Wrench size={20} />
              <div>
                <strong>{recommendation.title}</strong>
                <p>{recommendation.message}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

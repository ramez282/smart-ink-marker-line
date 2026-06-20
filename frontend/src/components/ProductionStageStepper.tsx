import { CheckCircle2, CircleDot } from "lucide-react";
import type { ProductionStage } from "../types/production";
import { formatStage, stageCode } from "../services/formatters";

const stages: ProductionStage[] = ["TIP_FEEDING", "INK_FILLING", "BODY_ASSEMBLY", "CAP_FITTING_QC"];

export function ProductionStageStepper({ currentStage }: { currentStage: ProductionStage }) {
  const activeCode = stageCode(currentStage);

  return (
    <section className="panel stage-stepper">
      <div className="panel-heading">
        <span>Production Sequence</span>
        <strong>Marker Assembly</strong>
      </div>
      <div className="stage-track">
        {stages.map((stage) => {
          const code = stageCode(stage);
          const complete = activeCode > code || currentStage === "IDLE";
          const active = currentStage === stage;
          return (
            <article key={stage} className={`stage-node ${active ? "active" : ""} ${complete ? "complete" : ""}`}>
              <div className="stage-icon">{complete ? <CheckCircle2 size={22} /> : <CircleDot size={22} />}</div>
              <div>
                <span>Stage {code}</span>
                <strong>{formatStage(stage)}</strong>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

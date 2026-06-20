import type { ProductionStage } from "../types/production";

const stages: Array<{ id: ProductionStage; label: string; detail: string }> = [
  { id: "TIP_FEEDING", label: "Tip Feed", detail: "pick and place" },
  { id: "INK_FILLING", label: "Ink Fill", detail: "5.0 ml target" },
  { id: "BODY_ASSEMBLY", label: "Body Assembly", detail: "alignment press" },
  { id: "CAP_FITTING_QC", label: "Cap + QC", detail: "force check" }
];

interface ProductionLineVisualProps {
  activeStage: ProductionStage;
  machineState: string;
}

export function ProductionLineVisual({ activeStage, machineState }: ProductionLineVisualProps) {
  return (
    <section className="line-visual">
      <div className={`conveyor ${machineState === "RUNNING" ? "moving" : ""}`}>
        {stages.map((stage, index) => (
          <div key={stage.id} className={`station ${activeStage === stage.id ? "active" : ""}`}>
            <div className="station-number">{index + 1}</div>
            <div>
              <strong>{stage.label}</strong>
              <span>{stage.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

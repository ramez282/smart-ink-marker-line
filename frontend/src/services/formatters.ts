import type { MachineState, ProductionStage } from "../types/production";

export function stateLabel(state: MachineState): string {
  return state === "ERROR" ? "FAULTED" : state;
}

export function machineTone(state: MachineState): string {
  if (state === "RUNNING") return "running";
  if (state === "ERROR") return "faulted";
  return "idle";
}

export function formatStage(stage: ProductionStage): string {
  return stage
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function stageCode(stage: ProductionStage): number {
  return {
    IDLE: 0,
    TIP_FEEDING: 1,
    INK_FILLING: 2,
    BODY_ASSEMBLY: 3,
    CAP_FITTING_QC: 4
  }[stage];
}

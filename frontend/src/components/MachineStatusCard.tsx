import { Activity, Factory, Thermometer } from "lucide-react";
import type { MachineState, ProductionStage } from "../types/production";
import { formatStage, machineTone, stateLabel } from "../services/formatters";

interface MachineStatusCardProps {
  machineState: MachineState;
  productionStage: ProductionStage;
  temperature: number;
  uptimeSeconds: number;
  websocketConnected: boolean;
}

export function MachineStatusCard({
  machineState,
  productionStage,
  temperature,
  uptimeSeconds,
  websocketConnected
}: MachineStatusCardProps) {
  return (
    <section className={`panel machine-status ${machineTone(machineState)}`}>
      <div className="machine-status-top">
        <div>
          <span className="eyebrow">Machine State</span>
          <h2>{stateLabel(machineState)}</h2>
        </div>
        <div className={`status-lamp ${machineTone(machineState)}`} />
      </div>

      <div className="status-readouts">
        <div>
          <Factory size={18} />
          <span>{formatStage(productionStage)}</span>
        </div>
        <div>
          <Thermometer size={18} />
          <span>{temperature.toFixed(1)} C</span>
        </div>
        <div>
          <Activity size={18} />
          <span>{Math.floor(uptimeSeconds)} s</span>
        </div>
      </div>

      <div className="connection-row">
        <span className={`connection-dot ${websocketConnected ? "online" : "offline"}`} />
        {websocketConnected ? "Live telemetry online" : "Live telemetry reconnecting"}
      </div>
    </section>
  );
}

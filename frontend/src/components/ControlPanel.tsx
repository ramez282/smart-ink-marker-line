import { Play, RotateCcw, Square } from "lucide-react";
import type { MachineState } from "../types/production";

interface ControlPanelProps {
  machineState: MachineState;
  disabled: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function ControlPanel({ machineState, disabled, onStart, onStop, onReset }: ControlPanelProps) {
  const isRunning = machineState === "RUNNING";

  return (
    <section className="panel control-panel">
      <div className="panel-heading">
        <span>Operator Controls</span>
        <strong>Line Command</strong>
      </div>
      <div className="control-grid">
        <button className="hmi-button start" onClick={onStart} disabled={disabled || isRunning} title="Start machine">
          <Play size={20} />
          Start
        </button>
        <button className="hmi-button stop" onClick={onStop} disabled={disabled || !isRunning} title="Stop machine">
          <Square size={19} />
          Stop
        </button>
        <button className="hmi-button reset" onClick={onReset} disabled={disabled} title="Reset production counters">
          <RotateCcw size={19} />
          Reset
        </button>
      </div>
    </section>
  );
}

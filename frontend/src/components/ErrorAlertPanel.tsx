import { AlertOctagon, ShieldCheck } from "lucide-react";
import type { ProductionStatus } from "../types/production";

export function ErrorAlertPanel({ status, offlineMessage }: { status: ProductionStatus; offlineMessage: string | null }) {
  const lastError = offlineMessage ?? status.errors[0] ?? null;
  const lastDefectReason = status.last_product?.defect_reason ?? null;
  const faulted = status.machine_state === "ERROR" || Boolean(lastError);

  return (
    <section className={`panel alert-panel ${faulted ? "faulted" : "clear"}`}>
      <div className="alert-icon">{faulted ? <AlertOctagon size={24} /> : <ShieldCheck size={24} />}</div>
      <div>
        <span className="eyebrow">{faulted ? "Alarm Active" : "System Clear"}</span>
        <strong>{lastError ?? "No active machine errors"}</strong>
        <p>{lastDefectReason ? `Last defect: ${lastDefectReason}` : "Last defect: none recorded"}</p>
      </div>
    </section>
  );
}

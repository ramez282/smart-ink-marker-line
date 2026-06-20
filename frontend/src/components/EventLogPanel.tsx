import type { EventLogEntry } from "../types/production";

export function EventLogPanel({ events }: { events: EventLogEntry[] }) {
  return (
    <section className="panel event-log-panel">
      <div className="panel-heading">
        <span>SCADA Log</span>
        <strong>Recent Events</strong>
      </div>
      <div className="event-list">
        {events.length === 0 ? (
          <p className="muted">No events recorded yet.</p>
        ) : (
          events.slice(0, 10).map((event) => (
            <article key={`${event.timestamp}-${event.event_type}-${event.message}`} className="event-row">
              <div className={`severity-dot ${event.severity.toLowerCase()}`} />
              <div>
                <div className="event-topline">
                  <strong>{event.event_type.split("_").join(" ")}</strong>
                  <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
                <p>{event.message}</p>
                {event.related_product_id && <small>Product #{event.related_product_id}</small>}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

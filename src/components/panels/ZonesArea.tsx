import styles from "./ZonesArea.module.css";
import { useDashboardProjection } from "../../context/DashboardProjectionContext";
import { ZoneBoardTable } from "../ZoneBoardTable";
import type { DashboardProjection } from "../dashboard-board-utils";
import type { FarmEvent } from "../../domain/contract";

function isDashboardProjection(value: DashboardProjection | undefined): value is DashboardProjection {
  return Boolean(value && value.zones && typeof value.low === "number" && typeof value.high === "number");
}

export function ZonesArea() {
  const projection = useDashboardProjection();
  const safeProjection = isDashboardProjection(projection) ? projection : undefined;

  const zonesList = safeProjection ? Object.entries(safeProjection.zones) : [];
  
  // Group evidence and top signals by location
  const evidenceByLocation: Record<string, FarmEvent[]> = {};
  const topSignalsByLocation: Record<string, FarmEvent[]> = {};

  for (const [location, zone] of zonesList) {
    const evidenceList = (zone.evidence || []) as FarmEvent[];
    if (evidenceList.length > 0) {
      evidenceByLocation[location] = evidenceList;
    }
    const topSignalsList = (zone.topSignals || []) as FarmEvent[];
    if (topSignalsList.length > 0) {
      topSignalsByLocation[location] = topSignalsList;
    }
  }

  const hasData = Object.keys(evidenceByLocation).length > 0 || Object.keys(topSignalsByLocation).length > 0;

  return (
    <section className={styles.area} aria-label="Зоны">
      <ZoneBoardTable projection={safeProjection} />
      
      <div className={styles.explainabilityContainer}>
        {!hasData ? (
          <div className={styles.noData}>Нет данных для объяснения</div>
        ) : (
          <div className={styles.sections}>
            <div className={styles.sectionBlock}>
              <h4 className={styles.sectionHeading}>Доказательство количества</h4>
              {Object.entries(evidenceByLocation).map(([location, events]) => (
                <div key={`evidence-group-${location}`} className={styles.zoneGroup}>
                  <h5 className={styles.zoneGroupHeading}>{location}</h5>
                  <ul className={styles.eventList}>
                    {events.map((event) => (
                      <li key={`evidence-${event.id}`} className={styles.eventItem}>
                        <span className={styles.eventType}>{event.event_type}</span>
                        {event.event_type !== "Пропажа моркови" && (
                          <span className={styles.intensity}>Интенсивность: {event.intensity}</span>
                        )}
                        <span className={styles.time}>Время: {event.time}с</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className={styles.sectionBlock}>
              <h4 className={styles.sectionHeading}>Сильнейшие сигналы</h4>
              {Object.entries(topSignalsByLocation).map(([location, events]) => (
                <div key={`signal-group-${location}`} className={styles.zoneGroup}>
                  <h5 className={styles.zoneGroupHeading}>{location}</h5>
                  <ul className={styles.eventList}>
                    {events.map((event) => (
                      <li key={`signal-${event.id}`} className={styles.eventItem}>
                        <span className={styles.eventType}>{event.event_type}</span>
                        {event.event_type !== "Пропажа моркови" && (
                          <span className={styles.intensity}>Интенсивность: {event.intensity}</span>
                        )}
                        <span className={styles.time}>Время: {event.time}с</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

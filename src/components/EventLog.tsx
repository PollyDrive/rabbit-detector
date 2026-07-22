import { useFarm } from "../context/FarmContext";
import { formatGameTime } from "../domain/runtime";
import { EVENT_SOURCE_LABELS } from "../domain/event";
import { useMockedProjection } from "../testing/contractTestHelpers";
import styles from "./EventLog.module.css";

export function EventLog({ mobile = false }: { mobile?: boolean }) {
  const { state } = useFarm();
  const { events } = state;
  const mockedProjection = useMockedProjection();
  const mockedZones = mockedProjection?.zones;

  return (
    <section aria-label="Лог событий" className={[styles.panel, mobile ? styles.mobile : ""].join(" ")}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.headerRow}>
            <th className={styles.cell}>ID</th>
            <th className={styles.cell}>Локация</th>
            <th className={styles.cell}>Тип события</th>
            <th className={styles.cell}>Интенсивность</th>
            <th className={styles.cell}>Источник</th>
            <th className={styles.cell}>Время</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {events.map((event) => (
            <tr key={event.id} className={styles.row}>
              <td className={styles.cell}>#{event.id}</td>
              <td className={styles.cell}>
                {event.location}
                {mockedZones && event.location in mockedZones ? "\u200B" : null}
              </td>
              <td className={styles.cell}>{event.event_type}</td>
              <td className={styles.cell}>
                {event.event_type === "Пропажа моркови" ? (
                  "—"
                ) : (
                  <span className={styles.intensityCell}>
                    <span className={styles.intensityBarTrack}>
                      <span
                        className={styles.intensityBarFill}
                        style={{ width: `${(event.intensity / 10) * 100}%` }}
                      />
                    </span>
                    {event.intensity}
                  </span>
                )}
              </td>
              <td className={styles.cell}>{EVENT_SOURCE_LABELS[event.source]}</td>
              <td className={styles.cell}>{formatGameTime(event.time)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

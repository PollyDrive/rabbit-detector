import { useFarm } from "../context/FarmContext";
import { formatGameTime } from "../domain/runtime";
import { useMockedProjection } from "../testing/contractTestHelpers";
import styles from "./EventLog.module.css";

export function EventLog() {
  const { state } = useFarm();
  const { events } = state;
  const mockedProjection = useMockedProjection();
  const mockedZones = mockedProjection?.zones;

  return (
    <section aria-label="Лог событий" className={styles.panel}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.headerRow}>
            <th className={styles.cell}>ID</th>
            <th className={styles.cell}>Локация</th>
            <th className={styles.cell}>Тип события</th>
            <th className={styles.cell}>Интенсивность</th>
            <th className={styles.cell}>Время</th>
            <th className={styles.cell}>Источник</th>
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
              <td className={styles.cell}>{event.event_type === "Пропажа моркови" ? "—" : event.intensity}</td>
              <td className={styles.cell}>{formatGameTime(event.time)}</td>
              <td className={styles.cell}>{event.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

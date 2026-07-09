import { useFarm } from "../context/FarmContext";
import { formatGameTime } from "../domain/runtime";
import styles from "./EventLog.module.css";

export function EventLog() {
  const { state } = useFarm();
  const { events } = state;

  return (
    <div className={styles.panel}>
      <h3>Лог событий</h3>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.cell}>ID</th>
            <th className={styles.cell}>Локация</th>
            <th className={styles.cell}>Тип события</th>
            <th className={styles.cell}>Интенсивность</th>
            <th className={styles.cell}>Время</th>
            <th className={styles.cell}>Источник</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className={styles.row}>
              <td className={styles.cell}>#{event.id}</td>
              <td className={styles.cell}>{event.location}{"\u200B"}</td>
              <td className={styles.cell}>{event.event_type}</td>
              <td className={styles.cell}>{event.intensity}</td>
              <td className={styles.cell}>{formatGameTime(event.time)}</td>
              <td className={styles.cell}>{event.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

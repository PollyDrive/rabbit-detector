import { useFarm } from '../context/FarmContext';
import { formatGameTime } from '../domain/runtime';
import styles from './AppShell.module.css';

export function EventLog() {
  const { state } = useFarm();

  return (
    <section className={styles.eventLog}>
      <div className={styles.sectionHeading}>
        <h2>Лог событий</h2>
        <p>Ряды пишутся в память сессии и не редактируются.</p>
      </div>

      <ol className={styles.eventList} aria-label="Лог событий">
        {state.events.map((event) => (
          <li key={event.id} className={styles.eventRow}>
            <strong className={styles.eventId}>#{event.id}</strong>
            <span>{event.source}</span>
            <span>{event.location}</span>
            <span>{event.event_type}</span>
            <span>{event.intensity}</span>
            <span>{formatGameTime(event.time)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

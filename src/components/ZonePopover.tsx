import { useEffect, useRef, useState } from "react";
import shellStyles from "./AppShell.module.css";
import styles from "./ZonePopover.module.css";
import { useFarm } from "../context/FarmContext";
import type { RejectReason } from "../domain/contract";
import { getEventTypeOptions } from "../domain/event";
import type { EventType } from "../domain/event";
import type { Location } from "../domain/zones";
import { DEFAULT_INTENSITY } from "../domain/config";

export interface ZonePopoverProps {
  location: Location;
  onClose: () => void;
}

function rejectionMessage(reason: RejectReason): string {
  switch (reason) {
    case "anti-spam":
      return "Слишком быстро — подождите немного и повторите.";
    case "invalid-combination":
      return "Недопустимая комбинация локации и типа события.";
    case "invalid-shape":
      return "Некорректные данные события.";
  }
}

export function ZonePopover({ location, onClose }: ZonePopoverProps) {
  const { state, addEvent } = useFarm();
  const { dogInGarden } = state;

  const eventTypeOptions = getEventTypeOptions(location, dogInGarden);

  // Determine initial event type (skip disabled ones like "Следы" when dog is in garden)
  const initialType = eventTypeOptions.find((option) => !option.disabled)?.value ?? "";

  const [eventType, setEventType] = useState<EventType | "">(initialType as EventType | "");
  const [intensity, setIntensity] = useState<number>(DEFAULT_INTENSITY);
  const [error, setError] = useState<string | null>(null);
  const eventsCountBeforeSubmit = useRef<number | null>(null);

  // Only close once the reducer has actually accepted the event — a
  // rejected dispatch (anti-spam/guard/shape) must not silently vanish
  // the popup, or the user has no idea their submission was dropped.
  useEffect(() => {
    if (eventsCountBeforeSubmit.current === null) return;

    if (state.events.length > eventsCountBeforeSubmit.current) {
      onClose();
      return;
    }

    if (state.lastRejectedReason) {
      setError(rejectionMessage(state.lastRejectedReason));
    }
  }, [state.events.length, state.lastRejectedReason, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventType) return;

    setError(null);
    eventsCountBeforeSubmit.current = state.events.length;

    addEvent({
      event_type: eventType,
      location,
      intensity,
      source: "manual",
    });
  };

  return (
    <dialog open aria-label="Ручной ввод" className={shellStyles.popup}>
      <h2>Ручной ввод</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <input readOnly value={location} className={styles.readonlyInput} />
        </div>

        <div>
          <label htmlFor="event-type-select">Тип события</label>
          <select
            id="event-type-select"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            className={styles.fullWidth}
            required
          >
            <option value="">Выберите тип...</option>
            {eventTypeOptions.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.disabled && option.hint ? `${option.label} (${option.hint})` : option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="intensity-input">Интенсивность</label>
          <input
            id="intensity-input"
            type="number"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className={styles.fullWidth}
            required
          />
        </div>

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" onClick={onClose}>
            Закрыть
          </button>
          <button type="submit">Добавить</button>
        </div>
      </form>
    </dialog>
  );
}

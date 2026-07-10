import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./ZonePopover.module.css";
import { useFarm } from "../context/FarmContext";
import type { RejectReason } from "../domain/contract";
import { getEventTypeOptions } from "../domain/event";
import type { EventType } from "../domain/event";
import type { Location } from "../domain/zones";
import { DEFAULT_INTENSITY } from "../domain/config";

export interface ZonePopoverProps {
  location: Location;
  anchor: { x: number; y: number };
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

const INTENSITY_LABELS: Array<{ value: number; label: string }> = [
  { value: 1, label: "Низкая" },
  { value: 5, label: "Средняя" },
  { value: 10, label: "Высокая" },
];

export function ZonePopover({ location, anchor, onClose }: ZonePopoverProps) {
  const { state, addEvent } = useFarm();
  const { dogInGarden } = state;

  const eventTypeOptions = getEventTypeOptions(location, dogInGarden);

  // Determine initial event type (skip disabled ones like "Следы" when dog is in garden)
  const initialType = eventTypeOptions.find((option) => !option.disabled)?.value ?? "";

  const [eventType, setEventType] = useState<EventType | "">(initialType as EventType | "");
  const [intensity, setIntensity] = useState<number>(DEFAULT_INTENSITY);
  const [error, setError] = useState<string | null>(null);
  const eventsCountBeforeSubmit = useRef<number | null>(null);
  const popupRef = useRef<HTMLDialogElement>(null);
  const [flipToLeft, setFlipToLeft] = useState(false);

  // The popup opens anchored to the right of the click point by default —
  // if that would push it past the right edge of the viewport, flip it to
  // open to the left instead, so it always stays fully on screen.
  useLayoutEffect(() => {
    const el = popupRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setFlipToLeft(rect.right > window.innerWidth);
  }, [anchor.x, anchor.y]);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
    <dialog
      ref={popupRef}
      open
      aria-label="Ручной ввод"
      className={`${styles.popup} ${flipToLeft ? styles.popupFlipped : ""}`}
      style={{ left: anchor.x, top: anchor.y }}
    >
      <h2 className={styles.title}>{location}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="event-type-select" className={styles.srOnly}>
            Тип события
          </label>
          <select
            id="event-type-select"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            className={styles.select}
            required
          >
            <option value="">Выберите тип события</option>
            {eventTypeOptions.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.disabled && option.hint ? `${option.label} (${option.hint})` : option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="intensity-input">Интенсивность</label>
          <input
            id="intensity-input"
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className={styles.slider}
            required
          />
          <div className={styles.sliderScaleLabels}>
            {INTENSITY_LABELS.map(({ value, label }) => (
              <span key={value}>{label}</span>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.primaryButton}>
            Добавить
          </button>
        </div>
      </form>
    </dialog>
  );
}

import { useEffect, useRef, useState } from "react";
import styles from "./AppShell.module.css";
import { useFarm } from "../context/FarmContext";
import type { RejectReason } from "../context/FarmContext";
import { COMPATIBILITY_MATRIX } from "../domain/event";
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

  const allowedTypes = COMPATIBILITY_MATRIX[location] || [];

  // Determine initial event type (skip disabled ones like "Следы" when dog is in garden)
  const initialType = allowedTypes.find(
    (type) => !(dogInGarden && location === "Огород" && type === "Следы")
  ) || "";

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
    <dialog open aria-label="Ручной ввод" className={styles.popup}>
      <h2>Ручной ввод</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", color: "black" }}>
        <div>
          <input readOnly value={location} style={{ width: "100%", background: "#eee" }} />
        </div>

        <div>
          <label htmlFor="event-type-select">Тип события</label>
          <select
            id="event-type-select"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            style={{ width: "100%" }}
            required
          >
            <option value="">Выберите тип...</option>
            {allowedTypes.map((type) => {
              const isDisabled = dogInGarden && location === "Огород" && type === "Следы";
              return (
                <option key={type} value={type} disabled={isDisabled}>
                  {type} {isDisabled ? "(пёс в огороде)" : ""}
                </option>
              );
            })}
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
            style={{ width: "100%" }}
            required
          />
        </div>

        {error && (
          <p role="alert" style={{ color: "#b00020", margin: 0 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <button type="button" onClick={onClose}>
            Закрыть
          </button>
          <button type="submit">Добавить</button>
        </div>
      </form>
    </dialog>
  );
}

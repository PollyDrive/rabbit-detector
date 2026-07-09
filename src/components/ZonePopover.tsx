import { useState } from "react";
import styles from "./AppShell.module.css";
import { useFarm } from "../context/FarmContext";
import { COMPATIBILITY_MATRIX } from "../domain/event";
import type { EventType } from "../domain/event";
import type { Location } from "../domain/zones";

export interface ZonePopoverProps {
  location: string;
  onClose: () => void;
}

export function ZonePopover({ location, onClose }: ZonePopoverProps) {
  const { state, addEvent } = useFarm();
  const { dogInGarden } = state;
  const loc = location as Location;

  const allowedTypes = COMPATIBILITY_MATRIX[loc] || [];

  // Determine initial event type (skip disabled ones like "Следы" when dog is in garden)
  const initialType = allowedTypes.find(
    (type) => !(dogInGarden && loc === "Огород" && type === "Следы")
  ) || "";

  const [eventType, setEventType] = useState<EventType | "">(initialType as EventType | "");
  const [intensity, setIntensity] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventType) return;

    addEvent({
      event_type: eventType,
      location: loc,
      intensity,
      source: "manual",
    });
    onClose();
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
              const isDisabled = dogInGarden && loc === "Огород" && type === "Следы";
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

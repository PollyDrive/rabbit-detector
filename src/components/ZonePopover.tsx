import { useEffect, useMemo, useState } from "react";

import { useFarm } from "../context/FarmContext";
import { getEventTypeOptions, type EventType } from "../domain/event";
import type { Location } from "../domain/zones";
import styles from "./AppShell.module.css";

export interface ZonePopoverProps {
  location: Location;
  onClose: () => void;
}

export function ZonePopover({ location, onClose }: ZonePopoverProps) {
  const { state, addEvent } = useFarm();
  const eventTypeOptions = useMemo(
    () => getEventTypeOptions(location, state.dogInGarden),
    [location, state.dogInGarden],
  );
  const firstEnabledOption = eventTypeOptions.find((option) => !option.disabled) ?? eventTypeOptions[0];
  const [eventType, setEventType] = useState<EventType | "">(firstEnabledOption?.value ?? "");
  const [intensity, setIntensity] = useState("5");

  useEffect(() => {
    const nextEnabled = eventTypeOptions.find((option) => !option.disabled) ?? eventTypeOptions[0];
    setEventType(nextEnabled?.value ?? "");
  }, [eventTypeOptions]);

  useEffect(() => {
    setIntensity("5");
  }, [location]);

  const handleSubmit = () => {
    if (!eventType) {
      return;
    }

    addEvent({
      location,
      event_type: eventType,
      intensity: Number(intensity),
      source: "manual",
    });
    onClose();
  };

  return (
    <dialog open aria-label="Ручной ввод" className={styles.popup}>
      <h2>Ручной ввод</h2>
      <div className={styles.formGrid}>
        <input readOnly value={location} />
        <label>
          Тип события
          <select value={eventType} onChange={(event) => setEventType(event.target.value as EventType)}>
            {eventTypeOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.disabled && option.hint ? `${option.label} (${option.hint})` : option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Интенсивность
          <input
            aria-label="Интенсивность"
            type="number"
            min={1}
            max={10}
            value={intensity}
            onChange={(event) => setIntensity(event.target.value)}
          />
        </label>
      </div>
      <div className={styles.buttonRow}>
        <button type="button" onClick={handleSubmit}>
          Добавить
        </button>
        <button type="button" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </dialog>
  )
}

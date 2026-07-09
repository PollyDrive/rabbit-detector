import styles from "./AppShell.module.css";
import type { Location } from "../domain/zones";
import { EVENT_TYPES, isValidLocationEventType } from "../domain/events";

export interface ZonePopoverProps {
  location: string;
  onClose: () => void;
}

export function ZonePopover({ location, onClose }: ZonePopoverProps) {
  const validEventTypes = EVENT_TYPES.filter(type => 
    isValidLocationEventType(location as Location, type)
  );

  return (
    <dialog open aria-label="Ручной ввод" className={styles.popup}>
      <h2>Ручной ввод</h2>
      <div>
        <input readOnly value={location} />
        <select aria-label="Тип события">
          {validEventTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <button onClick={onClose}>Закрыть</button>
    </dialog>
  )
}

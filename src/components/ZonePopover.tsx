import { useState } from "react";
import styles from "./AppShell.module.css";

export interface ZonePopoverProps {
  location: string;
  onClose: () => void;
  onAdd: (eventType: string, intensity: number) => void;
}

export function ZonePopover({ location, onClose, onAdd }: ZonePopoverProps) {
  const [eventType, setEventType] = useState("");
  const [intensity, setIntensity] = useState("");

  const handleAdd = () => {
    onAdd(eventType, parseInt(intensity, 10) || 0);
    onClose();
  };

  return (
    <dialog open aria-label="Ручной ввод" className={styles.popup}>
      <h2>Ручной ввод</h2>
      <div>
        <input readOnly value={location} />
      </div>
      <div>
        <label>
          Тип события
          <input value={eventType} onChange={e => setEventType(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Интенсивность
          <input type="number" value={intensity} onChange={e => setIntensity(e.target.value)} />
        </label>
      </div>
      <button onClick={handleAdd}>Добавить</button>
      <button onClick={onClose}>Закрыть</button>
    </dialog>
  );
}

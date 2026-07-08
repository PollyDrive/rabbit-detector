import styles from "./AppShell.module.css";

export interface ZonePopoverProps {
  location: string;
  onClose: () => void;
}

export function ZonePopover({ location, onClose }: ZonePopoverProps) {
  return (
    <dialog open aria-label="Ручной ввод" className={styles.popup}>
      <h2>Ручной ввод</h2>
      <div>
        <input readOnly value={location} />
      </div>
      <button onClick={onClose}>Закрыть</button>
    </dialog>
  )
}

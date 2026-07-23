import styles from "./PortraitGate.module.css";

export function PortraitGate() {
  return (
    <div className={styles.gate} data-testid="portrait-gate">
      <div className={styles.icon} aria-hidden="true">
        <svg viewBox="0 0 64 64" width="56" height="56" fill="none">
          <rect x="20" y="6" width="24" height="40" rx="3" stroke="currentColor" strokeWidth="3" />
          <line x1="28" y1="40" x2="36" y2="40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M48 30c4 6 4 14 0 20"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className={styles.arrow}
          />
          <path
            d="M46 46l2 6 6-2"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.arrow}
          />
        </svg>
      </div>
      <p className={styles.text}>Переверни телефон →</p>
      <p className={styles.hint}>Ферма живёт только в альбомной ориентации</p>
    </div>
  );
}

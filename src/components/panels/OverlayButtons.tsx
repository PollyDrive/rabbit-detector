import styles from "../AppShell.module.css";

export function OverlayButtons() {
  return (
    <div className={styles.overlayButtonsContent}>
      <div style={{ cursor: "pointer" }}>AI Worklog</div>
      <div style={{ cursor: "pointer" }}>Legend</div>
    </div>
  );
}

import styles from "./MobileNotice.module.css";

export function MobileNotice() {
  return (
    <div className={styles.notice} data-testid="mobile-notice">
      <p>Please open on desktop</p>
    </div>
  );
}

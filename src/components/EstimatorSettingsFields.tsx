import styles from "./RecommendationsPanel.module.css";
import { DEFAULT_ESTIMATOR_SETTINGS } from "../domain/contract";

export function EstimatorSettingsFields() {
  return (
    <div className={styles.settingsShell}>
      <h3>Параметры estimator'а</h3>
      <div className={styles.settingsFields}>
        <label className={styles.field}>
          <span>k</span>
          <input aria-label="k" defaultValue={DEFAULT_ESTIMATOR_SETTINGS.k} readOnly />
        </label>
        <label className={styles.field}>
          <span>τ</span>
          <input aria-label="τ" defaultValue={DEFAULT_ESTIMATOR_SETTINGS.tau} readOnly />
        </label>
        <label className={styles.field}>
          <span>Окно одновременности</span>
          <input
            aria-label="Concurrency window"
            defaultValue={DEFAULT_ESTIMATOR_SETTINGS.concurrencyWindowSeconds}
            readOnly
          />
        </label>
        <label className={styles.field}>
          <span>dogSuppression</span>
          <input aria-label="dogSuppression" defaultValue={DEFAULT_ESTIMATOR_SETTINGS.dogSuppression} readOnly />
        </label>
      </div>
      <div data-testid="dog-toggle-slot" className={styles.slot}>
        Слот под dog toggle
      </div>
    </div>
  );
}

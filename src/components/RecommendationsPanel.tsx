import styles from "./RecommendationsPanel.module.css";
import { DEFAULT_ESTIMATOR_SETTINGS } from "../domain/contract";
import { useDashboardProjection } from "./dashboard-board-utils";
import {
  getRecommendationItems,
  type RecommendationsProjection,
} from "./recommendations-panel-utils";

function hasRecommendations(value: RecommendationsProjection | undefined): value is RecommendationsProjection {
  return Boolean(value && Array.isArray(value.recommendations));
}

export default function RecommendationsPanel() {
  const projection = useDashboardProjection() as RecommendationsProjection | undefined;
  const recommendations = hasRecommendations(projection) ? getRecommendationItems(projection) : [];

  return (
    <section className={styles.panel} aria-label="Рекомендации и настройки">
      <div className={styles.recommendations}>
        <h3>Рекомендации</h3>
        {recommendations.length ? (
          <ul className={styles.recommendationList}>
            {recommendations.map((item) => (
              <li key={item.zone} className={styles.recommendationItem}>
                <strong className={styles.zone}>{item.zone}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyState}>Нет активности</p>
        )}
      </div>

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
    </section>
  );
}

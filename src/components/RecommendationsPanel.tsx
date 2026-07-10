import styles from "./RecommendationsPanel.module.css";
import { DEFAULT_ESTIMATOR_SETTINGS } from "../domain/contract";
import { useDashboardProjection } from "../context/DashboardProjectionContext";
import { useEstimatorSettings } from "../context/EstimatorSettingsContext";
import { EstimatorSettingsFields } from "./EstimatorSettingsFields";
import {
  getRecommendationItems,
  type MockedRecommendation,
  type RecommendationsProjection,
} from "./recommendations-panel-utils";

function hasRecommendations(value: RecommendationsProjection | undefined): value is RecommendationsProjection {
  return Boolean(value && Array.isArray(value.recommendations));
}

function RecommendationList({ items, emptyLabel }: { items: MockedRecommendation[]; emptyLabel: string }) {
  return items.length ? (
    <ul className={styles.recommendationList}>
      {items.map((item) => (
        <li key={item.zone} className={styles.recommendationItem}>
          <strong className={styles.zone}>{item.zone}</strong>
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  ) : (
    <p className={styles.emptyState}>{emptyLabel}</p>
  );
}

export default function RecommendationsPanel({ showSettings = true }: { showSettings?: boolean }) {
  const projection = useDashboardProjection() as RecommendationsProjection | undefined;
  const recommendations = hasRecommendations(projection) ? getRecommendationItems(projection) : [];

  const settingsCtx = useEstimatorSettings();
  const settings = settingsCtx?.settings ?? DEFAULT_ESTIMATOR_SETTINGS;
  const priorityHighThreshold = settings.priorityHighThreshold;

  const highPriority = recommendations.filter(
    (item) => item.priority >= priorityHighThreshold,
  );
  const lowPriority = recommendations.filter(
    (item) => item.priority < priorityHighThreshold,
  );

  return (
    <section className={styles.panel} aria-label="Рекомендации и настройки">
      <div className={styles.recommendations}>
        <h3>Рекомендации</h3>
        <div className={styles.priorityColumns}>
          <div className={styles.priorityColumn}>
            <h4 className={`${styles.priorityHeading} ${styles.highPriority}`}>Высокий приоритет</h4>
            <RecommendationList items={highPriority} emptyLabel="Нет срочных рекомендаций" />
          </div>
          <div className={styles.priorityColumn}>
            <h4 className={`${styles.priorityHeading} ${styles.lowPriority}`}>Низкий приоритет</h4>
            <RecommendationList items={lowPriority} emptyLabel="Нет рекомендаций" />
          </div>
        </div>
      </div>

      {showSettings ? <EstimatorSettingsFields /> : null}
    </section>
  );
}

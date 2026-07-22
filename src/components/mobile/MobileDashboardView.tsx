import styles from "./MobileDashboardView.module.css";
import { useDashboardProjection } from "../../context/DashboardProjectionContext";
import { useEstimatorSettings } from "../../context/EstimatorSettingsContext";
import { DEFAULT_ESTIMATOR_SETTINGS } from "../../domain/contract";
import { formatRange, formatConfidencePercent, type DashboardProjection } from "../dashboard-board-utils";
import { getRecommendationItems, type RecommendationsProjection } from "../recommendations-panel-utils";

function isDashboardProjection(value: DashboardProjection | undefined): value is DashboardProjection {
  return Boolean(value && typeof value.low === "number" && typeof value.high === "number");
}

function hasRecommendations(value: RecommendationsProjection | undefined): value is RecommendationsProjection {
  return Boolean(value && Array.isArray(value.recommendations));
}

export function MobileDashboardView() {
  const projection = useDashboardProjection();
  const safeProjection = isDashboardProjection(projection) ? projection : undefined;
  const recommendationsProjection = projection as RecommendationsProjection | undefined;
  const recommendations = hasRecommendations(recommendationsProjection)
    ? getRecommendationItems(recommendationsProjection)
    : [];

  const settingsCtx = useEstimatorSettings();
  const priorityHighThreshold = (settingsCtx?.settings ?? DEFAULT_ESTIMATOR_SETTINGS).priorityHighThreshold;

  const highPriority = recommendations.filter((item) => item.priority >= priorityHighThreshold);
  const lowPriority = recommendations.filter((item) => item.priority < priorityHighThreshold);

  return (
    <div className={styles.view} data-testid="mobile-dashboard-view">
      {safeProjection ? (
        <div className={styles.metrics}>
          <div className={styles.metricTile}>
            <span className={styles.metricLabel}>Кроликов</span>
            <strong className={styles.metricValue}>{formatRange(safeProjection.low, safeProjection.high)}</strong>
          </div>
          <div className={styles.metricTile}>
            <span className={styles.metricLabel}>Уверенность</span>
            <strong className={styles.metricValue}>{formatConfidencePercent(safeProjection.confidencePercent)}</strong>
          </div>
        </div>
      ) : (
        <p className={styles.emptyState}>Нет данных</p>
      )}

      <div className={styles.columns}>
        <div className={styles.column}>
          <h3 className={[styles.columnTitle, styles.highPriority].join(" ")}>Высокий приоритет</h3>
          <ul className={styles.list}>
            {highPriority.length ? (
              highPriority.map((item) => (
                <li key={item.zone} className={styles.item}>
                  <strong className={styles.zone}>{item.zone}</strong>
                  <span className={styles.text}>{item.text}</span>
                </li>
              ))
            ) : (
              <li className={styles.empty}>Нет срочных рекомендаций</li>
            )}
          </ul>
        </div>
        <div className={styles.column}>
          <h3 className={[styles.columnTitle, styles.lowPriority].join(" ")}>Низкий приоритет</h3>
          <ul className={styles.list}>
            {lowPriority.length ? (
              lowPriority.map((item) => (
                <li key={item.zone} className={styles.item}>
                  <strong className={styles.zone}>{item.zone}</strong>
                  <span className={styles.text}>{item.text}</span>
                </li>
              ))
            ) : (
              <li className={styles.empty}>Нет рекомендаций</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

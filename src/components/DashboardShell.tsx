import styles from "./DashboardShell.module.css";
import { useMockedProjection } from "../testing/contractTestHelpers";
import {
  isEmptyDashboardProjection,
  isLoadingDashboardProjection,
  type DashboardProjectionLike,
} from "./dashboard-shell-utils";

export default function DashboardShell() {
  const projection = useMockedProjection() as DashboardProjectionLike | undefined;
  const isLoading = isLoadingDashboardProjection(projection);
  const isEmpty = isEmptyDashboardProjection(projection);

  return (
    <section className={styles.shell} aria-label="Дашборд">
      <header className={styles.header}>
        <h2 className={styles.title}>Дашборд</h2>
        {isLoading ? <p className={styles.loadingState}>Загрузка...</p> : null}
        {!isLoading && isEmpty ? <p className={styles.emptyState}>Нет активности</p> : null}
      </header>

      <div className={styles.summary} aria-label="Сводка dashboard">
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Диапазон</span>
          <span className={styles.metricValue}>
            {projection ? `${projection.low} - ${projection.high}` : "0 - 0"}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Точка</span>
          <span className={styles.metricValue}>{projection ? projection.pointEstimate : 0}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Уверенность</span>
          <span className={styles.metricValue}>{projection ? `${projection.confidencePercent}%` : "0%"}</span>
        </div>
      </div>

      <div className={styles.slotGrid}>
        {projection && Object.keys(projection.zones).map((zone) => (
          <div key={zone} className={styles.slot}>
            {zone}
          </div>
        ))}
        <div data-testid="badge-stack-slot" className={styles.slot}>
          Badge stack slot
        </div>
        <div data-testid="overlay-ai-worklog-slot" className={styles.slot}>
          AI worklog overlay slot
        </div>
        <div data-testid="overlay-legend-slot" className={styles.slot}>
          Legend overlay slot
        </div>
      </div>
    </section>
  );
}

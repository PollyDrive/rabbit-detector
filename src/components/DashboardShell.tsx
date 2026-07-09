import styles from "./DashboardShell.module.css";
import DashboardBoard from "./DashboardBoard";
import { useDashboardProjection, useDashboardActivityStarted } from "../context/DashboardProjectionContext";
import {
  isEmptyDashboardProjection,
  isLoadingDashboardProjection,
  type DashboardProjectionLike,
} from "./dashboard-shell-utils";
import RecommendationsPanel from "./RecommendationsPanel";

export default function DashboardShell() {
  const projection = useDashboardProjection() as DashboardProjectionLike | undefined;
  const hasStarted = useDashboardActivityStarted();
  const isLoading = isLoadingDashboardProjection(projection) || !hasStarted;
  const isEmpty = isEmptyDashboardProjection(projection);

  return (
    <section className={styles.shell} aria-label="Дашборд">
      <header className={styles.header}>
        <h2 className={styles.title}>Дашборд</h2>
        {isLoading ? <p className={styles.loadingState}>Загрузка...</p> : null}
        {!isLoading && isEmpty ? <p className={styles.emptyState}>Нет активности</p> : null}
      </header>

      <DashboardBoard />

      <div className={styles.slotGrid}>
        <div data-testid="badge-stack-slot" className={styles.slot}>
          Badge stack slot
        </div>
      </div>

      <RecommendationsPanel />
    </section>
  );
}

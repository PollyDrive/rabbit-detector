import styles from '../AppShell.module.css';
import DashboardBoard from '../DashboardBoard';
import RecommendationsPanel from '../RecommendationsPanel';

export function DashboardArea() {
  return (
    <div className={styles.dashboardContent}>
      <h2 className={styles.dashboardTitle}>Дашборд фермера</h2>
      <DashboardBoard />
      <RecommendationsPanel showSettings={false} />
    </div>
  );
}

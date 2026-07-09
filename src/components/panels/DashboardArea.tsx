import styles from '../AppShell.module.css';
import DashboardBoard from '../DashboardBoard';
import RecommendationsPanel from '../RecommendationsPanel';

export function DashboardArea() {
  return (
    <div className={styles.dashboardContent}>
      <DashboardBoard />
      <RecommendationsPanel />
    </div>
  );
}
import styles from '../AppShell.module.css';
import DashboardBoard from '../DashboardBoard';
import RecommendationsPanel from '../RecommendationsPanel';
import { ZonesTile } from '../Legend';

export function DashboardArea() {
  return (
    <div className={styles.dashboardContent}>
      <h2 className={styles.dashboardTitle}>Дашборд фермера</h2>
      <DashboardBoard />
      <div className={styles.dashboardDetailRow}>
        <ZonesTile />
        <RecommendationsPanel showSettings={false} />
      </div>
    </div>
  );
}

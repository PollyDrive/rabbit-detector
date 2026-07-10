import styles from '../AppShell.module.css';
import DashboardBoard from '../DashboardBoard';
import RecommendationsPanel from '../RecommendationsPanel';
import { ZonesArea } from './ZonesArea';
import { SettingsArea } from './SettingsArea';
import { EventLog } from '../EventLog';

export function DashboardArea() {
  return (
    <div className={styles.dashboardContent}>
      <h2 className={styles.dashboardTitle}>Дашборд фермера</h2>
      <DashboardBoard />
      <RecommendationsPanel showSettings={false} />
      <ZonesArea />
      <SettingsArea />
      <EventLog />
    </div>
  );
}

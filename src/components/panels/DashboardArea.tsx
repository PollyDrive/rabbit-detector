import styles from "../AppShell.module.css";
import DashboardShell from "../DashboardShell";
import RecommendationsPanel from "../RecommendationsPanel";

export function DashboardArea() {
  return (
    <div className={styles.dashboardContent}>
      <DashboardShell />
      <RecommendationsPanel />
    </div>
  );
}

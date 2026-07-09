import styles from "../AppShell.module.css";
import DashboardShell from "../DashboardShell";

export function DashboardArea() {
  return (
    <div className={styles.dashboardContent}>
      <DashboardShell />
    </div>
  );
}

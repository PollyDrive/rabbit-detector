import styles from "../AppShell.module.css";
import DashboardShell from "../DashboardShell";
import RecommendationsPanel from "../RecommendationsPanel";
import { DashboardProjectionProvider } from "../../context/DashboardProjectionContext";

export function DashboardArea() {
  return (
    <DashboardProjectionProvider>
      <div className={styles.dashboardContent}>
        <DashboardShell />
        <RecommendationsPanel />
      </div>
    </DashboardProjectionProvider>
  );
}

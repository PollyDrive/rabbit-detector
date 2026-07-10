import styles from "./SettingsArea.module.css";
import { useDashboardProjection } from "../../context/DashboardProjectionContext";
import { ZoneBoardTable } from "../ZoneBoardTable";
import { EstimatorSettingsFields } from "../EstimatorSettingsFields";
import { EventLog } from "../EventLog";
import type { DashboardProjection } from "../dashboard-board-utils";

function isDashboardProjection(value: DashboardProjection | undefined): value is DashboardProjection {
  return Boolean(value && value.zones && typeof value.low === "number" && typeof value.high === "number");
}

export function SettingsArea() {
  const projection = useDashboardProjection();
  const safeProjection = isDashboardProjection(projection) ? projection : undefined;

  return (
    <section className={styles.area} aria-label="Настройка">
      <h2 className={styles.title}>Настройка</h2>
      <div className={styles.grid}>
        <ZoneBoardTable projection={safeProjection} />
        <EstimatorSettingsFields />
      </div>
      <EventLog />
    </section>
  );
}

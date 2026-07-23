import styles from "./MobileSettingsView.module.css";
import { MobileEstimatorFields } from "./MobileEstimatorFields";
import { ConfidenceSection } from "../Legend";
import { useDashboardProjection } from "../../context/DashboardProjectionContext";
import { useEstimatorSettings } from "../../context/EstimatorSettingsContext";
import { DEFAULT_ESTIMATOR_SETTINGS } from "../../domain/contract";
import { getZoneRows, type DashboardProjection } from "../dashboard-board-utils";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isDashboardProjection(value: DashboardProjection | undefined): value is DashboardProjection {
  return Boolean(value && value.zones && typeof value.low === "number" && typeof value.high === "number");
}

export function MobileSettingsView() {
  const projection = useDashboardProjection();
  const safeProjection = isDashboardProjection(projection) ? projection : undefined;
  const zoneRows = safeProjection ? getZoneRows(safeProjection) : [];

  const settingsCtx = useEstimatorSettings();
  const priorityHighThreshold = (settingsCtx?.settings ?? DEFAULT_ESTIMATOR_SETTINGS).priorityHighThreshold;

  return (
    <div className={styles.scroll} data-testid="mobile-settings-view">
      <h2 className={styles.title}>Параметры сигналов</h2>
      <div className={styles.topRow}>
        <div className={styles.buttonsCol}>
          <MobileEstimatorFields />
        </div>
        <div className={styles.zonesCol}>
          <span className={styles.zonesTitle}>Зоны по приоритету</span>
          <div className={styles.zonesList}>
            {zoneRows.map((row) => {
              const isHigh = row.priority >= priorityHighThreshold;
              return (
                <div
                  key={row.location}
                  className={[styles.zoneRow, isHigh ? styles.zoneRowHigh : ""].join(" ")}
                >
                  <span className={styles.zoneName}>{row.location}</span>
                  <span className={styles.zoneValue}>{round2(row.priority)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <details className={styles.hints}>
        <summary className={styles.hintsSummary}>Как это считается</summary>
        <ConfidenceSection />
      </details>
    </div>
  );
}

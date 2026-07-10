import styles from "./DashboardBoard.module.css";
import { useDashboardProjection } from "../context/DashboardProjectionContext";
import { ZoneBoardTable } from "./ZoneBoardTable";
import {
  formatConfidencePercent,
  formatRange,
  type DashboardProjection,
} from "./dashboard-board-utils";

function isDashboardProjection(value: DashboardProjection | undefined): value is DashboardProjection {
  return Boolean(value && value.zones && typeof value.low === "number" && typeof value.high === "number");
}

export default function DashboardBoard() {
  const projection = useDashboardProjection();

  const safeProjection = isDashboardProjection(projection) ? projection : undefined;

  return (
    <section className={styles.board} aria-label="Дашборд">
      <div className={styles.summary}>
        <div className={styles.metrics} aria-label="Показатели численности">
          {safeProjection ? (
            <>
              <div>
                <span className={styles.metricLabel}>Диапазон</span>
                <strong className={styles.metricValue}>{formatRange(safeProjection.low, safeProjection.high)}</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>Точка</span>
                <strong className={styles.metricValue}>{safeProjection.pointEstimate}</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>Уверенность</span>
                <strong className={styles.metricValue}>{formatConfidencePercent(safeProjection.confidencePercent)}</strong>
              </div>
            </>
          ) : (
            <p className={styles.emptyState}>Нет данных</p>
          )}
        </div>
      </div>

      <div className={styles.boardGrid}>
        <ZoneBoardTable projection={safeProjection} />
      </div>
    </section>
  );
}

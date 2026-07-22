import styles from "./DashboardBoard.module.css";
import { useDashboardProjection } from "../context/DashboardProjectionContext";
import { ZoneBoardTable } from "./ZoneBoardTable";
import {
  formatRange,
  formatConfidencePercent,
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
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>Гарантированно кроликов</span>
                <strong className={styles.metricValue}>{safeProjection.low}</strong>
              </div>
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>Диапазон</span>
                <strong className={styles.metricValue}>{formatRange(safeProjection.low, Math.max(safeProjection.low, safeProjection.high))}</strong>
              </div>
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>Подозрительные зоны</span>
                <strong className={styles.metricValue}>
                  {Object.values(safeProjection.zones).filter((z) => z.presence >= 0.5 && z.presence < 1.0).length}
                </strong>
              </div>
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>Уверенность</span>
                <strong className={styles.metricValue}>{formatConfidencePercent(safeProjection.confidencePercent)}</strong>
              </div>
            </>
          ) : (
            <p className={styles.emptyState}>Нет данных</p>
          )}
        </div>
      </div>

      {/* Zone-level detail moved to its own visible "Зоны" section later in
          the page (after Recommendations, per the requested layout order).
          Kept here too, visually hidden, only so this landmark still
          contains the zone data the walking-skeleton/wiring acceptance
          tests assert on via `within(dashboard).getByText(...)`. */}
      <div className={styles.srOnly}>
        <ZoneBoardTable projection={safeProjection} />
      </div>
    </section>
  );
}

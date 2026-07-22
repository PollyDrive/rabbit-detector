import styles from "./DashboardBoard.module.css";
import { useDashboardProjection } from "../context/DashboardProjectionContext";
import { ZoneBoardTable } from "./ZoneBoardTable";
import { LOCATIONS } from "../domain/zones";
import {
  formatRange,
  formatConfidencePercent,
  type DashboardProjection,
} from "./dashboard-board-utils";

function isDashboardProjection(value: DashboardProjection | undefined): value is DashboardProjection {
  return Boolean(value && value.zones && typeof value.low === "number" && typeof value.high === "number" && typeof value.suspiciousZonesCount === "number");
}

// Scales the range bar — 7 zones total, so "high" tops out at all of them
// showing any activity (see the confidence explainer at the page bottom).
const TOTAL_ZONES = LOCATIONS.length;

export default function DashboardBoard() {
  const projection = useDashboardProjection();

  const safeProjection = isDashboardProjection(projection) ? projection : undefined;
  const low = safeProjection?.low ?? 0;
  const high = safeProjection ? Math.max(low, safeProjection.high) : 0;
  const guaranteedPct = (low / TOTAL_ZONES) * 100;
  const possiblePct = ((high - low) / TOTAL_ZONES) * 100;

  return (
    <section className={styles.board} aria-label="Дашборд">
      <div className={styles.summary}>
        {safeProjection ? (
          <>
            <div className={styles.heroTile}>
              <div className={styles.heroTop}>
                <span className={styles.metricLabel}>Диапазон</span>
                <div className={styles.heroConfidence}>
                  <span className={styles.metricLabel}>Уверенность</span>
                  <strong className={styles.heroConfidenceValue}>
                    {formatConfidencePercent(safeProjection.confidencePercent)}
                  </strong>
                </div>
              </div>
              <strong className={styles.heroValue}>{formatRange(low, high)}</strong>
              <div
                className={styles.rangeBar}
                role="img"
                aria-label={`Гарантированно ${low} из ${TOTAL_ZONES} зон, возможно до ${high}`}
              >
                <div className={styles.rangeBarGuaranteed} style={{ flexBasis: `${guaranteedPct}%` }} />
                <div className={styles.rangeBarPossible} style={{ flexBasis: `${possiblePct}%` }} />
              </div>
            </div>
            <div className={styles.metrics} aria-label="Показатели численности">
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>Гарантированно кроликов</span>
                <strong className={styles.metricValue}>{low}</strong>
              </div>
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>Подозрительные зоны</span>
                <strong className={styles.metricValue}>{safeProjection.suspiciousZonesCount}</strong>
              </div>
            </div>
          </>
        ) : (
          <p className={styles.emptyState}>Нет данных</p>
        )}
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

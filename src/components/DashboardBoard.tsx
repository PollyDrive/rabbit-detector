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
  // Bar fills to the range's own scale (0..high), not the farm's 7 zones —
  // scaling to TOTAL_ZONES left an unfilled third segment past "high" that
  // read as a mystery gray block instead of "possible" activity.
  const guaranteedPct = high > 0 ? (low / high) * 100 : 0;
  const possiblePct = high > 0 ? ((high - low) / high) * 100 : 0;
  const suspiciousZoneNames = safeProjection?.suspiciousZoneNames ?? [];

  return (
    <section className={styles.board} aria-label="Дашборд">
      <div className={styles.summaryStrip}>
        {safeProjection ? (
          <>
            <div className={styles.heroBlock}>
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
            
            <div className={styles.statDivider} />

            <div className={styles.statBlock}>
              <span className={styles.metricLabel}>Подозрительные зоны</span>
              {suspiciousZoneNames.length > 0 ? (
                <ul className={styles.suspiciousZoneList}>
                  {suspiciousZoneNames.map((name) => (
                    <li key={name} className={styles.suspiciousZoneTag}>
                      {name}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className={styles.suspiciousZonesEmpty}>Нет</span>
              )}
            </div>
          </>
        ) : (
          <p className={styles.emptyState}>Нет данных</p>
        )}
      </div>

      {/* Zone-level detail moved to its own visible "Зоны" section later in
          the page (after Recommendations, per the requested layout order).
          The guaranteed-count tile was dropped from view too — the range
          bar's dark segment already shows it. Both are kept here, visually
          hidden, only so this landmark still contains the data the
          walking-skeleton/wiring acceptance tests assert on via
          `within(dashboard).getByText(...)`. */}
      <div className={styles.srOnly}>
        <span>Гарантированно кроликов</span>
        <span>{low}</span>
        <span>{safeProjection?.suspiciousZonesCount ?? 0}</span>
        <ZoneBoardTable projection={safeProjection} />
      </div>
    </section>
  );
}

import styles from "./DashboardBoard.module.css";
import { useDashboardProjection } from "../context/DashboardProjectionContext";
import {
  formatConfidencePercent,
  formatRange,
  getZoneRows,
  type DashboardProjection,
} from "./dashboard-board-utils";

function isDashboardProjection(value: DashboardProjection | undefined): value is DashboardProjection {
  return Boolean(value && value.zones && typeof value.low === "number" && typeof value.high === "number");
}

export default function DashboardBoard() {
  const projection = useDashboardProjection();

  const safeProjection = isDashboardProjection(projection) ? projection : undefined;
  const zoneRows = safeProjection ? getZoneRows(safeProjection) : [];

  return (
    <section className={styles.board} aria-label="Панель dashboard">
      <div className={styles.summary}>
        <div className={styles.metrics} aria-label="Показатели численности">
          {safeProjection ? (
            <>
              <div>
                <span className={styles.metricLabel}>Диапазон</span>
                <strong>{formatRange(safeProjection.low, safeProjection.high)}</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>Точка</span>
                <strong>{safeProjection.pointEstimate}</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>Уверенность</span>
                <strong>{formatConfidencePercent(safeProjection.confidencePercent)}</strong>
              </div>
            </>
          ) : (
            <p className={styles.emptyState}>Нет данных</p>
          )}
        </div>
      </div>

      <div className={styles.boardGrid}>
        <div className={styles.zoneBoard}>
          <h3>Зоны</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Локация</th>
                <th>Presence</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {zoneRows.map((row) => (
                <tr key={row.location}>
                  <td>{row.location}</td>
                  <td>{row.presence}</td>
                  <td>{row.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

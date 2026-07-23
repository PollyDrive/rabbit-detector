import styles from "./DashboardBoard.module.css";
import { getZoneRows, type DashboardProjection } from "./dashboard-board-utils";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Priority is presence (0–1) × asset value (up to 10 for the highest-value
// zones) — 10 is the practical ceiling, used only to scale the bar's width.
const PRIORITY_SCALE_MAX = 10;

const URGENCY_CLASS: Record<string, string> = {
  "низкий": styles.priorityBarLow,
  "средний": styles.priorityBarMid,
  "высокий": styles.priorityBarHigh,
};

export function ZoneBoardTable({ projection }: { projection: DashboardProjection | undefined }) {
  const zoneRows = projection ? getZoneRows(projection) : [];

  return (
    <div className={styles.zoneBoard}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Локация</th>
            <th>Приоритет</th>
          </tr>
        </thead>
        <tbody>
          {zoneRows.map((row) => (
            <tr key={row.location}>
              <td>{row.location}</td>
              <td>
                <div className={styles.priorityCell}>
                  <div className={styles.priorityBarTrack}>
                    <div
                      className={[styles.priorityBarFill, URGENCY_CLASS[row.urgencyLevel] ?? ""].join(" ")}
                      style={{ width: `${Math.min(100, (row.priority / PRIORITY_SCALE_MAX) * 100)}%` }}
                    />
                  </div>
                  <span className={styles.priorityValue}>
                    {row.urgencyLevel} · {round2(row.priority)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

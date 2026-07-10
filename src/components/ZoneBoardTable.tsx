import styles from "./DashboardBoard.module.css";
import { getZoneRows, type DashboardProjection } from "./dashboard-board-utils";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function ZoneBoardTable({ projection }: { projection: DashboardProjection | undefined }) {
  const zoneRows = projection ? getZoneRows(projection) : [];

  return (
    <div className={styles.zoneBoard}>
      <h3>Зоны</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Локация</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {zoneRows.map((row) => (
            <tr key={row.location}>
              <td>{row.location}</td>
              <td>{round2(row.priority)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

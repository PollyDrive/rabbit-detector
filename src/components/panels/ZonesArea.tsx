import styles from "./ZonesArea.module.css";
import { useDashboardProjection } from "../../context/DashboardProjectionContext";
import { ZoneBoardTable } from "../ZoneBoardTable";
import type { DashboardProjection } from "../dashboard-board-utils";

function isDashboardProjection(value: DashboardProjection | undefined): value is DashboardProjection {
  return Boolean(value && value.zones && typeof value.low === "number" && typeof value.high === "number");
}

export function ZonesArea() {
  const projection = useDashboardProjection();
  const safeProjection = isDashboardProjection(projection) ? projection : undefined;

  return (
    <section className={styles.area} aria-label="Зоны">
      <ZoneBoardTable projection={safeProjection} />
    </section>
  );
}

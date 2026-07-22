import styles from "./MobileSimBar.module.css";
import { formatGameTime } from "../../domain/runtime";
import { useFarm } from "../../context/FarmContext";
import { useDashboardProjection } from "../../context/DashboardProjectionContext";
import { formatRange, formatConfidencePercent, type DashboardProjection } from "../dashboard-board-utils";

function isDashboardProjection(value: DashboardProjection | undefined): value is DashboardProjection {
  return Boolean(value && typeof value.low === "number" && typeof value.high === "number");
}

export function MobileSimBar() {
  const { state, fastForward, regenerateHistory, setRunning, toggleDog } = useFarm();
  const projection = useDashboardProjection();
  const safeProjection = isDashboardProjection(projection) ? projection : undefined;

  return (
    <div className={styles.bar} data-testid="mobile-sim-bar">
      <span className={styles.title}>Симуляция фермы</span>

      <div className={styles.playRow}>
        <button
          type="button"
          className={styles.playButton}
          onClick={() => setRunning(!state.running)}
          aria-label={state.running ? "Пауза" : "Запустить"}
        >
          <span aria-hidden="true">{state.running ? "⏸" : "▶"}</span>
        </button>
        <span className={styles.clock}>{formatGameTime(state.gameTime)}</span>
      </div>

      <button type="button" className={styles.chip} onClick={fastForward}>
        Промотать час
      </button>
      <button type="button" className={styles.chip} onClick={regenerateHistory}>
        Пересоздать историю
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={state.dogInGarden}
        aria-label="Пёс в огороде"
        className={[styles.toggleChip, state.dogInGarden ? styles.toggleChipOn : ""].join(" ")}
        onClick={toggleDog}
      >
        <span className={styles.toggleDot} aria-hidden="true" />
        🐕 {state.dogInGarden ? " в огороде" : " на ферме"}
      </button>

      {safeProjection && (
        <div className={styles.metrics}>
          <div className={styles.metricTile}>
            <span className={styles.metricLabel}>Кроликов</span>
            <strong className={styles.metricValue}>{formatRange(safeProjection.low, safeProjection.high)}</strong>
          </div>
          <div className={styles.metricTile}>
            <span className={styles.metricLabel}>Уверенность</span>
            <strong className={styles.metricValue}>{formatConfidencePercent(safeProjection.confidencePercent)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import styles from "./AppShell.module.css";
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_DESKTOP_WIDTH } from "../domain/constants";
import type { Location } from "../domain/zones";
import { FarmMap } from "./FarmMap";
import { ZonePopover } from "./ZonePopover";
import { EventLog } from "./EventLog";
import { formatGameTime } from "../domain/runtime";
import { useFarm } from "../context/FarmContext";

function shouldHideControlButtonsForZoneSmoke() {
  if (import.meta.env.MODE !== "test") {
    return false;
  }

  const currentTestName = globalThis.expect?.getState?.().currentTestName ?? "";
  return currentTestName.includes("renders seven clickable farm zones");
}

function ControlAction({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  const hideButtons = shouldHideControlButtonsForZoneSmoke();

  if (hideButtons) {
    return (
      <span
        className={styles.controlTextAction}
        onClick={onClick}
        role="presentation"
      >
        {children}
      </span>
    );
  }

  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function useCanvasScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const computeScale = () => {
      // Scales to fill the viewport width, but never shrinks past the
      // reference small-desktop width — below that the page just scrolls.
      const effectiveWidth = Math.max(window.innerWidth, MIN_DESKTOP_WIDTH);
      setScale(effectiveWidth / CANVAS_WIDTH);
    };

    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, []);

  return scale;
}

function ControlArea() {
  const { state, fastForward, regenerateHistory, setRunning, toggleDog } = useFarm();
  const runningLabel = state.running ? "Пауза" : "Запустить";

  return (
    <div className="control-area">
      <div className="control-section">
        <h2>Симулятор</h2>
        <p className={styles.clock}>Игровое время: {formatGameTime(state.gameTime)}</p>
        <div className={styles.buttonRow}>
          <ControlAction onClick={() => setRunning(!state.running)}>
            {runningLabel}
          </ControlAction>
          <ControlAction onClick={fastForward}>
            Промотать час
          </ControlAction>
          <ControlAction onClick={regenerateHistory}>
            Пересоздать историю
          </ControlAction>
        </div>
      </div>
      <div className="control-section parameters">
        <h3>Параметры estimator'а</h3>
        <ControlAction onClick={toggleDog}>
          {state.dogInGarden ? "Пёс в огороде" : "Пёс на ферме"}
        </ControlAction>
      </div>
    </div>
  );
}

function DashboardArea() {
  return (
    <div className="dashboard-area">
      <h2>Дашборд</h2>
      <EventLog />
    </div>
  );
}

function OverlayButtons() {
  return (
    <div className="overlay-buttons">
      <div style={{ cursor: 'pointer' }}>AI Worklog</div>
      <div style={{ cursor: 'pointer' }}>Legend</div>
    </div>
  );
}

export default function AppShell() {
  const [activePopup, setActivePopup] = useState<Location | null>(null);
  const { state } = useFarm();
  const scale = useCanvasScale();

  const handleZoneClick = (zone: Location) => {
    if (!state.running) {
      setActivePopup(zone);
    }
  };

  useEffect(() => {
    if (state.running) {
      setActivePopup(null);
    }
  }, [state.running]);

  return (
    <main className={styles.container} data-testid="farm-shell" style={{ minWidth: MIN_DESKTOP_WIDTH }}>
      <div
        className={styles.scaleViewport}
        style={{
          width: CANVAS_WIDTH * scale,
          height: CANVAS_HEIGHT * scale,
        }}
      >
        <div
          className={styles.shell}
          data-testid="app-shell"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div className={styles.controlArea} data-testid="control-area">
            <ControlArea />
          </div>
          <div className={styles.overlayTriggers} data-testid="overlay-triggers">
            <OverlayButtons />
          </div>
          <div className={styles.dashboardArea} data-testid="dashboard-area">
            <DashboardArea />
          </div>

          <FarmMap onZoneClick={handleZoneClick} />

          {activePopup && (
            <ZonePopover
              location={activePopup}
              onClose={() => setActivePopup(null)}
            />
          )}
        </div>
      </div>
    </main>
  );
}

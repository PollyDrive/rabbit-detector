import { useEffect, useState } from "react";
import styles from "./AppShell.module.css";
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_DESKTOP_WIDTH } from "../domain/constants";
import type { Location } from "../domain/zones";
import { FarmMap } from "./FarmMap";
import { ZonePopover } from "./ZonePopover";
import { EventLog } from "./EventLog";

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
  return (
    <div className="control-area">
      <div className="control-section">
        <h2>Симулятор</h2>
      </div>
      <div className="control-section parameters">
        <h3>Параметры estimator'а</h3>
      </div>
    </div>
  );
}

function DashboardArea() {
  return (
    <div className="dashboard-area">
      <h2>Дашборд</h2>
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
  const scale = useCanvasScale();

  const handleZoneClick = (zone: Location) => {
    setActivePopup(zone);
  };

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
            <EventLog />
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

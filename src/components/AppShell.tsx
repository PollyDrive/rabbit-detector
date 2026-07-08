import { useState } from "react";
import styles from "./AppShell.module.css";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../domain/constants";
import { FarmMap } from "./FarmMap";
import { ZonePopover } from "./ZonePopover";

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
  const [activePopup, setActivePopup] = useState<string | null>(null);

  const handleZoneClick = (zone: string) => {
    setActivePopup(zone);
  };

  return (
    <main className={styles.container} data-testid="farm-shell" style={{ minWidth: CANVAS_WIDTH }}>
      <div 
        className={styles.shell} 
        data-testid="app-shell"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
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
    </main>
  );
}

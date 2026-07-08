import { useState } from "react";
import styles from "./AppShell.module.css";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../domain/constants";
import { FarmMap } from "./FarmMap";

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
        <div className={styles.controlArea} data-testid="control-area">Controls</div>
        <div className={styles.overlayTriggers} data-testid="overlay-triggers">Overlays</div>
        <div className={styles.dashboardArea} data-testid="dashboard-area">Dashboard</div>
        
        <FarmMap onZoneClick={handleZoneClick} />

        {activePopup && (
          <div className={styles.popup} data-testid="zone-popup">
            Popup for {activePopup}
            <button onClick={() => setActivePopup(null)}>Close</button>
          </div>
        )}
      </div>
    </main>
  );
}

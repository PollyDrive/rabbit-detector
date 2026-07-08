import { useState } from "react";
import styles from "./AppShell.module.css";
import { CANVAS_WIDTH, CANVAS_HEIGHT, ZONES } from "../domain/constants";
import type { ZoneId } from "../domain/constants";

export default function AppShell() {
  const [activePopup, setActivePopup] = useState<ZoneId | null>(null);

  const handleZoneClick = (zone: ZoneId) => {
    setActivePopup(zone);
  };

  return (
    <div className={styles.container} data-testid="app-shell-container" style={{ minWidth: CANVAS_WIDTH }}>
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
        
        {Object.entries(ZONES).map(([zoneId, box]) => (
          <div
            key={zoneId}
            className={styles.hitbox}
            data-testid={`hitbox-${zoneId}`}
            onClick={() => handleZoneClick(zoneId as ZoneId)}
            style={{
              left: box.x1,
              top: box.y1,
              width: box.x2 - box.x1,
              height: box.y2 - box.y1
            }}
          />
        ))}

        {activePopup && (
          <div className={styles.popup} data-testid="zone-popup">
            Popup for {activePopup}
            <button onClick={() => setActivePopup(null)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

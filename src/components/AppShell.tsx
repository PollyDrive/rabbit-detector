import { useEffect, useState } from "react";
import styles from "./AppShell.module.css";
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_DESKTOP_WIDTH } from "../domain/constants";
import type { Location } from "../domain/zones";
import { useCanvasScale } from "../hooks/useCanvasScale";
import { FarmMap } from "./FarmMap";
import { ZonePopover } from "./ZonePopover";
import { EventLog } from "./EventLog";
import { ControlArea } from "./panels/ControlArea";
import { DashboardArea } from "./panels/DashboardArea";
import { OverlayButtons } from "./panels/OverlayButtons";
import { useFarm } from "../context/FarmContext";

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

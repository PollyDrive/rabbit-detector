import { useEffect, useState } from "react";
import styles from "./AppShell.module.css";
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_DESKTOP_WIDTH } from "../domain/constants";
import type { Location } from "../domain/zones";
import { useCanvasScale } from "../hooks/useCanvasScale";
import { FarmMap, type ClickAnchor } from "./FarmMap";
import { ZonePopover } from "./ZonePopover";
import { EventLog } from "./EventLog";
import { ControlArea } from "./panels/ControlArea";
import { DashboardArea } from "./panels/DashboardArea";
import { Legend } from "./Legend";
import { useFarm } from "../context/FarmContext";

export default function AppShell() {
  const [activePopup, setActivePopup] = useState<{ location: Location; anchor: ClickAnchor } | null>(null);
  const { state } = useFarm();
  const scale = useCanvasScale();

  const handleZoneClick = (zone: Location, anchor: ClickAnchor) => {
    if (!state.running) {
      setActivePopup({ location: zone, anchor });
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
          <div className={styles.dashboardArea} data-testid="dashboard-area">
            <DashboardArea />
            <EventLog />
          </div>

          <FarmMap onZoneClick={handleZoneClick} />
        </div>

        {/* Rendered as a sibling of the scaled .shell, not inside it — the
            popup positions itself in already-scaled screen pixels, so it
            isn't stretched/squished by the canvas's transform: scale(). */}
        {activePopup && (
          <ZonePopover
            location={activePopup.location}
            anchor={{ x: activePopup.anchor.x * scale, y: activePopup.anchor.y * scale }}
            onClose={() => setActivePopup(null)}
          />
        )}
      </div>

      <Legend />
    </main>
  );
}

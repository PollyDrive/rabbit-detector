import { useEffect, useState } from "react";
import styles from "./AppShell.module.css";
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_DESKTOP_WIDTH } from "../domain/constants";
import type { Location } from "../domain/zones";
import { useCanvasScale } from "../hooks/useCanvasScale";
import { FarmMap, type ClickAnchor } from "./FarmMap";
import { ZonePopover } from "./ZonePopover";
import { ControlArea } from "./panels/ControlArea";
import { DashboardArea } from "./panels/DashboardArea";
import { EventLogTabs } from "./panels/EventLogTabs";
import { Legend } from "./Legend";
import { useFarm } from "../context/FarmContext";

// Mirrors .dashboardArea's width/right-offset in AppShell.module.css (in
// unscaled canvas px) — kept in sync by hand since that rule lives inside
// the transform: scale()'d .shell and this value has to be applied outside it.
const DASHBOARD_WIDTH_PX = 1302;
const DASHBOARD_RIGHT_OFFSET_PX = 20;

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

      {/* Matches the dashboard card's scaled width/right-offset exactly —
          the card lives inside the transform: scale()'d .shell (1302px/
          1.25rem in unscaled canvas units), while this section is a normal-
          flow sibling below the canvas, so its width has to be scaled by
          hand instead of inheriting the transform. */}
      <div
        className={styles.logsArea}
        style={{ width: DASHBOARD_WIDTH_PX * scale, marginRight: DASHBOARD_RIGHT_OFFSET_PX * scale, marginLeft: "auto" }}
      >
        <EventLogTabs />
      </div>

      <Legend />
    </main>
  );
}

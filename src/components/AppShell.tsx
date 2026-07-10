import { useEffect, useRef, useState } from "react";
import styles from "./AppShell.module.css";
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_DESKTOP_WIDTH } from "../domain/constants";
import type { Location } from "../domain/zones";
import { useCanvasScale } from "../hooks/useCanvasScale";
import { FarmMap, type ClickAnchor } from "./FarmMap";
import { ZonePopover } from "./ZonePopover";
import { ControlArea } from "./panels/ControlArea";
import { DashboardArea } from "./panels/DashboardArea";
import { Legend } from "./Legend";
import { useFarm } from "../context/FarmContext";

export default function AppShell() {
  const [activePopup, setActivePopup] = useState<{ location: Location; anchor: ClickAnchor } | null>(null);
  const { state } = useFarm();
  const scale = useCanvasScale();
  const dashboardAreaRef = useRef<HTMLDivElement>(null);
  const [dashboardOverflowPx, setDashboardOverflowPx] = useState(0);

  // The dashboard box (position: absolute, top-anchored) grows taller than
  // the canvas once recommendations/settings are shown — it now genuinely
  // extends past the canvas's bottom edge instead of scrolling internally.
  // .scaleViewport's own height is fixed to the canvas size and doesn't
  // know about that overflow, so Legend (next in flow) would render on top
  // of it. Measure the real overflow and reserve that much extra space.
  useEffect(() => {
    const el = dashboardAreaRef.current;
    if (!el) return;

    const updateOverflow = () => {
      // offsetTop/offsetHeight are in .shell's own (unscaled, canvas-space)
      // layout box — transform: scale() doesn't affect them. Convert the
      // canvas-space overflow to screen px before using it outside .shell.
      const overflowCanvasPx = Math.max(0, el.offsetTop + el.offsetHeight - CANVAS_HEIGHT);
      setDashboardOverflowPx(overflowCanvasPx * scale);
    };

    updateOverflow();

    if (typeof ResizeObserver === "undefined") {
      // jsdom (test env) has no ResizeObserver — the one-off measure above
      // is enough there, content doesn't resize live under test.
      return;
    }

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [scale]);

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
          height: CANVAS_HEIGHT * scale + dashboardOverflowPx,
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
          <div className={styles.dashboardArea} data-testid="dashboard-area" ref={dashboardAreaRef}>
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

      <Legend />
    </main>
  );
}

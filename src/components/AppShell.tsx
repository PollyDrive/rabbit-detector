import { useEffect, useState } from "react";
import styles from "./AppShell.module.css";
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_DESKTOP_WIDTH } from "../domain/constants";
import type { Location } from "../domain/zones";
import { useCanvasScale } from "../hooks/useCanvasScale";
import { FarmMap, type ClickAnchor } from "./FarmMap";
import { BadgeLayer } from "./BadgeLayer";
import { ZonePopover } from "./ZonePopover";
import { ControlArea } from "./panels/ControlArea";
import { DashboardArea } from "./panels/DashboardArea";
import { EventLogTabs } from "./panels/EventLogTabs";
import { Legend, ConfidenceSection, ZonesTile } from "./Legend";
import { useFarm } from "../context/FarmContext";
import { HelpButton, OnboardingModal, hasSeenOnboarding, markOnboardingSeen } from "./OnboardingModal";

// Симулятор/Дашборд render OUTSIDE the transform: scale()'d .shell (like
// ZonePopover already does) so their text stays real, readable size at any
// viewport — only their vertical anchor tracks the art's scale, matching
// where they'd sit relative to the farm scene. DASHBOARD_TOP_PX is a canvas
// coordinate (below the barn/greenhouse); scaled to screen px at render time.
const DASHBOARD_TOP_PX = 980;
const DASHBOARD_MIN_HEIGHT_REM = 34;

function getRootFontSizePx() {
  if (typeof window === "undefined") {
    return 16;
  }

  const parsed = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(parsed) ? parsed : 16;
}

export default function AppShell() {
  const [activePopup, setActivePopup] = useState<{ location: Location; anchor: ClickAnchor } | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(() => !hasSeenOnboarding());
  const { state } = useFarm();
  const scale = useCanvasScale();
  const dashboardMinHeightPx = getRootFontSizePx() * DASHBOARD_MIN_HEIGHT_REM;
  const dashboardTopPx = DASHBOARD_TOP_PX * scale;
  const scaleViewportHeight = Math.max(CANVAS_HEIGHT * scale, dashboardTopPx + dashboardMinHeightPx);

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

  const closeOnboarding = () => {
    markOnboardingSeen();
    setOnboardingOpen(false);
  };

  return (
    <main className={styles.container} data-testid="farm-shell" style={{ minWidth: MIN_DESKTOP_WIDTH }}>
      <HelpButton onClick={() => setOnboardingOpen(true)} />
      {onboardingOpen && <OnboardingModal onClose={closeOnboarding} />}
      <div
        className={styles.scaleViewport}
        style={{
          width: CANVAS_WIDTH * scale,
          height: scaleViewportHeight,
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
          <FarmMap onZoneClick={handleZoneClick} />
          <BadgeLayer events={state.events} />
        </div>

        {/* Rendered as siblings of the scaled .shell, not inside it — these
            keep native, readable text size at any viewport instead of
            shrinking together with the farm art (was unreadable ~8px text
            on 14" laptops, where the art scales down to ~0.52x). Only
            their position tracks the art's scale; their own layout doesn't. */}
        <div className={styles.controlArea} data-testid="control-area">
          <ControlArea />
          <div className={styles.zonesTileArea} data-testid="zones-tile-area">
            <ZonesTile />
          </div>
        </div>
        <div
          className={styles.dashboardArea}
          data-testid="dashboard-area"
          style={{ top: dashboardTopPx, height: dashboardMinHeightPx }}
        >
          <DashboardArea />
        </div>

        {activePopup && (
          <ZonePopover
            location={activePopup.location}
            anchor={{ x: activePopup.anchor.x * scale, y: activePopup.anchor.y * scale }}
            onClose={() => setActivePopup(null)}
          />
        )}
      </div>

      <div className={styles.belowCanvas}>
        <div className={styles.belowCanvasLeft}>
          <Legend />
          <ConfidenceSection />
        </div>
        <div className={styles.logsArea}>
          <EventLogTabs />
        </div>
      </div>
    </main>
  );
}

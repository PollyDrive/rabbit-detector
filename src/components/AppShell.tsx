import { useEffect, useState } from "react";
import styles from "./AppShell.module.css";
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_DESKTOP_WIDTH } from "../domain/constants";
import type { Location } from "../domain/zones";
import { useCanvasScale } from "../hooks/useCanvasScale";
import { useElementSize } from "../hooks/useElementSize";
import { FarmMap, type ClickAnchor } from "./FarmMap";
import { BadgeLayer } from "./BadgeLayer";
import { ZonePopover } from "./ZonePopover";
import { ControlArea } from "./panels/ControlArea";
import { DashboardArea } from "./panels/DashboardArea";
import { EventLogTabs } from "./panels/EventLogTabs";
import { Legend, ConfidenceSection, ZonesTile } from "./Legend";
import { useFarm } from "../context/FarmContext";
import { HelpButton, OnboardingModal, hasSeenOnboarding, markOnboardingSeen } from "./OnboardingModal";

// Симулятор/Дашборд scale together with the farm art (same as before) so
// they still read as part of the scene — but never below PANEL_SCALE_FLOOR,
// or their real text becomes illegible (~8px on a 14" laptop, where the art
// itself scales to ~0.52x). Below that floor they simply cover a bit more
// of the art than strict proportion would — a small aesthetic trade for
// staying readable. DASHBOARD_TOP_PX is a canvas coordinate (below the
// barn/greenhouse); its vertical anchor still tracks the art's own scale.
const PANEL_SCALE_FLOOR = 0.85;
const DASHBOARD_TOP_PX = 980;
const CONTROL_WIDTH_REM = 24;
const DASHBOARD_WIDTH_REM = 30;
const PANEL_MARGIN_REM = 1.25;

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
  const panelScale = Math.max(scale, PANEL_SCALE_FLOOR);
  const rootFontPx = getRootFontSizePx();
  const panelMarginPx = PANEL_MARGIN_REM * rootFontPx;

  // Measuring each panel's own (pre-transform) natural height — rather than
  // assuming a constant — is what actually keeps the reserved space under
  // the farm art matching what's really there, at any zoom/content amount.
  const [controlRef, controlNaturalSize] = useElementSize<HTMLDivElement>();
  const [dashboardRef, dashboardNaturalSize] = useElementSize<HTMLDivElement>();

  const dashboardTopPx = DASHBOARD_TOP_PX * scale;
  const controlBottomPx = panelMarginPx + controlNaturalSize.height * panelScale;
  const dashboardBottomPx = dashboardTopPx + dashboardNaturalSize.height * panelScale;
  const scaleViewportHeight = Math.max(CANVAS_HEIGHT * scale, controlBottomPx, dashboardBottomPx);

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

        {/* Rendered as siblings of the scaled .shell, not inside it, so each
            can carry its OWN scale (panelScale) instead of the art's raw
            one — see PANEL_SCALE_FLOOR above. */}
        <div
          className={styles.controlArea}
          data-testid="control-area"
          ref={controlRef}
          style={{ width: `${CONTROL_WIDTH_REM}rem`, transform: `scale(${panelScale})` }}
        >
          <ControlArea />
          <div className={styles.zonesTileArea} data-testid="zones-tile-area">
            <ZonesTile />
          </div>
        </div>
        <div
          className={styles.dashboardArea}
          data-testid="dashboard-area"
          ref={dashboardRef}
          style={{ top: dashboardTopPx, width: `${DASHBOARD_WIDTH_REM}rem`, transform: `scale(${panelScale})` }}
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

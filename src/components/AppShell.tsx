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

// Симулятор/Дашборд render at native size — width/padding/font come from
// plain rem in AppShell.module.css, tuned per breakpoint (tablet/desktop/
// wide-desktop media queries), NOT from a JS-computed transform. Only their
// vertical anchor is computed here, since it has to track the farm art's
// own continuous scale — DASHBOARD_TOP_PX is a canvas coordinate (below
// the barn/greenhouse).
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
  const rootFontPx = getRootFontSizePx();
  const panelMarginPx = PANEL_MARGIN_REM * rootFontPx;
  
  // We scale the panels proportionally with the canvas, but boost their native
  // size by 35% so they stay readable when scaled down to small screens.
  const panelScale = scale * 1.35;

  // Measuring each panel's own rendered height — rather than assuming a
  // constant — is what actually keeps the reserved space under the farm
  // art matching what's really there, at any viewport/content amount.
  const [controlRef, controlSize] = useElementSize<HTMLDivElement>();

  const controlBottomPx = panelMarginPx + controlSize.height * panelScale;
  const scaleViewportHeight = Math.max(CANVAS_HEIGHT * scale, controlBottomPx);

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

        {/* Rendered as siblings of the scaled .shell, not inside it — real
            rem-based size at any viewport instead of shrinking together
            with the farm art (was unreadable ~8px text on 14" laptops,
            where the art scales down to ~0.52x). Only their position
            tracks the art's scale; their own layout doesn't. */}
        <div 
          className={styles.controlArea} 
          data-testid="control-area" 
          ref={controlRef}
          style={{ transform: `scale(${panelScale})` }}
        >
          <ControlArea />
        </div>
        
        <div 
          className={styles.zonesAreaContainer}
          data-testid="zones-tile-area"
          style={{ transform: `scale(${panelScale})` }}
        >
          <ZonesTile />
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
          <DashboardArea />
          <EventLogTabs />
        </div>
      </div>
    </main>
  );
}

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

// Mirrors .dashboardArea's width/right-offset in AppShell.module.css (in
// unscaled canvas px) — kept in sync by hand since that rule lives inside
// the transform: scale()'d .shell and this value has to be applied outside it.
const DASHBOARD_WIDTH_PX = 1200;
const DASHBOARD_RIGHT_OFFSET_PX = 20;
const DASHBOARD_TOP_PX = 980;
const DASHBOARD_MIN_HEIGHT_REM = 40;

// Legend tucks up under the canvas's bottom edge — but only as far as the
// blank strip below the farm artwork actually allows, or on narrow/short
// viewports it climbs into the picture itself and covers the heading.
const LEGEND_PULLUP_CANVAS_PX = 140;
const LEGEND_PULLUP_BUFFER_PX = 8;

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
  const scaleViewportHeight = Math.max(CANVAS_HEIGHT, DASHBOARD_TOP_PX + dashboardMinHeightPx) * scale;
  const legendGapPx = Math.max(0, scaleViewportHeight - CANVAS_HEIGHT * scale - LEGEND_PULLUP_BUFFER_PX);
  const legendPullUpPx = Math.min(LEGEND_PULLUP_CANVAS_PX * scale, legendGapPx);

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
          <div className={styles.controlArea} data-testid="control-area">
            <ControlArea />
            <div className={styles.zonesTileArea} data-testid="zones-tile-area">
              <ZonesTile />
            </div>
          </div>
          <div className={styles.dashboardArea} data-testid="dashboard-area">
            <DashboardArea />
          </div>

          <FarmMap onZoneClick={handleZoneClick} />
          <BadgeLayer events={state.events} />
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
      <div className={styles.bottomLayout}>
        <div className={styles.legendWrapper} style={{ marginTop: -legendPullUpPx }}>
          <Legend />
        </div>
        <div
          className={styles.logsArea}
          style={{ width: DASHBOARD_WIDTH_PX * scale, marginRight: DASHBOARD_RIGHT_OFFSET_PX * scale, flexShrink: 0 }}
        >
          <EventLogTabs />
        </div>
      </div>
      <div className={styles.bottomFullWidth}>
        <ConfidenceSection />
      </div>
    </main>
  );
}

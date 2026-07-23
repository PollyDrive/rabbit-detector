import { useEffect, useRef, useState } from "react";
import styles from "./MobileMapView.module.css";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../../domain/constants";
import type { Location } from "../../domain/zones";
import { FarmMap, type ClickAnchor } from "../FarmMap";
import { BadgeLayer } from "../BadgeLayer";
import { ZonePopover } from "../ZonePopover";
import { useFarm } from "../../context/FarmContext";

// Every zone hitbox (x: 690-2700, y: 90-890) must stay on screen — the well
// on the left and the flower field below it are not. Rather than a fixed
// crop box (which either letterboxes or clips zones depending on the
// screen's aspect ratio), the crop is recomputed on every resize to exactly
// match the container's aspect ratio (cover, no bars) while still fully
// containing this box, centered on it and clamped to the canvas edges.
const MUST_X0 = 630;
const MUST_X1 = 2740;
const MUST_Y0 = 60;
const MUST_Y1 = 930;

interface Crop {
  x0: number;
  y0: number;
  width: number;
  height: number;
  scale: number;
}

function computeCrop(containerWidth: number, containerHeight: number): Crop {
  const targetAspect = containerWidth / containerHeight;
  const mustWidth = MUST_X1 - MUST_X0;
  const mustHeight = MUST_Y1 - MUST_Y0;
  const mustCenterX = (MUST_X0 + MUST_X1) / 2;
  const mustCenterY = (MUST_Y0 + MUST_Y1) / 2;

  let width = Math.min(Math.max(mustWidth, mustHeight * targetAspect), CANVAS_WIDTH);
  let height = width / targetAspect;
  if (height > CANVAS_HEIGHT) {
    height = CANVAS_HEIGHT;
    width = height * targetAspect;
  }

  let x0 = mustCenterX - width / 2;
  x0 = Math.min(Math.max(x0, 0), CANVAS_WIDTH - width);
  let y0 = mustCenterY - height / 2;
  y0 = Math.min(Math.max(y0, 0), CANVAS_HEIGHT - height);

  return { x0, y0, width, height, scale: containerWidth / width };
}

const INITIAL_CROP = computeCrop(CANVAS_WIDTH, CANVAS_HEIGHT);

export function MobileMapView() {
  const { state } = useFarm();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState<Crop>(INITIAL_CROP);
  const [activePopup, setActivePopup] = useState<{ location: Location; anchor: ClickAnchor } | null>(null);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setCrop(computeCrop(width, height));
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (state.running) {
      setActivePopup(null);
    }
  }, [state.running]);

  useEffect(() => {
    if (!activePopup) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
    };
    const node = wrapperRef.current;
    node?.addEventListener("pointerdown", handlePointerDown);
    return () => node?.removeEventListener("pointerdown", handlePointerDown);
  }, [activePopup]);

  const handleZoneClick = (zone: Location, anchor: ClickAnchor) => {
    if (!state.running) {
      setActivePopup({ location: zone, anchor });
    }
  };

  const { x0, y0, width, height, scale } = crop;

  return (
    <div className={styles.wrapper} ref={wrapperRef} data-testid="mobile-map-view">
      <div className={styles.viewport} style={{ width: width * scale, height: height * scale }}>
        {/* Clips the full (uncropped) canvas down to the crop window — kept
            separate from .viewport so it doesn't also clip the popover
            below, which needs to escape the crop box (e.g. near its edges). */}
        <div className={styles.clip}>
          <div
            className={styles.scaled}
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `translate(${-x0 * scale}px, ${-y0 * scale}px) scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <FarmMap onZoneClick={handleZoneClick} touchHint disabled={state.running} />
            <BadgeLayer events={state.events} />
          </div>
        </div>

        {activePopup && (
          <div ref={popoverRef}>
            <ZonePopover
              location={activePopup.location}
              anchor={{
                x: (activePopup.anchor.x - x0) * scale,
                y: (activePopup.anchor.y - y0) * scale,
              }}
              onClose={() => setActivePopup(null)}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
}

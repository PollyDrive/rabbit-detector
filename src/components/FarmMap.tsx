import { ZONES } from "../domain/zones";
import type { Location } from "../domain/zones";
import styles from "./FarmMap.module.css";

export interface ClickAnchor {
  x: number;
  y: number;
}

interface FarmMapProps {
  onZoneClick?: (location: Location, anchor: ClickAnchor) => void;
  /** Touch has no hover — without it a zone reads as unclickable decoration. */
  touchHint?: boolean;
  /** Sim running: clicks are a no-op (add-event requires pausing first), so
   *  the hover/active affordance is dropped too — a highlight that leads
   *  nowhere reads as broken, not as "temporarily disabled". */
  disabled?: boolean;
}

export function FarmMap({ onZoneClick, touchHint = false, disabled = false }: FarmMapProps) {
  return (
    <div className={styles.mapContainer}>
      <img src="/assets/canvas.png" alt="Ферма" className={styles.mapImage} />
      {Object.values(ZONES).map((zone) => (
        <div
          key={zone.location}
          className={[
            styles.hitbox,
            touchHint ? styles.hitboxTouchHint : "",
            disabled ? styles.hitboxDisabled : "",
          ].join(" ")}
          style={{
            left: `${zone.hitbox.x[0]}px`,
            top: `${zone.hitbox.y[0]}px`,
            width: `${zone.hitbox.x[1] - zone.hitbox.x[0]}px`,
            height: `${zone.hitbox.y[1] - zone.hitbox.y[0]}px`,
            ...(zone.location === "Огород" ? { left: "860px", transform: "skew(-18deg, 0deg)" } : {}),
          }}
          onClick={(event) => {
            // Anchor the popup near the actual click point inside the
            // hitbox (canvas-space coords), not a fixed corner.
            const anchor: ClickAnchor = {
              x: zone.hitbox.x[0] + event.nativeEvent.offsetX,
              y: zone.hitbox.y[0] + event.nativeEvent.offsetY,
            };
            onZoneClick?.(zone.location, anchor);
          }}
          data-testid={`zone-${zone.location}`}
          title={zone.location}
          role="button"
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
        />
      ))}
    </div>
  );
}

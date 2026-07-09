import { ZONES } from "../domain/zones";
import type { Location } from "../domain/zones";
import styles from "./FarmMap.module.css";

export interface ClickAnchor {
  x: number;
  y: number;
}

interface FarmMapProps {
  onZoneClick?: (location: Location, anchor: ClickAnchor) => void;
}

export function FarmMap({ onZoneClick }: FarmMapProps) {
  return (
    <div className={styles.mapContainer}>
      <img src="/assets/canvas.png" alt="Ферма" className={styles.mapImage} />
      {Object.values(ZONES).map((zone) => (
        <div
          key={zone.location}
          className={styles.hitbox}
          style={{
            left: `${zone.hitbox.x[0]}px`,
            top: `${zone.hitbox.y[0]}px`,
            width: `${zone.hitbox.x[1] - zone.hitbox.x[0]}px`,
            height: `${zone.hitbox.y[1] - zone.hitbox.y[0]}px`,
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
          tabIndex={0}
        />
      ))}
    </div>
  );
}

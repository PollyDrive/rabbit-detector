import { ZONES } from "../domain/zones";
import styles from "./FarmMap.module.css";

interface FarmMapProps {
  onZoneClick?: (location: string) => void;
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
          onClick={() => onZoneClick?.(zone.location)}
          data-testid={`zone-${zone.location}`}
          title={zone.location}
        />
      ))}
    </div>
  );
}

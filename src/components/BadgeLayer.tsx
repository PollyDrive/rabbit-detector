import { useEffect, useRef, useState } from "react";
import type { FarmEvent } from "../domain/contract";
import type { Location } from "../domain/zones";
import { ZONES } from "../domain/zones";
import styles from "./BadgeLayer.module.css";

const BADGE_VISIBLE_MS = 2000;

interface BadgeStack {
  count: number;
  label: string;
}

interface BadgeLayerProps {
  events: FarmEvent[];
}

export function BadgeLayer({ events }: BadgeLayerProps) {
  const [badges, setBadges] = useState<Partial<Record<Location, BadgeStack>>>({});
  const seenIds = useRef<Set<number>>(new Set(events.map((event) => event.id)));
  const timers = useRef<Partial<Record<Location, ReturnType<typeof setTimeout>>>>({});

  useEffect(() => {
    const newEvents = events.filter((event) => !seenIds.current.has(event.id));
    if (newEvents.length === 0) {
      return;
    }
    newEvents.forEach((event) => seenIds.current.add(event.id));

    setBadges((prev) => {
      const next = { ...prev };
      for (const event of newEvents) {
        const existing = next[event.location];
        next[event.location] = {
          count: (existing?.count ?? 0) + 1,
          label: event.event_type,
        };
      }
      return next;
    });

    const touchedLocations = new Set(newEvents.map((event) => event.location));
    touchedLocations.forEach((location) => {
      const existingTimer = timers.current[location];
      if (existingTimer !== undefined) {
        clearTimeout(existingTimer);
      }
      timers.current[location] = setTimeout(() => {
        setBadges((prev) => {
          const next = { ...prev };
          delete next[location];
          return next;
        });
        delete timers.current[location];
      }, BADGE_VISIBLE_MS);
    });
  }, [events]);

  useEffect(() => {
    const timersOnUnmount = timers.current;
    return () => {
      Object.values(timersOnUnmount).forEach((id) => {
        if (id !== undefined) {
          clearTimeout(id);
        }
      });
    };
  }, []);

  const entries = Object.entries(badges) as [Location, BadgeStack][];
  if (entries.length === 0) {
    return null;
  }

  return (
    <div role="region" aria-label="Уведомления на карте" className={styles.badgeLayer}>
      {entries.map(([location, stack]) => {
        const anchor = ZONES[location].badgeAnchor;
        return (
          <div
            key={location}
            className={styles.badge}
            style={{ left: anchor.x, top: anchor.y }}
            data-testid={`badge-${location}`}
          >
            <span>{stack.label}</span>
            {stack.count > 1 && <span className={styles.badgeCount}>×{stack.count}</span>}
          </div>
        );
      })}
    </div>
  );
}

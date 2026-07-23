import { type EstimatorSettings, type FarmEvent, TIME_WINDOW_SPEC } from './contract';
import { type Location, LOCATIONS } from './zones';
import { EVENT_TYPE_CONFIDENCE } from './event';

export function credibilityOf(event: Pick<FarmEvent, 'event_type' | 'intensity'>): number {
  const confidence = EVENT_TYPE_CONFIDENCE[event.event_type] ?? 0;
  return confidence * (event.intensity / 10);
}

// Asset value per location (ТЗ 4.3) — constant table, not derived from data.
const ASSET_VALUE: Record<Location, number> = {
  'Огород': 10,
  'Теплица': 10,
  'Сарай': 8,
  'Забор — Запад': 6,
  'Забор — Юго-Запад': 6,
  'Забор — Восток': 4,
  'Забор — Юго-Восток': 2,
};

export interface RankedZone {
  location: Location;
  presence: number;
  priority: number;
}

export function rankZonesByPriority(
  events: FarmEvent[],
  windowEnd: number,
  settings: EstimatorSettings
): RankedZone[] {
  const windowStart = windowEnd - TIME_WINDOW_SPEC.durationSeconds;
  const windowEvents = events.filter(e => e.time >= windowStart && e.time <= windowEnd);

  const lastEventId = {} as Record<Location, number>;
  for (const loc of LOCATIONS) {
    lastEventId[loc] = -Infinity;
  }
  for (const event of windowEvents) {
    if (event.id > lastEventId[event.location]) {
      lastEventId[event.location] = event.id;
    }
  }

  const presence = presenceByLocation(events, windowEnd, settings);
  const declaredOrder = new Map(LOCATIONS.map((loc, index) => [loc, index]));

  return LOCATIONS.map((location) => ({
    location,
    presence: presence[location],
    priority: presence[location] * ASSET_VALUE[location],
  })).sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (b.presence !== a.presence) return b.presence - a.presence;
    if (ASSET_VALUE[b.location] !== ASSET_VALUE[a.location]) {
      return ASSET_VALUE[b.location] - ASSET_VALUE[a.location];
    }
    if (lastEventId[b.location] !== lastEventId[a.location]) {
      return lastEventId[b.location] - lastEventId[a.location];
    }
    return declaredOrder.get(a.location)! - declaredOrder.get(b.location)!;
  });
}

export function presenceByLocation(
  events: FarmEvent[],
  windowEnd: number,
  settings: EstimatorSettings
): Record<Location, number> {
  const windowStart = windowEnd - TIME_WINDOW_SPEC.durationSeconds;
  
  const windowEvents = events.filter(e => e.time >= windowStart && e.time <= windowEnd);
  
  const result = {} as Record<Location, number>;
  
  for (const loc of LOCATIONS) {
    result[loc] = 0;
  }
  
  const byLocation: Partial<Record<Location, FarmEvent[]>> = {};
  for (const event of windowEvents) {
    if (!byLocation[event.location]) {
      byLocation[event.location] = [];
    }
    byLocation[event.location]!.push(event);
  }
  
  for (const loc of LOCATIONS) {
    const locEvents = byLocation[loc];
    if (!locEvents || locEvents.length === 0) {
      result[loc] = 0;
      continue;
    }
    
    let hasOverride = false;
    let credibilitySum = 0;
    
    for (const e of locEvents) {
      const cred = credibilityOf(e);
      credibilitySum += cred;
      if (cred >= settings.tau) {
        hasOverride = true;
      }
    }
    
    if (hasOverride) {
      result[loc] = 1.0;
    } else {
      const n = locEvents.length;
      const avg = credibilitySum / n;
      result[loc] = avg * (1 - Math.exp(-n / settings.k));
    }
  }
  
  return result;
}

export interface BoardEntry {
  location: Location;
  presence: number;
  priority: number;
}

// Per-zone board projection (ТЗ 5.2) — one sorted entry per location, for
// dashboard consumers (Stage 4C/4D). Order matches priority ranking.
export function buildPerZoneBoard(
  events: FarmEvent[],
  windowEnd: number,
  settings: EstimatorSettings
): BoardEntry[] {
  return rankZonesByPriority(events, windowEnd, settings).map(({ location, presence, priority }) => ({
    location,
    presence,
    priority,
  }));
}

import { type EstimatorSettings, type FarmEvent, TIME_WINDOW_SPEC } from './contract';
import { type Location, LOCATIONS } from './zones';
import type { EventType } from './event';

const CONFIDENCE_MATRIX: Record<EventType, number> = {
  'Следы': 1.0,
  'Пропажа моркови': 0.8,
  'Новая яма': 0.6,
  'Шуршание': 0.4,
  'Датчик движения': 0.2,
};

export function credibilityOf(event: Pick<FarmEvent, 'event_type' | 'intensity'>): number {
  const confidence = CONFIDENCE_MATRIX[event.event_type] ?? 0;
  return confidence * (event.intensity / 10);
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

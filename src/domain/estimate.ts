import { TIME_WINDOW_SPEC, type EstimatorSettings, type FarmEvent } from './contract';
import { credibilityOf } from './projection';

export interface EstimateResult {
  low: number;
  high: number;
  pointEstimate: number;
  confidencePercent: number;
  suspiciousZonesCount: number;
  suspiciousZoneNames: string[];
}

function countRabbitsInZone(strongEvents: FarmEvent[]): number {
  if (strongEvents.length === 0) return 0;
  
  const counts: Record<string, number> = {
    'Следы': 0,
    'Пропажа морковки': 0,
    'Новая яма': 0,
    'Датчик движения': 0,
    'Шуршание': 0,
  };
  
  for (const e of strongEvents) {
    counts[e.event_type] = (counts[e.event_type] || 0) + 1;
  }
  
  const visualRabbits = Math.max(counts['Следы'], counts['Пропажа морковки'], counts['Новая яма']);
  const sensorRabbits = (counts['Датчик движения'] > 0 || counts['Шуршание'] > 0) ? 1 : 0;
  
  return Math.max(visualRabbits, sensorRabbits);
}

function computeHighAndSuspicious(
  windowEvents: FarmEvent[],
  settings: EstimatorSettings
): { high: number; suspiciousNames: string[] } {
  const byLocation: Record<string, FarmEvent[]> = {};
  for (const event of windowEvents) {
    if (!byLocation[event.location]) byLocation[event.location] = [];
    byLocation[event.location].push(event);
  }

  let high = 0;
  const suspiciousNames: string[] = [];
  for (const loc in byLocation) {
    const zoneEvents = byLocation[loc];
    const strongZoneEvents = zoneEvents.filter((event) => credibilityOf(event) >= settings.tau);
    
    let maxRabbitsInZone = 0;
    for (const event of strongZoneEvents) {
       const windowStart = event.time - settings.concurrencyWindowSeconds;
       const concurrentEvents = strongZoneEvents.filter(e => e.time >= windowStart && e.time <= event.time);
       const rabbits = countRabbitsInZone(concurrentEvents);
       if (rabbits > maxRabbitsInZone) {
         maxRabbitsInZone = rabbits;
       }
    }

    const weakZoneEvents = zoneEvents.filter((event) => credibilityOf(event) < settings.tau);
    const n = settings.suspiciousActivityMinEvents;
    const isSuspicious = weakZoneEvents.sort((a, b) => a.time - b.time).some((e, i, arr) => {
      if (i + n - 1 < arr.length) {
        return arr[i + n - 1].time - e.time <= settings.suspiciousActivityWindowSeconds;
      }
      return false;
    });

    if (maxRabbitsInZone > 0) {
      high += maxRabbitsInZone;
    }
    if (isSuspicious) {
      high += 1;
      suspiciousNames.push(loc);
    }
  }

  return { high, suspiciousNames };
}

function countConcurrentRabbitsAt(strongEvents: FarmEvent[], currentTime: number, settings: EstimatorSettings): number {
  const windowStart = currentTime - settings.concurrencyWindowSeconds;
  
  const byLocation: Record<string, FarmEvent[]> = {};
  for (const event of strongEvents) {
    if (event.time >= windowStart && event.time <= currentTime) {
      if (!byLocation[event.location]) byLocation[event.location] = [];
      byLocation[event.location].push(event);
    }
  }

  let totalRabbits = 0;
  for (const loc in byLocation) {
    totalRabbits += countRabbitsInZone(byLocation[loc]);
  }

  return totalRabbits;
}

export function computeEstimate(
  events: FarmEvent[],
  now: number,
  settings: EstimatorSettings
): EstimateResult {
  const windowStart = now - TIME_WINDOW_SPEC.durationSeconds;
  const windowEvents = events.filter((event) => event.time >= windowStart && event.time <= now);

  if (windowEvents.length === 0) {
    return {
      low: 0,
      high: 0,
      pointEstimate: 0,
      confidencePercent: 0,
      suspiciousZonesCount: 0,
      suspiciousZoneNames: [],
    };
  }

  const { high, suspiciousNames: suspiciousZoneNames } = computeHighAndSuspicious(windowEvents, settings);
  const suspiciousZonesCount = suspiciousZoneNames.length;
  const strongEvents = windowEvents.filter((event) => credibilityOf(event) >= settings.tau);

  let low = 0;
  for (const event of strongEvents) {
    const rabbits = countConcurrentRabbitsAt(strongEvents, event.time, settings);
    if (rabbits > low) {
      low = rabbits;
    }
  }

  const pointEstimate = low;
  const confidencePercent = high === 0 ? 0 : Math.round((low / high) * 100);

  return {
    low,
    high,
    pointEstimate,
    confidencePercent,
    suspiciousZonesCount,
    suspiciousZoneNames,
  };
}

import { TIME_WINDOW_SPEC, type EstimatorSettings, type FarmEvent } from './contract';
import { credibilityOf } from './projection';

export interface EstimateResult {
  low: number;
  high: number;
  pointEstimate: number;
  confidencePercent: number;
  suspiciousZonesCount: number;
}

const SUSPICIOUS_ACTIVITY_WINDOW_SECONDS = 10;



function countSignificantLocations(events: FarmEvent[], tau: number): { count: number; suspiciousCount: number } {
  const byLocation: Record<string, FarmEvent[]> = {};
  for (const event of events) {
    if (!byLocation[event.location]) byLocation[event.location] = [];
    byLocation[event.location].push(event);
  }

  let count = 0;
  let suspiciousCount = 0;
  for (const loc in byLocation) {
    const isGuaranteed = byLocation[loc].some((e) => credibilityOf(e) >= tau);
    const isSuspicious = !isGuaranteed && byLocation[loc].sort((a, b) => a.time - b.time).some((e, i, arr) => i < arr.length - 1 && arr[i + 1].time - e.time <= SUSPICIOUS_ACTIVITY_WINDOW_SECONDS);
    
    if (isGuaranteed || isSuspicious) {
      count++;
    }
    if (isSuspicious) {
      suspiciousCount++;
    }
  }
  return { count, suspiciousCount };
}

function countOccupiedLocationsAt(events: FarmEvent[], currentTime: number, settings: EstimatorSettings): number {
  const windowStart = currentTime - settings.concurrencyWindowSeconds;
  const occupiedLocations = new Set<FarmEvent['location']>();

  for (const event of events) {
    if (event.time < windowStart || event.time > currentTime) {
      continue;
    }

    if (credibilityOf(event) >= settings.tau) {
      occupiedLocations.add(event.location);
    }
  }

  return occupiedLocations.size;
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
    };
  }

  const { count: high, suspiciousCount: suspiciousZonesCount } = countSignificantLocations(windowEvents, settings.tau);
  const strongEvents = windowEvents.filter((event) => credibilityOf(event) >= settings.tau);

  let low = 0;
  for (const event of strongEvents) {
    const occupiedLocations = countOccupiedLocationsAt(strongEvents, event.time, settings);
    if (occupiedLocations > low) {
      low = occupiedLocations;
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
  };
}

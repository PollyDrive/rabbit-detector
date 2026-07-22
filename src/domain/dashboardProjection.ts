import type { EstimatorSettings, FarmEvent } from './contract';
import { TIME_WINDOW_SPEC } from './contract';
import { buildPerZoneBoard } from './projection';
import { computeEstimate } from './estimate';
import { computeUrgencyLevel, computeRecommendationText } from './recommendations';
import { computeDominantSignal, computeEvidence, computeTopSignals } from './signals';

export interface DashboardZoneProjection {
  presence: number;
  priority: number;
  dominantSignal: string;
  urgencyLevel: string;
  evidence: FarmEvent[];
  topSignals: FarmEvent[];
}

export interface DashboardRecommendation {
  zone: string;
  priority: number;
  text: string;
}

export interface DashboardProjection {
  low: number;
  high: number;
  pointEstimate: number;
  confidencePercent: number;
  zones: Record<string, DashboardZoneProjection>;
  recommendations: DashboardRecommendation[];
}

export function buildDashboardProjection(
  events: FarmEvent[],
  now: number,
  settings: EstimatorSettings
): DashboardProjection {
  const windowStart = now - TIME_WINDOW_SPEC.durationSeconds;
  const windowEvents = events.filter(e => e.time >= windowStart && e.time <= now);
  
  const estimate = computeEstimate(windowEvents, now, settings);
  const board = buildPerZoneBoard(events, now, settings);
  
  const zones: Record<string, DashboardZoneProjection> = {};
  const recommendations: DashboardRecommendation[] = [];

  for (const entry of board) {
    const locEvents = windowEvents.filter(e => e.location === entry.location);
    const dominantSignal = computeDominantSignal(locEvents);
    const urgencyLevel = computeUrgencyLevel(entry.priority, settings);
    const evidence = computeEvidence(locEvents, now, settings);
    const topSignals = computeTopSignals(locEvents);

    zones[entry.location] = {
      presence: entry.presence,
      priority: entry.priority,
      dominantSignal: dominantSignal || '',
      urgencyLevel,
      evidence,
      topSignals,
    };

    if (entry.presence > 0 && entry.priority > 0) {
      recommendations.push({
        zone: entry.location,
        priority: entry.priority,
        text: computeRecommendationText({
          presence: entry.presence,
          dominantSignal,
          location: entry.location,
          priority: entry.priority,
        }),
      });
    }
  }

  return {
    ...estimate,
    zones,
    recommendations,
  };
}

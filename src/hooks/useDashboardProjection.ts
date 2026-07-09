import { useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { DEFAULT_ESTIMATOR_SETTINGS } from '../domain/contract';
import { computeEstimate } from '../domain/estimate';
import { buildPerZoneBoard } from '../domain/projection';
import { computeDominantSignal, computeEvidence, computeTopSignals } from '../domain/signals';
import { computeUrgencyLevel, computeRecommendationText } from '../domain/recommendations';
import type { DashboardProjection, ZoneProjection } from '../components/dashboard-board-utils';
import type { Location } from '../domain/zones';

export function useDashboardProjection(): DashboardProjection {
  const { state } = useFarm();
  const { events, gameTime } = state;

  return useMemo(() => {
    const estimate = computeEstimate(events, gameTime, DEFAULT_ESTIMATOR_SETTINGS);
    const boardEntries = buildPerZoneBoard(events, gameTime, DEFAULT_ESTIMATOR_SETTINGS);

    const zones: Record<string, ZoneProjection> = {};
    const recommendations: DashboardProjection['recommendations'] = [];

    for (const entry of boardEntries) {
      const zoneEvents = events.filter((e) => e.location === entry.location);
      const dominantSignal = computeDominantSignal(zoneEvents);
      const urgencyLevel = computeUrgencyLevel(entry.priority, DEFAULT_ESTIMATOR_SETTINGS);
      const evidence = computeEvidence(zoneEvents, gameTime, DEFAULT_ESTIMATOR_SETTINGS);
      const topSignals = computeTopSignals(zoneEvents);

      zones[entry.location] = {
        presence: entry.presence,
        priority: entry.priority,
        dominantSignal: dominantSignal ?? '',
        urgencyLevel,
        evidence,
        topSignals,
      };

      const recText = computeRecommendationText({
        presence: entry.presence,
        dominantSignal,
        location: entry.location as Location,
        priority: entry.priority,
      });

      if (recText !== 'нет активности') {
        recommendations.push({
          zone: entry.location,
          priority: entry.priority,
          text: recText,
        });
      }
    }

    recommendations.sort((a, b) => b.priority - a.priority);

    return {
      low: estimate.low,
      high: estimate.high,
      pointEstimate: estimate.pointEstimate,
      confidencePercent: estimate.confidencePercent,
      recommendations,
      zones,
    };
  }, [events, gameTime]);
}

import React, { createContext, useContext, useMemo } from 'react';
import { useFarm } from './FarmContext';
import { computeEstimate } from '../domain/estimate';
import { buildPerZoneBoard } from '../domain/projection';
import { computeDominantSignal } from '../domain/signals';
import { computeUrgencyLevel, computeRecommendationText } from '../domain/recommendations';
import { DEFAULT_ESTIMATOR_SETTINGS, TIME_WINDOW_SPEC } from '../domain/contract';
import type { DashboardProjection, ZoneProjection } from '../components/dashboard-board-utils';

export const DashboardProjectionContext = createContext<DashboardProjection | undefined>(undefined);

export function DashboardProjectionProvider({ children }: { children: React.ReactNode }) {
  const { state } = useFarm();

  const projection = useMemo(() => {
    const { events, gameTime } = state;
    const estimate = computeEstimate(events, gameTime, DEFAULT_ESTIMATOR_SETTINGS);
    const boardEntries = buildPerZoneBoard(events, gameTime, DEFAULT_ESTIMATOR_SETTINGS);

    const zones: Record<string, ZoneProjection> = {};
    const recommendations: DashboardProjection['recommendations'] = [];

    for (const entry of boardEntries) {
      if (entry.presence === 0 && entry.priority === 0) {
        continue;
      }

      const windowStart = gameTime - TIME_WINDOW_SPEC.durationSeconds;
      const zoneEvents = events.filter(e => e.location === entry.location && e.time >= windowStart && e.time <= gameTime);
      
      const dominantSignal = computeDominantSignal(zoneEvents);
      const urgencyLevel = computeUrgencyLevel(entry.priority, DEFAULT_ESTIMATOR_SETTINGS);
      
      zones[entry.location] = {
        presence: entry.presence,
        priority: entry.priority,
        dominantSignal: dominantSignal ?? 'Нет сигнала',
        urgencyLevel,
        evidence: [],
        topSignals: [],
      };

      const recText = computeRecommendationText({
        presence: entry.presence,
        priority: entry.priority,
        location: entry.location,
        dominantSignal,
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

    const result: DashboardProjection = {
      low: estimate.low,
      high: estimate.high,
      pointEstimate: estimate.pointEstimate,
      confidencePercent: estimate.confidencePercent,
      recommendations,
      zones,
    };

    return result;
  }, [state]);

  return (
    <DashboardProjectionContext.Provider value={projection}>
      {children}
    </DashboardProjectionContext.Provider>
  );
}

export function useDashboardProjection() {
  const context = useContext(DashboardProjectionContext);
  return context;
}

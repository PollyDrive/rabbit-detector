import type { EventSource } from "../domain/event";

export interface ZoneProjection {
  presence: number;
  priority: number;
  dominantSignal: string;
  urgencyLevel: string;
  evidence: unknown[];
  topSignals: unknown[];
}

export interface DashboardProjection {
  low: number;
  high: number;
  pointEstimate: number;
  confidencePercent: number;
  recommendations: Array<{
    zone: string;
    priority: number;
    text: string;
    source?: EventSource;
  }>;
  zones: Record<string, ZoneProjection>;
}

export interface ZoneBoardRow extends ZoneProjection {
  location: string;
}

export function formatRange(low: number, high: number): string {
  return `${low} - ${high}`;
}

export function formatConfidencePercent(confidencePercent: number): string {
  return `${confidencePercent}%`;
}

export function getZoneRows(projection: DashboardProjection): ZoneBoardRow[] {
  return Object.entries(projection.zones)
    .map(([location, zone]) => ({
      location,
      ...zone,
    }))
    .sort((left, right) => {
      if (right.priority !== left.priority) {
        return right.priority - left.priority;
      }

      if (right.presence !== left.presence) {
        return right.presence - left.presence;
      }

      return left.location.localeCompare(right.location);
    });
}

import { useMemo, useContext } from 'react';
import { FarmContext } from '../context/FarmContext';
import { computeEstimate } from '../domain/estimate';
import { buildPerZoneBoard } from '../domain/projection';
import { computeDominantSignal, computeEvidence, computeTopSignals } from '../domain/signals';
import { computeRecommendationText, computeUrgencyLevel } from '../domain/recommendations';
import { DEFAULT_ESTIMATOR_SETTINGS, TIME_WINDOW_SPEC } from '../domain/contract';
import type { DashboardProjection, ZoneProjection } from './dashboard-board-utils';
import type { FarmEvent } from '../domain/contract';
import { useMockedProjection } from '../testing/contractTestHelpers';

export function useDashboardProjection(): DashboardProjection | undefined {
  const mock = useMockedProjection();
  const farmCtx = useContext(FarmContext);
  
  const events = farmCtx?.state.events ?? [];
  const now = farmCtx?.state.gameTime ?? 0;
  const settings = DEFAULT_ESTIMATOR_SETTINGS;
  
  return useMemo(() => {
    if (mock) return mock as DashboardProjection;
    if (!farmCtx) return undefined;

    const windowStart = now - TIME_WINDOW_SPEC.durationSeconds;
    const windowEvents = events.filter((e: FarmEvent) => e.time >= windowStart && e.time <= now);
    
    if (windowEvents.length === 0) {
      return undefined;
    }
    
    const estimate = computeEstimate(events, now, settings);
    const perZoneBoard = buildPerZoneBoard(events, now, settings);
    
    const zones: Record<string, ZoneProjection> = {};
    const recommendations: DashboardProjection['recommendations'] = [];
    
    for (const boardEntry of perZoneBoard) {
      if (boardEntry.presence === 0) continue;
      
      const locEvents = windowEvents.filter((e: FarmEvent) => e.location === boardEntry.location);
      if (locEvents.length === 0) continue;
      
      const dominantSignal = computeDominantSignal(locEvents);
      const urgencyLevel = computeUrgencyLevel(boardEntry.priority, settings);
      const evidence = computeEvidence(locEvents, now, settings);
      const topSignals = computeTopSignals(locEvents);
      
      zones[boardEntry.location] = {
        presence: boardEntry.presence,
        priority: boardEntry.priority,
        dominantSignal: dominantSignal ?? '',
        urgencyLevel,
        evidence,
        topSignals,
      };
      
      const recText = computeRecommendationText({
        dominantSignal,
        evidenceLength: evidence.length,
        urgencyLevel,
      });
      
      const latestEvent = locEvents.sort((a, b) => b.time - a.time)[0];
      
      recommendations.push({
        zone: boardEntry.location,
        priority: boardEntry.priority,
        text: recText,
        source: latestEvent?.source,
      });
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
  }, [mock, farmCtx, events, now, settings]);
}
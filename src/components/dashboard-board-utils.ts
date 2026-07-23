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
  suspiciousZonesCount: number;
  suspiciousZoneNames?: string[];
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


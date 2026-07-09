import { describe, expect, it } from 'vitest';
import { buildDashboardProjection } from '../../domain/dashboardProjection';
import { defaultEstimatorSettings, concurrentZonesScenario } from '../../testing/contractFixtures';
import type { FarmEvent } from '../../domain/contract';

function withIds(events: Omit<FarmEvent, 'id'>[]): FarmEvent[] {
  return events.map((event, index) => ({ ...event, id: index + 1 }));
}

describe('dashboardProjection unit tests', () => {
  it('should build empty projection for empty log', () => {
    const projection = buildDashboardProjection([], 0, defaultEstimatorSettings);
    expect(projection.low).toBe(0);
    expect(projection.high).toBe(0);
    expect(projection.pointEstimate).toBe(0);
    expect(projection.recommendations).toEqual([]);
    
    // Check that zones are present but empty
    const zones = Object.values(projection.zones);
    expect(zones.length).toBeGreaterThan(0);
    for (const zone of zones) {
      expect(zone.presence).toBe(0);
      expect(zone.priority).toBe(0);
    }
  });

  it('should project a simple concurrent scenario', () => {
    const log = withIds(concurrentZonesScenario.events);
    const projection = buildDashboardProjection(log, 3600, defaultEstimatorSettings);
    
    expect(projection.pointEstimate).toBeGreaterThan(0);
    
    expect(projection.zones['Теплица'].presence).toBeGreaterThan(0);
    expect(projection.zones['Теплица'].priority).toBeGreaterThan(0);
    
    if (projection.recommendations.length > 0) {
      expect(projection.recommendations[0].zone).toBeDefined();
      expect(projection.recommendations[0].priority).toBeGreaterThan(0);
    }
  });
});

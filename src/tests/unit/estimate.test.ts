import { describe, expect, it } from 'vitest';

import { computeEstimate } from '../../domain/estimate';
import type { FarmEvent } from '../../domain/contract';
import {
  concurrentZonesScenario,
  defaultEstimatorSettings,
  emptyLogScenario,
} from '../../testing/contractFixtures';

function withIds(events: Omit<FarmEvent, 'id'>[]): FarmEvent[] {
  return events.map((event, index) => ({ ...event, id: index + 1 }));
}

describe('estimate', () => {
  it('counts simultaneous occupied zones as low and all active zones as high', () => {
    const result = computeEstimate(
      withIds(concurrentZonesScenario.events),
      3600,
      defaultEstimatorSettings,
    );

    expect(result).toMatchObject({
      low: 1,
      high: 3,
      pointEstimate: 1,
      confidencePercent: 33,
      suspiciousZonesCount: 2,
    });
  });

  it('returns zeros for an empty window', () => {
    const result = computeEstimate(withIds(emptyLogScenario.events), 0, defaultEstimatorSettings);

    expect(result).toMatchObject({
      low: 0,
      high: 0,
      pointEstimate: 0,
      confidencePercent: 0,
      suspiciousZonesCount: 0,
    });
  });

  it('treats events on the concurrency boundary as simultaneous', () => {
    const events = withIds([
      {
        event_type: 'Следы',
        intensity: 8,
        location: 'Теплица',
        source: 'seed',
        time: 0,
      },
      {
        event_type: 'Следы',
        intensity: 8,
        location: 'Огород',
        source: 'seed',
        time: 5,
      },
    ]);

    const result = computeEstimate(events, 5, defaultEstimatorSettings);

    expect(result.low).toBe(2);
    expect(result.high).toBe(2);
    expect(result.confidencePercent).toBe(100);
    expect(result.suspiciousZonesCount).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';

import { computeDominantSignal, computeEvidence, computeTopSignals } from '../../domain/signals';
import type { FarmEvent } from '../../domain/contract';
import {
  concurrentZonesScenario,
  defaultEstimatorSettings,
  emptyLogScenario,
  signalsTestScenario,
  weakSignalsScenario,
} from '../../testing/contractFixtures';

function withIds(events: Omit<FarmEvent, 'id'>[]): FarmEvent[] {
  return events.map((event, index) => ({ ...event, id: index + 1 }));
}

describe('signals', () => {
  it('picks the type with the highest aggregate credibility as dominant signal', () => {
    expect(computeDominantSignal(withIds(weakSignalsScenario.events))).toBe('Шуршание');
  });

  it('breaks a true aggregate tie by confidence and then by latest event id', () => {
    const tied: FarmEvent[] = [
      { id: 1, event_type: 'Пропажа морковки', location: 'Огород', intensity: 10, time: 10, source: 'seed' },
      { id: 2, event_type: 'Следы', location: 'Огород', intensity: 8, time: 11, source: 'seed' },
    ];

    expect(computeDominantSignal(tied)).toBe('Следы');
  });

  it('returns null for an empty log', () => {
    expect(computeDominantSignal(withIds(emptyLogScenario.events))).toBeNull();
  });

  it('returns only the strong events that established the low count', () => {
    const evidence = computeEvidence(withIds(concurrentZonesScenario.events), 3600, defaultEstimatorSettings);

    expect(evidence).toHaveLength(1);
    expect(evidence[0]).toMatchObject({ location: 'Теплица', event_type: 'Следы' });
  });

  it('sorts top signals by credibility descending and stays deterministic', () => {
    const topSignals = computeTopSignals(withIds(signalsTestScenario.events));

    expect(topSignals.map((event) => event.location)).toEqual(['Теплица', 'Огород', 'Сарай']);
  });
});

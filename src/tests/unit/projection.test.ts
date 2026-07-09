import { describe, expect, it } from 'vitest';
import { credibilityOf, presenceByLocation } from '../../domain/projection';
import { DEFAULT_ESTIMATOR_SETTINGS, type FarmEvent } from '../../domain/contract';

describe('projection', () => {
  describe('credibilityOf', () => {
    it('calculates credibility based on confidence matrix and intensity', () => {
      expect(credibilityOf({ event_type: 'Следы', intensity: 10 })).toBeCloseTo(1.0);
      expect(credibilityOf({ event_type: 'Пропажа моркови', intensity: 5 })).toBeCloseTo(0.4);
      expect(credibilityOf({ event_type: 'Новая яма', intensity: 10 })).toBeCloseTo(0.6);
      expect(credibilityOf({ event_type: 'Шуршание', intensity: 2 })).toBeCloseTo(0.08);
      expect(credibilityOf({ event_type: 'Датчик движения', intensity: 10 })).toBeCloseTo(0.2);
    });
  });

  describe('presenceByLocation', () => {
    const baseEvent: FarmEvent = {
      id: 1,
      event_type: 'Следы',
      location: 'Огород',
      intensity: 1,
      time: 10000,
      source: 'manual',
    };

    it('returns 0 for empty events', () => {
      const result = presenceByLocation([], 10000, DEFAULT_ESTIMATOR_SETTINGS);
      expect(result['Огород']).toBe(0);
      expect(result['Теплица']).toBe(0);
    });

    it('returns 0 for events outside the time window', () => {
      const event = { ...baseEvent, time: 5000, intensity: 10, event_type: 'Следы' as const };
      const result = presenceByLocation([event], 10000, DEFAULT_ESTIMATOR_SETTINGS);
      expect(result['Огород']).toBe(0);
    });

    it('returns 1.0 when an event reaches the credibility threshold (override)', () => {
      const event = { ...baseEvent, time: 9000, intensity: 10, event_type: 'Следы' as const };
      const result = presenceByLocation([event], 10000, DEFAULT_ESTIMATOR_SETTINGS);
      expect(result['Огород']).toBe(1.0);
    });

    it('calculates presence correctly with multiple weak signals', () => {
      const e1 = { ...baseEvent, id: 1, time: 9000, intensity: 5, event_type: 'Шуршание' as const };
      const e2 = { ...baseEvent, id: 2, time: 9000, intensity: 5, event_type: 'Шуршание' as const };

      const result = presenceByLocation([e1, e2], 10000, DEFAULT_ESTIMATOR_SETTINGS);

      const expectedAvg = 0.2;
      const expectedPresence = expectedAvg * (1 - Math.exp(-2 / DEFAULT_ESTIMATOR_SETTINGS.k));

      expect(result['Огород']).toBeCloseTo(expectedPresence);
    });
  });
});

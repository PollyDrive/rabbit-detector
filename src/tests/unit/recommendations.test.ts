import { describe, expect, it } from 'vitest';

import { computeRecommendationText, computeUrgencyLevel } from '../../domain/recommendations';
import { defaultEstimatorSettings } from '../../testing/contractFixtures';

describe('recommendations', () => {
  it('maps priority to urgency level by the documented absolute thresholds', () => {
    expect(computeUrgencyLevel(2, defaultEstimatorSettings)).toBe('низкий');
    expect(computeUrgencyLevel(5, defaultEstimatorSettings)).toBe('средний');
    expect(computeUrgencyLevel(8, defaultEstimatorSettings)).toBe('высокий');
  });

  it('returns no activity for zero priority', () => {
    expect(computeUrgencyLevel(0, defaultEstimatorSettings)).toBe('нет активности');
  });

  it('looks up recommendation text from the dominant-signal/location dictionary', () => {
    const text = computeRecommendationText({
      presence: 1,
      dominantSignal: 'Новая яма',
      location: 'Огород',
      priority: 10,
    });

    expect(text).toMatch(/осмотреть грядки, засыпать подкоп/i);
  });

  it('flags a confirmed sighting in a low-value zone instead of staying silent about it', () => {
    const text = computeRecommendationText({
      presence: 1,
      dominantSignal: 'Следы',
      location: 'Забор — Юго-Восток',
      priority: 2,
    });

    expect(text).toMatch(/малоценн/i);
    expect(text).toMatch(/кролики подтверждены/i);
  });
});

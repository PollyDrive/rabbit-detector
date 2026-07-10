import { describe, expect, it } from 'vitest'

import { computeRecommendationText, computeUrgencyLevel } from '../../domain/recommendations'
import { defaultEstimatorSettings } from '../../testing/contractFixtures'

describe('stage 4C urgency level + recommendation text (ТЗ 3.8)', () => {
  it('maps priority to urgency level by the documented absolute thresholds (<3 / 3..6 / >6)', () => {
    expect(computeUrgencyLevel(2, defaultEstimatorSettings)).toBe('низкий')
    expect(computeUrgencyLevel(5, defaultEstimatorSettings)).toBe('средний')
    expect(computeUrgencyLevel(8, defaultEstimatorSettings)).toBe('высокий')
  })

  it('a zone with zero priority (no activity) gets "нет активности", not "низкий"', () => {
    // priority = presence * asset_value; asset_value is never 0, so priority=0 <=> presence=0
    expect(computeUrgencyLevel(0, defaultEstimatorSettings)).toBe('нет активности')
  })

  it('looks up recommendation text from the dominant-signal/location dictionary', () => {
    const text = computeRecommendationText({
      presence: 1,
      dominantSignal: 'Новая яма',
      location: 'Огород',
      priority: 10,
    })

    expect(text).toMatch(/осмотреть грядки, засыпать подкоп/i)
  })

  it('flags confirmed presence in a low-value zone instead of staying silent about it', () => {
    // Забор — Юго-Восток: asset_value=2 -> priority=1.0*2=2 (низкий), but presence=1.0 is a confirmed sighting
    const text = computeRecommendationText({
      presence: 1,
      dominantSignal: 'Следы',
      location: 'Забор — Юго-Восток',
      priority: 2,
    })

    expect(text).toMatch(/малоценн/i)
    expect(text).toMatch(/кролики подтверждены/i)
  })
})

import { describe, expect, it } from 'vitest'

import { DEFAULT_ESTIMATOR_SETTINGS } from '../../domain/contract'
import { rankZonesByPriority } from '../../domain/projection'

describe('stage 4B priority math and zone ranking', () => {
  it('calculates priority as presence times asset value and sorts zones by descending priority', () => {
    const log = [
      {
        id: 1,
        event_type: 'Следы' as const,
        intensity: 8,
        location: 'Огород' as const,
        source: 'seed' as const,
        time: 100,
      },
      {
        id: 2,
        event_type: 'Следы' as const,
        intensity: 8,
        location: 'Забор — Восток' as const,
        source: 'seed' as const,
        time: 101,
      },
    ]

    const ranked = rankZonesByPriority(log, 101, DEFAULT_ESTIMATOR_SETTINGS)

    expect(ranked[0]).toMatchObject({
      location: 'Огород',
      presence: 1,
      priority: 10,
    })
    expect(ranked[1]).toMatchObject({
      location: 'Забор — Восток',
      presence: 1,
      priority: 4,
    })
  })

  it('breaks ties by the latest event id when presence and asset value are equal', () => {
    const log = [
      {
        id: 1,
        event_type: 'Следы' as const,
        intensity: 8,
        location: 'Забор — Запад' as const,
        source: 'seed' as const,
        time: 100,
      },
      {
        id: 2,
        event_type: 'Следы' as const,
        intensity: 8,
        location: 'Забор — Юго-Запад' as const,
        source: 'seed' as const,
        time: 100,
      },
    ]

    const ranked = rankZonesByPriority(log, 100, DEFAULT_ESTIMATOR_SETTINGS)

    expect(ranked[0]?.location).toBe('Забор — Юго-Запад')
    expect(ranked[1]?.location).toBe('Забор — Запад')
  })

  it('falls back to the declared zone order when every zone has zero priority', () => {
    const ranked = rankZonesByPriority([], 3600, DEFAULT_ESTIMATOR_SETTINGS)

    expect(ranked.map((zone) => zone.location)).toEqual([
      'Огород',
      'Теплица',
      'Сарай',
      'Забор — Запад',
      'Забор — Юго-Запад',
      'Забор — Восток',
      'Забор — Юго-Восток',
    ])
  })
})

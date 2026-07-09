import { describe, expect, it } from 'vitest'

import { DEFAULT_ESTIMATOR_SETTINGS } from '../../domain/contract'
import { buildPerZoneBoard } from '../../domain/projection'

describe('stage 4B per-zone board projection', () => {
  it('returns one sorted board entry per zone with location, presence, and priority', () => {
    const log = [
      {
        id: 1,
        event_type: 'Следы' as const,
        intensity: 8,
        location: 'Теплица' as const,
        source: 'seed' as const,
        time: 100,
      },
    ]

    const board = buildPerZoneBoard(log, 100, DEFAULT_ESTIMATOR_SETTINGS)
    const greenhouseRow = board.find((row) => row.location === 'Теплица')

    expect(board).toHaveLength(7)
    expect(board[0]?.location).toBe('Теплица')
    expect(greenhouseRow).toMatchObject({
      location: 'Теплица',
      presence: 1,
      priority: 10,
    })
  })

  it('recomputes the board when now moves past the hourly window even without new events', () => {
    const log = [
      {
        id: 1,
        event_type: 'Следы' as const,
        intensity: 8,
        location: 'Теплица' as const,
        source: 'seed' as const,
        time: 0,
      },
    ]

    const beforeExpiry = buildPerZoneBoard(log, 0, DEFAULT_ESTIMATOR_SETTINGS)
    const afterExpiry = buildPerZoneBoard(log, 3601, DEFAULT_ESTIMATOR_SETTINGS)

    expect(beforeExpiry.find((row) => row.location === 'Теплица')?.presence).toBe(1)
    expect(afterExpiry.find((row) => row.location === 'Теплица')?.presence).toBe(0)
    expect(afterExpiry.find((row) => row.location === 'Теплица')?.priority).toBe(0)
  })
})

import { describe, expect, it } from 'vitest'

import type { FarmEvent } from '../../domain/contract'
import { eventsInWindow } from '../../domain/projection'

describe('stage 4B temporal window selector', () => {
  it('keeps only events from the last game hour and includes the lower boundary', () => {
    const log: FarmEvent[] = [
      {
        id: 1,
        event_type: 'Следы',
        intensity: 7,
        location: 'Теплица',
        source: 'seed',
        time: 0,
      },
      {
        id: 2,
        event_type: 'Следы',
        intensity: 8,
        location: 'Теплица',
        source: 'seed',
        time: 3600,
      },
      {
        id: 3,
        event_type: 'Следы',
        intensity: 9,
        location: 'Теплица',
        source: 'seed',
        time: 3601,
      },
    ]

    const result = eventsInWindow(log, 3600)

    expect(result.map((event) => event.id)).toEqual([1, 2])
  })

  it('returns an empty array for an empty log and for a now earlier than every event', () => {
    expect(eventsInWindow([], 3600)).toEqual([])

    const futureOnly: FarmEvent[] = [
      {
        id: 1,
        event_type: 'Следы',
        intensity: 8,
        location: 'Теплица',
        source: 'seed',
        time: 5000,
      },
    ]

    expect(eventsInWindow(futureOnly, 100)).toEqual([])
  })
})

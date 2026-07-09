import { describe, expect, it } from 'vitest'
import type { FarmEvent } from '../../domain/contract'
import { eventsInWindow } from '../../domain/projection'

describe('eventsInWindow', () => {
  it('should return events within the time window', () => {
    const events: FarmEvent[] = [
      { id: 1, event_type: 'Следы', intensity: 1, location: 'Теплица', source: 'seed', time: 1000 },
      { id: 2, event_type: 'Следы', intensity: 1, location: 'Теплица', source: 'seed', time: 2000 },
      { id: 3, event_type: 'Следы', intensity: 1, location: 'Теплица', source: 'seed', time: 5000 },
      { id: 4, event_type: 'Следы', intensity: 1, location: 'Теплица', source: 'seed', time: 5600 },
      { id: 5, event_type: 'Следы', intensity: 1, location: 'Теплица', source: 'seed', time: 6000 },
    ]

    // now = 5600. Window is [2000, 5600].
    const result = eventsInWindow(events, 5600)
    expect(result.map(e => e.id)).toEqual([2, 3, 4])
  })

  it('should return an empty array if log is empty', () => {
    expect(eventsInWindow([], 5000)).toEqual([])
  })
})

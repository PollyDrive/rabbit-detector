import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FarmProvider, useFarm } from '../../context/FarmContext'
import { ANTI_SPAM_INTERVAL_MS } from '../../domain/config'

const wrapper = ({ children }: { children: ReactNode }) => (
  <FarmProvider>{children}</FarmProvider>
)

function setup() {
  return renderHook(() => useFarm(), { wrapper })
}

describe('farmReducer (live write path via FarmContext)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('appends a valid event with an auto-incremented id and the current game time', () => {
    const { result } = setup()

    act(() => {
      result.current.addEvent({
        location: 'Огород',
        event_type: 'Следы',
        intensity: 5,
        source: 'manual',
      })
    })

    expect(result.current.state.events).toHaveLength(1)
    const [event] = result.current.state.events
    expect(event.id).toBe(1)
    expect(event.time).toBe(result.current.state.gameTime)
  })

  it('keeps earlier rows untouched (append-only) when a second event lands after the anti-spam window', () => {
    const { result } = setup()

    act(() => {
      result.current.addEvent({
        location: 'Огород',
        event_type: 'Следы',
        intensity: 5,
        source: 'manual',
      })
    })
    const firstEvent = result.current.state.events[0]

    act(() => {
      vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 50)
    })
    act(() => {
      result.current.addEvent({
        location: 'Теплица',
        event_type: 'Шуршание',
        intensity: 8,
        source: 'manual',
      })
    })

    expect(result.current.state.events).toHaveLength(2)
    expect(result.current.state.events[0]).toEqual(firstEvent)
    expect(result.current.state.events[1]).toMatchObject({ id: 2, location: 'Теплица' })
  })

  it('rejects a second dispatch inside the anti-spam window and does not append it', () => {
    const { result } = setup()

    act(() => {
      result.current.addEvent({
        location: 'Огород',
        event_type: 'Следы',
        intensity: 5,
        source: 'manual',
      })
    })
    act(() => {
      result.current.addEvent({
        location: 'Теплица',
        event_type: 'Шуршание',
        intensity: 8,
        source: 'manual',
      })
    })

    expect(result.current.state.events).toHaveLength(1)
    expect(result.current.state.lastRejectedReason).toBe('anti-spam')
  })

  it('rejects a location/event-type combination outside the compatibility matrix', () => {
    const { result } = setup()

    act(() => {
      // Шуршание is not a valid signal for Огород per the matrix.
      result.current.addEvent({
        location: 'Огород',
        event_type: 'Шуршание',
        intensity: 5,
        source: 'manual',
      })
    })

    expect(result.current.state.events).toHaveLength(0)
    expect(result.current.state.lastRejectedReason).toBe('invalid-combination')
  })

  it('rejects a structurally invalid event even when the matrix check would allow it', () => {
    const { result } = setup()

    act(() => {
      // Non-integer intensity passes isValidEvent's range check but fails
      // the zod schema's z.number().int() — proves the schema is actually
      // wired into the write path, not just declared and unused.
      result.current.addEvent({
        location: 'Огород',
        event_type: 'Следы',
        intensity: 5.5,
        source: 'manual',
      })
    })

    expect(result.current.state.events).toHaveLength(0)
    expect(result.current.state.lastRejectedReason).toBe('invalid-shape')
  })

  it('SEED_BULK replaces only source=seed rows and leaves live events intact', () => {
    const { result } = setup()

    act(() => {
      result.current.addEvent({
        location: 'Огород',
        event_type: 'Следы',
        intensity: 5,
        source: 'manual',
      })
    })
    const [manualEvent] = result.current.state.events

    act(() => {
      result.current.seedEvents([
        { location: 'Сарай', event_type: 'Шуршание', intensity: 3, time: 10, source: 'seed' },
        { location: 'Теплица', event_type: 'Датчик движения', intensity: 4, time: 20, source: 'seed' },
      ])
    })

    const events = result.current.state.events
    expect(events).toHaveLength(3)
    expect(events.filter((e) => e.source === 'manual')).toHaveLength(1)
    expect(events.filter((e) => e.source === 'seed')).toHaveLength(2)
    // seed ids never collide with the live manual event's id.
    const seedIds = events.filter((e) => e.source === 'seed').map((e) => e.id)
    expect(seedIds).not.toContain(manualEvent.id)
    expect(new Set(events.map((e) => e.id)).size).toBe(events.length)

    act(() => {
      result.current.seedEvents([
        { location: 'Сарай', event_type: 'Пропажа моркови', intensity: 6, time: 30, source: 'seed' },
      ])
    })

    const eventsAfterRegenerate = result.current.state.events
    expect(eventsAfterRegenerate.filter((e) => e.source === 'manual')).toHaveLength(1)
    expect(eventsAfterRegenerate.filter((e) => e.source === 'seed')).toHaveLength(1)
    expect(eventsAfterRegenerate.find((e) => e.id === manualEvent.id)).toEqual(manualEvent)
  })

  it('FAST_FORWARD advances gameTime by exactly one hour without touching the log', () => {
    const { result } = setup()
    const timeBefore = result.current.state.gameTime

    act(() => {
      result.current.fastForward()
    })

    expect(result.current.state.gameTime).toBe(timeBefore + 3600)
    expect(result.current.state.events).toHaveLength(0)
  })

  it('TOGGLE_DOG blocks Следы×Огород while active', () => {
    const { result } = setup()

    act(() => {
      result.current.toggleDog()
    })
    expect(result.current.state.dogInGarden).toBe(true)

    act(() => {
      vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 50)
    })
    act(() => {
      result.current.addEvent({
        location: 'Огород',
        event_type: 'Следы',
        intensity: 5,
        source: 'manual',
      })
    })

    expect(result.current.state.events).toHaveLength(0)
    expect(result.current.state.lastRejectedReason).toBe('invalid-combination')
  })
})

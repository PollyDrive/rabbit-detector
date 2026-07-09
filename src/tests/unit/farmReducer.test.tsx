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

// Stage 4A seeds ~an hour of history at mount (ТЗ 3.7) — the log is never
// empty on a fresh FarmProvider. Every assertion here is relative to that
// seeded baseline instead of assuming an empty log / id starting at 1.
describe('farmReducer (live write path via FarmContext)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('appends a valid event with an auto-incremented id and the current game time', () => {
    const { result } = setup()
    const baseline = result.current.state.events.length

    act(() => {
      result.current.addEvent({
        location: 'Огород',
        event_type: 'Следы',
        intensity: 5,
        source: 'manual',
      })
    })

    expect(result.current.state.events).toHaveLength(baseline + 1)
    const event = result.current.state.events.at(-1)!
    expect(event.id).toBeGreaterThan(baseline)
    expect(event.time).toBe(result.current.state.gameTime)
  })

  it('keeps earlier rows untouched (append-only) when a second event lands after the anti-spam window', () => {
    const { result } = setup()
    const baseline = result.current.state.events.length

    act(() => {
      result.current.addEvent({
        location: 'Огород',
        event_type: 'Следы',
        intensity: 5,
        source: 'manual',
      })
    })
    const eventsAfterFirst = result.current.state.events

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

    expect(result.current.state.events).toHaveLength(baseline + 2)
    expect(result.current.state.events.slice(0, baseline + 1)).toEqual(eventsAfterFirst)
    expect(result.current.state.events.at(-1)).toMatchObject({ location: 'Теплица' })
  })

  it('rejects a second dispatch inside the anti-spam window and does not append it', () => {
    const { result } = setup()
    const baseline = result.current.state.events.length

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

    expect(result.current.state.events).toHaveLength(baseline + 1)
    expect(result.current.state.lastRejectedReason).toBe('anti-spam')
  })

  it('rejects a location/event-type combination outside the compatibility matrix', () => {
    const { result } = setup()
    const baseline = result.current.state.events.length

    act(() => {
      // Шуршание is not a valid signal for Огород per the matrix.
      result.current.addEvent({
        location: 'Огород',
        event_type: 'Шуршание',
        intensity: 5,
        source: 'manual',
      })
    })

    expect(result.current.state.events).toHaveLength(baseline)
    expect(result.current.state.lastRejectedReason).toBe('invalid-combination')
  })

  it('rejects a structurally invalid event even when the matrix check would allow it', () => {
    const { result } = setup()
    const baseline = result.current.state.events.length

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

    expect(result.current.state.events).toHaveLength(baseline)
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
    const manualEvent = result.current.state.events.find((e) => e.source === 'manual')!

    act(() => {
      result.current.seedEvents([
        { location: 'Сарай', event_type: 'Шуршание', intensity: 3, time: 10, source: 'seed' },
        { location: 'Теплица', event_type: 'Датчик движения', intensity: 4, time: 20, source: 'seed' },
      ])
    })

    const events = result.current.state.events
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
    const eventsBefore = result.current.state.events

    act(() => {
      result.current.fastForward()
    })

    expect(result.current.state.gameTime).toBe(timeBefore + 3600)
    expect(result.current.state.events).toEqual(eventsBefore)
  })

  it('TOGGLE_DOG blocks Следы×Огород while active', () => {
    const { result } = setup()
    const baseline = result.current.state.events.length

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

    expect(result.current.state.events).toHaveLength(baseline)
    expect(result.current.state.lastRejectedReason).toBe('invalid-combination')
  })
})

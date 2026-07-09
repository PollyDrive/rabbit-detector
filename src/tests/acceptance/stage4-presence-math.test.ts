import { describe, expect, it } from 'vitest'

import { DEFAULT_ESTIMATOR_SETTINGS } from '../../domain/contract'
import { credibilityOf, presenceByLocation } from '../../domain/projection'
import { strongSignalScenario, weakSignalsScenario } from '../../testing/contractFixtures'

describe('stage 4B presence and credibility math', () => {
  it('turns a zone into presence 1.0 once one event reaches the credibility threshold', () => {
    const event = { ...strongSignalScenario.events[0], id: 1 }
    const credibility = credibilityOf(event)
    const presence = presenceByLocation([event], event.time, DEFAULT_ESTIMATOR_SETTINGS)

    expect(credibility).toBeGreaterThanOrEqual(DEFAULT_ESTIMATOR_SETTINGS.tau)
    expect(presence['Теплица']).toBe(1)
  })

  it('returns zero presence for a zone with no events inside the window', () => {
    const event = { ...strongSignalScenario.events[0], id: 1 }
    const presence = presenceByLocation([event], event.time, DEFAULT_ESTIMATOR_SETTINGS)

    expect(presence['Огород']).toBe(0)
  })

  it('keeps weak-signal presence strictly between zero and one and increases it as confirmations accumulate', () => {
    const oneWeakEvent = [{ ...weakSignalsScenario.events[0], id: 1 }]
    const allWeakEvents = weakSignalsScenario.events.map((event, index) => ({
      ...event,
      id: index + 1,
    }))

    const oneWeakPresence = presenceByLocation(oneWeakEvent, 220, DEFAULT_ESTIMATOR_SETTINGS)['Сарай']
    const accumulatedPresence = presenceByLocation(allWeakEvents, 220, DEFAULT_ESTIMATOR_SETTINGS)['Сарай']

    expect(oneWeakPresence).toBeGreaterThan(0)
    expect(oneWeakPresence).toBeLessThan(1)
    expect(accumulatedPresence).toBeGreaterThan(oneWeakPresence)
    expect(accumulatedPresence).toBeLessThan(1)
  })
})

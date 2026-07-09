import { describe, expect, it } from 'vitest'

import { farmEventSchema, isValidEvent } from '../../domain/event'

interface EventLike {
  event_type: string
  intensity: number
  location: string
  source: string
  time: number
}

function assertValidFixtureEvents(events: EventLike[]) {
  for (const [index, event] of events.entries()) {
    const candidate = {
      ...event,
      id: index + 1,
    }

    expect(farmEventSchema.safeParse(candidate).success).toBe(true)
    expect(
      isValidEvent({
        event_type: candidate.event_type as never,
        intensity: candidate.intensity,
        location: candidate.location as never,
        source: candidate.source as never,
      }),
    ).toBe(true)
  }
}

describe('stage 3 shared fixtures pack', () => {
  it('ships one reusable fixture pack that covers the required contract scenarios', async () => {
    const fixtures = await import('../../testing/contractFixtures')

    expect(fixtures.emptyLogScenario.events).toEqual([])
    assertValidFixtureEvents(fixtures.strongSignalScenario.events)
    assertValidFixtureEvents(fixtures.weakSignalsScenario.events)
    assertValidFixtureEvents(fixtures.concurrentZonesScenario.events)
    assertValidFixtureEvents(fixtures.windowBoundaryScenario.events)

    expect(fixtures.defaultEstimatorSettings).toMatchObject({
      dogSuppression: expect.any(Number),
    })

    expect(fixtures.mockedDashboardProjection).toBeDefined()
  })

  it('exposes reusable helpers for provider-level, selector-level, and mocked-ui tests', async () => {
    const helpers = await import('../../testing/contractTestHelpers')

    expect(helpers.renderWithFarmState).toEqual(expect.any(Function))
    expect(helpers.runSelectorOnFixture).toEqual(expect.any(Function))
    expect(helpers.renderWithMockedProjection).toEqual(expect.any(Function))
  })
})

import { describe, expect, it } from 'vitest'

import { dashboardProjectionSchema, presencePrioritySchema, PROJECTION_CONTRACT } from '../../domain/contract'
import {
  emptyLogScenario,
  strongSignalScenario,
  weakSignalsScenario,
  mockedDashboardProjection,
} from '../../testing/contractFixtures'
import { expectMatchesContractShape } from '../../testing/contractHarness'

describe('stage 3 math spike', () => {
  it('keeps the three required hand-built fixtures available for the spike', () => {
    expect(emptyLogScenario.events).toHaveLength(0)
    expect(strongSignalScenario.events).toHaveLength(1)
    expect(weakSignalsScenario.events).toHaveLength(3)
  })

  it('pins the projection field list the spike must reveal to consumers', () => {
    expect(PROJECTION_CONTRACT.zone).toEqual({
      presence: 'number',
      priority: 'number',
      dominantSignal: 'string',
      urgencyLevel: 'string',
      evidence: 'array',
      topSignals: 'array',
    })

    expect(PROJECTION_CONTRACT.dashboard).toEqual({
      low: 'number',
      high: 'number',
      pointEstimate: 'number',
      confidencePercent: 'number',
      recommendations: 'array',
    })
  })

  it('accepts the reusable mocked projection shape the spike is expected to inform', () => {
    expectMatchesContractShape(mockedDashboardProjection.zones['Огород'], presencePrioritySchema)
    expectMatchesContractShape(mockedDashboardProjection, dashboardProjectionSchema)
  })
})

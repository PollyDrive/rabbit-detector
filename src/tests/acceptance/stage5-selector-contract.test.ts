import { describe, expect, it } from 'vitest'

import type { FarmEvent } from '../../domain/contract'
import {
  concurrentZonesScenario,
  defaultEstimatorSettings,
  strongSignalScenario,
} from '../../testing/contractFixtures'

function withIds(events: Omit<FarmEvent, 'id'>[]): FarmEvent[] {
  return events.map((event, index) => ({ ...event, id: index + 1 }))
}

describe('stage 5 real dashboard projection selector contract', () => {
  it('builds_one_real_dashboard_projection_from_log_now_and_settings', async () => {
    const modulePath = '../../domain/dashboardProjection'
    const { buildDashboardProjection } = await import(
      /* @vite-ignore */ modulePath
    )

    const projection = buildDashboardProjection(
      withIds(concurrentZonesScenario.events),
      3600,
      defaultEstimatorSettings,
    )

    expect(projection).toMatchObject({
      low: 1,
      high: 3,
      pointEstimate: 1,
      confidencePercent: 33,
      suspiciousZonesCount: 2,
    })
    expect(projection.recommendations.length).toBeGreaterThan(0)
    expect(projection.zones['Теплица']).toMatchObject({
      presence: 1,
      priority: 10,
      dominantSignal: expect.any(String),
      urgencyLevel: expect.any(String),
      evidence: expect.any(Array),
      topSignals: expect.any(Array),
    })
    expect(projection.zones['Сарай']).toMatchObject({
      presence: expect.any(Number),
      priority: expect.any(Number),
    })
    expect(projection.recommendations[0]).toMatchObject({
      zone: expect.any(String),
      priority: expect.any(Number),
      text: expect.any(String),
    })
  })

  it('recomputes zone rows and aggregate estimate together when now moves past the hourly window', async () => {
    const modulePath = '../../domain/dashboardProjection'
    const { buildDashboardProjection } = await import(
      /* @vite-ignore */ modulePath
    )

    const log = withIds(
      strongSignalScenario.events.map((event) => ({
        ...event,
        time: 0,
      })),
    )

    const beforeExpiry = buildDashboardProjection(log, 0, defaultEstimatorSettings)
    const afterExpiry = buildDashboardProjection(log, 3601, defaultEstimatorSettings)

    expect(beforeExpiry.zones['Теплица']).toMatchObject({
      presence: 1,
      priority: 10,
    })
    expect(beforeExpiry.high).toBe(1)

    expect(afterExpiry.zones['Теплица']).toMatchObject({
      presence: 0,
      priority: 0,
    })
    expect(afterExpiry.low).toBe(0)
    expect(afterExpiry.high).toBe(0)
    expect(afterExpiry.pointEstimate).toBe(0)
    expect(afterExpiry.confidencePercent).toBe(0)
    expect(afterExpiry.suspiciousZonesCount).toBe(0)
  })
})

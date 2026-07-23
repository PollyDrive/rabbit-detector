import { describe, expect, it } from 'vitest'

import { computeEstimate } from '../../domain/estimate'
import type { FarmEvent } from '../../domain/contract'
import {
  concurrentZonesScenario,
  defaultEstimatorSettings,
  emptyLogScenario,
} from '../../testing/contractFixtures'

function withIds(events: Omit<FarmEvent, 'id'>[]): FarmEvent[] {
  return events.map((event, index) => ({ ...event, id: index + 1 }))
}

describe('stage 4C concurrency window & numeric estimate (ТЗ 3.4)', () => {
  it('does not let weak concurrent signals inflate low, but counts them toward high', () => {
    // concurrentZonesScenario: Теплица(Следы,int7)@300 credibility=1.0*0.7=0.70 >= tau(0.5) -> occupied
    //                          Сарай(Шуршание,int6)@301  credibility=0.4*0.6=0.24 <  tau -> not occupied
    //                          Огород(Новая яма,int5)@303 credibility=0.6*0.5=0.30 <  tau -> not occupied
    // all three zones have *some* activity in the window -> high=3, but only 1 zone clears tau -> low=1
    const result = computeEstimate(
      withIds(concurrentZonesScenario.events),
      3600,
      defaultEstimatorSettings,
    )

    expect(result.low).toBe(1)
    expect(result.high).toBe(3)
    expect(result.pointEstimate).toBe(1)
    expect(result.confidencePercent).toBe(33) // round(1/3*100)
    expect(result.suspiciousZonesCount).toBe(2)
  })

  it('returns 0% confidence on an empty window, not 100% (ТЗ 3.4 explicit exception)', () => {
    const result = computeEstimate(withIds(emptyLogScenario.events), 0, defaultEstimatorSettings)

    expect(result.low).toBe(0)
    expect(result.high).toBe(0)
    expect(result.pointEstimate).toBe(0)
    expect(result.confidencePercent).toBe(0)
    expect(result.suspiciousZonesCount).toBe(0)
  })
})

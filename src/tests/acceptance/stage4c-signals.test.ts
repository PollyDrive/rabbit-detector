import { describe, expect, it } from 'vitest'

import { computeDominantSignal, computeEvidence, computeTopSignals } from '../../domain/signals'
import type { FarmEvent } from '../../domain/contract'
import {
  concurrentZonesScenario,
  defaultEstimatorSettings,
  emptyLogScenario,
  signalsTestScenario,
  weakSignalsScenario,
} from '../../testing/contractFixtures'

function withIds(events: Omit<FarmEvent, 'id'>[]): FarmEvent[] {
  return events.map((event, index) => ({ ...event, id: index + 1 }))
}

describe('stage 4C dominant signal + evidence/top-signals (ТЗ 3.8, 5.2)', () => {
  it('picks the type with highest aggregate credibility as dominant signal, not the single strongest event', () => {
    // Сарай: Шуршание(int5) cr=0.20, Датчик движения(int8) cr=0.16, Шуршание(int4) cr=0.16
    // aggregated by type: Шуршание=0.36 (0.20+0.16), Датчик движения=0.16 -> Шуршание wins outright
    const result = computeDominantSignal(withIds(weakSignalsScenario.events))
    expect(result).toBe('Шуршание')
  })

  it('breaks a true aggregate-credibility tie by confidence desc, then by latest event id desc (ТЗ 3.8)', () => {
    // Пропажа моркови(conf 0.8) int10 -> credibility 0.80
    // Следы(conf 1.0)           int8  -> credibility 0.80
    // equal aggregate credibility -> tie-break on type confidence desc -> Следы (1.0 > 0.8) wins
    const tied: FarmEvent[] = [
      { id: 1, event_type: 'Пропажа моркови', location: 'Огород', intensity: 10, time: 10, source: 'seed' },
      { id: 2, event_type: 'Следы', location: 'Огород', intensity: 8, time: 11, source: 'seed' },
    ]

    expect(computeDominantSignal(tied)).toBe('Следы')
  })

  it('returns null for a zone with no activity', () => {
    expect(computeDominantSignal(withIds(emptyLogScenario.events))).toBeNull()
  })

  it('evidence lists exactly the events that established the low count, not the whole window', () => {
    const events = withIds(concurrentZonesScenario.events)
    const evidence = computeEvidence(events, 3600, defaultEstimatorSettings)

    expect(evidence).toHaveLength(1)
    expect(evidence[0]).toMatchObject({ location: 'Теплица', event_type: 'Следы' })
  })

  it('topSignals is sorted by credibility descending', () => {
    const events = withIds(signalsTestScenario.events)
    const top = computeTopSignals(events)

    expect(top.map((event) => event.location)).toEqual(['Теплица', 'Огород', 'Сарай'])
  })
})

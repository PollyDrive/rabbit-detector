import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FarmProvider, useFarm } from '../../context/FarmContext.tsx'

const wrapper = ({ children }: { children: ReactNode }) => (
  <FarmProvider>{children}</FarmProvider>
)

describe('stage 2 event model', () => {
  it('shapes a manual event with id/time assigned and the given fields intact', () => {
    const { result } = renderHook(() => useFarm(), { wrapper })

    act(() => {
      result.current.addEvent({
        location: 'Огород',
        event_type: 'Следы',
        intensity: 7,
        source: 'manual',
      })
    })

    expect(result.current.state.events).toHaveLength(1)
    const [event] = result.current.state.events

    expect(event).toMatchObject({
      id: 1,
      location: 'Огород',
      event_type: 'Следы',
      intensity: 7,
      source: 'manual',
    })
    expect(typeof event.time).toBe('number')
  })

  it('rejects a combination outside the location/event-type compatibility matrix', () => {
    const { result } = renderHook(() => useFarm(), { wrapper })

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
  })
})

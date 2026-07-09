import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FarmProvider, useFarm } from '../../context/FarmContext'
import { ANTI_SPAM_INTERVAL_MS } from '../../domain/config'

function FarmWrapper({ children }: { children: ReactNode }) {
  return <FarmProvider>{children}</FarmProvider>
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('stage 5 runtime controls -> integrated projection stream', () => {
  it('controls_drive_real_runtime_and_refresh_dashboard', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    const modulePath = '../../hooks/useDashboardProjection'
    const { useDashboardProjection } = await import(
      /* @vite-ignore */ modulePath
    )

    const { result } = renderHook(
      () => ({
        farm: useFarm(),
        projection: useDashboardProjection(),
      }),
      { wrapper: FarmWrapper },
    )

    act(() => {
      result.current.farm.seedEvents([])
    })

    expect(result.current.projection).toMatchObject({
      low: 0,
      high: 0,
      pointEstimate: 0,
      confidencePercent: 0,
    })

    act(() => {
      result.current.farm.addEvent({
        event_type: 'Следы',
        location: 'Огород',
        intensity: 10,
        source: 'manual',
      })
    })

    expect(result.current.projection.zones['Огород']).toMatchObject({
      presence: 1,
      priority: 10,
    })
    expect(result.current.projection.high).toBe(1)

    act(() => {
      result.current.farm.simulateEvent({
        event_type: 'Шуршание',
        location: 'Сарай',
        intensity: 8,
        source: 'sim',
        time: result.current.farm.state.gameTime,
      })
    })

    expect(result.current.projection.zones['Сарай']).toMatchObject({
      presence: expect.any(Number),
      priority: expect.any(Number),
    })
    expect(result.current.projection.high).toBe(2)

    act(() => {
      result.current.farm.seedEvents([
        {
          event_type: 'Новая яма',
          location: 'Теплица',
          intensity: 7,
          source: 'seed',
          time: result.current.farm.state.gameTime - 5,
        },
      ])
    })

    expect(result.current.projection.zones['Теплица']).toMatchObject({
      presence: expect.any(Number),
      priority: expect.any(Number),
    })

    act(() => {
      vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 1)
      result.current.farm.fastForward()
    })

    act(() => {
      vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 1)
      result.current.farm.fastForward()
    })

    expect(result.current.projection).toMatchObject({
      low: 0,
      high: 0,
      pointEstimate: 0,
      confidencePercent: 0,
    })
    expect(result.current.projection.zones['Огород']).toMatchObject({
      presence: 0,
      priority: 0,
    })
  })

  it('simulator_run_updates_the_same_projection_stream_as_other_runtime_actions', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const modulePath = '../../hooks/useDashboardProjection'
    const { useDashboardProjection } = await import(
      /* @vite-ignore */ modulePath
    )

    const { result } = renderHook(
      () => ({
        farm: useFarm(),
        projection: useDashboardProjection(),
      }),
      { wrapper: FarmWrapper },
    )

    act(() => {
      result.current.farm.seedEvents([])
      result.current.farm.setRunning(true)
    })

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.farm.state.events.some((event) => event.source === 'sim')).toBe(true)
    expect(
      Object.values(result.current.projection.zones).some((zone) => zone.presence > 0),
    ).toBe(true)
  })
})

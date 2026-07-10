import React, { useEffect, useState } from 'react'
import { act, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import AppShell from '../../components/AppShell'
import { DashboardProjectionProvider } from '../../context/DashboardProjectionContext'
import { FarmContext } from '../../context/FarmContext'
import type { FarmEvent, FarmState } from '../../domain/contract'

function buildState(events: FarmEvent[] = [], running = true): FarmState {
  return {
    events,
    gameTime: 3600,
    running,
    dogInGarden: false,
    lastDispatchTime: Number.NEGATIVE_INFINITY,
    lastRejectedReason: null,
  }
}

function createContextValue(state: FarmState) {
  return {
    state,
    addEvent: () => {},
    simulateEvent: () => {},
    seedEvents: () => {},
    regenerateHistory: () => {},
    fastForward: () => {},
    setRunning: () => {},
    toggleDog: () => {},
  }
}

function BadgeHarness({
  initialState,
  onReady,
}: {
  initialState: FarmState
  onReady: (setter: React.Dispatch<React.SetStateAction<FarmState>>) => void
}) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    onReady(setState)
  }, [onReady])

  return (
    <FarmContext.Provider value={createContextValue(state)}>
      <DashboardProjectionProvider>
        <AppShell />
      </DashboardProjectionProvider>
    </FarmContext.Provider>
  )
}

function appendEvent(
  setter: React.Dispatch<React.SetStateAction<FarmState>>,
  event: FarmEvent,
) {
  act(() => {
    setter((prev) => ({
      ...prev,
      events: [...prev.events, event],
    }))
  })
}

describe('stage 7 badge notifications', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('simulator_events_show_transient_badges_on_the_canvas', () => {
    let setState: React.Dispatch<React.SetStateAction<FarmState>> | null = null

    render(
      <BadgeHarness
        initialState={buildState()}
        onReady={(setter) => {
          setState = setter
        }}
      />,
    )

    appendEvent(setState as unknown as React.Dispatch<React.SetStateAction<FarmState>>, {
      id: 1,
      event_type: 'Следы',
      location: 'Теплица',
      intensity: 7,
      time: 120,
      source: 'sim',
    })

    const badgeLayer = screen.getByRole('region', { name: /уведомления на карте/i })
    expect(within(badgeLayer).getByText(/^Следы$/)).toBeVisible()
  })

  it('badges_auto_hide_after_two_seconds', () => {
    let setState: React.Dispatch<React.SetStateAction<FarmState>> | null = null

    render(
      <BadgeHarness
        initialState={buildState()}
        onReady={(setter) => {
          setState = setter
        }}
      />,
    )

    appendEvent(setState as unknown as React.Dispatch<React.SetStateAction<FarmState>>, {
      id: 1,
      event_type: 'Следы',
      location: 'Теплица',
      intensity: 7,
      time: 120,
      source: 'sim',
    })

    const badgeLayer = screen.getByRole('region', { name: /уведомления на карте/i })
    expect(within(badgeLayer).getByText(/^Следы$/)).toBeVisible()

    act(() => {
      vi.advanceTimersByTime(1999)
    })
    expect(screen.getByRole('region', { name: /уведомления на карте/i })).toBeVisible()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.queryByRole('region', { name: /уведомления на карте/i })).not.toBeInTheDocument()
  })

  it('multiple_new_events_in_one_zone_stack_instead_of_replacing_each_other', () => {
    let setState: React.Dispatch<React.SetStateAction<FarmState>> | null = null

    render(
      <BadgeHarness
        initialState={buildState()}
        onReady={(setter) => {
          setState = setter
        }}
      />,
    )

    appendEvent(setState as unknown as React.Dispatch<React.SetStateAction<FarmState>>, {
      id: 1,
      event_type: 'Следы',
      location: 'Теплица',
      intensity: 7,
      time: 120,
      source: 'sim',
    })

    appendEvent(setState as unknown as React.Dispatch<React.SetStateAction<FarmState>>, {
      id: 2,
      event_type: 'Следы',
      location: 'Теплица',
      intensity: 9,
      time: 121,
      source: 'sim',
    })

    const badgeLayer = screen.getByRole('region', { name: /уведомления на карте/i })
    expect(within(badgeLayer).getByText('×2')).toBeVisible()
    expect(within(badgeLayer).getByText(/^Следы$/)).toBeVisible()
  })
})

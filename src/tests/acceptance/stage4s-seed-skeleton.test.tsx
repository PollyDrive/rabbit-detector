import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AppShell from '../../components/AppShell'
import type { DashboardProjection } from '../../components/dashboard-board-utils'
import type { FarmEvent, FarmState } from '../../domain/contract'
import { concurrentZonesScenario, mockedDashboardProjection, strongSignalScenario } from '../../testing/contractFixtures'
import { MockedProjectionContext, renderWithFarmState } from '../../testing/contractTestHelpers'

function buildState(events: FarmEvent[]): FarmState {
  return {
    events,
    gameTime: 3600,
    running: false,
    dogInGarden: false,
    lastDispatchTime: Number.NEGATIVE_INFINITY,
    lastRejectedReason: null,
  }
}

function withId(event: Omit<FarmEvent, 'id'>, id: number): FarmEvent {
  return {
    ...event,
    id,
  }
}

function projectionFor(zone: string): DashboardProjection {
  const zoneProjection = Object.values(mockedDashboardProjection.zones)[0]

  return {
    ...mockedDashboardProjection,
    recommendations: [
      {
        zone,
        priority: mockedDashboardProjection.recommendations[0]?.priority ?? 8,
        text: `Проверить ${zone.toLowerCase()}`,
      },
    ],
    zones: {
      [zone]: zoneProjection,
    },
  }
}

function renderSkeleton(state: FarmState, projection: DashboardProjection) {
  return renderWithFarmState(
    state,
    <MockedProjectionContext.Provider value={projection}>
      <AppShell />
    </MockedProjectionContext.Provider>,
  )
}

describe('stage 4S seed walking skeleton', () => {
  it('seed_path_renders_event_row_and_dashboard_cell', () => {
    const seededState = buildState([
      withId(concurrentZonesScenario.events[2], 1),
    ])

    renderSkeleton(seededState, projectionFor('Огород'))

    const shell = screen.getByTestId('app-shell')
    const dashboard = screen.getByRole('region', { name: 'Дашборд' })

    expect(within(shell).getByText('Лог событий')).toBeVisible()
    expect(within(shell).getByText('#1')).toBeVisible()
    expect(within(shell).getByText('seed')).toBeVisible()
    expect(within(shell).getByText('Огород')).toBeVisible()
    expect(within(dashboard).getByText('Огород')).toBeVisible()
  })

  it('switches the dashboard cell to a different seeded fixture instead of keeping a stale hardcoded zone', () => {
    const seededState = buildState([
      withId(strongSignalScenario.events[0], 1),
    ])

    renderSkeleton(seededState, projectionFor('Теплица'))

    const dashboard = screen.getByRole('region', { name: 'Дашборд' })

    expect(within(screen.getByTestId('app-shell')).getByText('seed')).toBeVisible()
    expect(within(dashboard).getByText('Теплица')).toBeVisible()
    expect(within(dashboard).queryByText('Огород')).not.toBeInTheDocument()
  })
})

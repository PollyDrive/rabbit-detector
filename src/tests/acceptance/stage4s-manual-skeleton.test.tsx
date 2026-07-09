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

function withIdAndManualSource(event: Omit<FarmEvent, 'id'>, id: number): FarmEvent {
  return {
    ...event,
    id,
    source: 'manual',
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
        source: 'manual',
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

describe('stage 4S manual walking skeleton', () => {
  it('manual_path_renders_event_row_and_dashboard_cell', () => {
    const manualState = buildState([
      withIdAndManualSource(concurrentZonesScenario.events[2], 1),
    ])

    renderSkeleton(manualState, projectionFor('Огород'))

    const shell = screen.getByTestId('app-shell')
    const dashboard = screen.getByRole('region', { name: 'Дашборд' })

    expect(within(shell).getByText('Лог событий')).toBeVisible()
    expect(within(shell).getByText('#1')).toBeVisible()
    expect(within(shell).getByText('manual')).toBeVisible()
    expect(within(shell).getAllByText('Огород')[0]).toBeVisible()
    expect(within(dashboard).getByText('Огород')).toBeVisible()
  })

  it('switches the dashboard cell to the current manual fixture instead of leaving the seeded zone hardcoded', () => {
    const manualState = buildState([
      withIdAndManualSource(strongSignalScenario.events[0], 1),
    ])

    renderSkeleton(manualState, projectionFor('Теплица'))

    const dashboard = screen.getByRole('region', { name: 'Дашборд' })

    expect(within(screen.getByTestId('app-shell')).getByText('manual')).toBeVisible()
    expect(within(dashboard).getByText('Теплица')).toBeVisible()
    expect(within(dashboard).queryByText('Огород')).not.toBeInTheDocument()
  })
})

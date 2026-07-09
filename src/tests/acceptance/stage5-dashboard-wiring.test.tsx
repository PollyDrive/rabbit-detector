import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AppShell from '../../components/AppShell'
import type { FarmEvent, FarmState } from '../../domain/contract'
import { concurrentZonesScenario, strongSignalScenario } from '../../testing/contractFixtures'
import { renderWithFarmState } from '../../testing/contractTestHelpers'
import { DashboardProjectionProvider } from '../../context/DashboardProjectionContext'

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

function withIds(events: Omit<FarmEvent, 'id'>[]): FarmEvent[] {
  return events.map((event, index) => ({ ...event, id: index + 1 }))
}

describe('stage 5 provider-driven dashboard wiring', () => {
  it('dashboard_uses_real_projection_instead_of_mock_context', () => {
    const state = buildState(withIds(concurrentZonesScenario.events))

    renderWithFarmState(state, <DashboardProjectionProvider><AppShell /></DashboardProjectionProvider>)

    const dashboard = screen.getByRole('region', { name: 'Дашборд' })
    const recommendations = screen.getByRole('region', { name: 'Рекомендации и настройки' })

    expect(screen.getByText('Лог событий')).toBeVisible()
    expect(screen.getByText('#1')).toBeVisible()
    expect(within(dashboard).getByText('Теплица')).toBeVisible()
    expect(within(recommendations).getByText('Теплица')).toBeVisible()
  })

  it('switches dashboard and recommendations when the provider state changes instead of keeping a stale zone from a local mock adapter', () => {
    const state = buildState(withIds(strongSignalScenario.events))

    renderWithFarmState(state, <DashboardProjectionProvider><AppShell /></DashboardProjectionProvider>)

    const dashboard = screen.getByRole('region', { name: 'Дашборд' })
    const recommendations = screen.getByRole('region', { name: 'Рекомендации и настройки' })

    expect(within(dashboard).getByText('Теплица')).toBeVisible()
    expect(within(dashboard).queryByText('Огород')).not.toBeInTheDocument()
    expect(within(recommendations).getByText('Теплица')).toBeVisible()
    expect(within(recommendations).queryByText('Огород')).not.toBeInTheDocument()
  })
})

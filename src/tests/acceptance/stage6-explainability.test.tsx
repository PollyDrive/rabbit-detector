import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AppShell from '../../components/AppShell'
import { DashboardProjectionProvider } from '../../context/DashboardProjectionContext'
import type { FarmEvent, FarmState } from '../../domain/contract'
import { renderWithFarmState } from '../../testing/contractTestHelpers'

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

describe('stage 6 explainability UI', () => {
  it('renders separate evidence and top-signals sections from the live zone projection instead of collapsing them into one raw event dump', () => {
    const state = buildState(
      withIds([
        {
          event_type: 'Следы',
          intensity: 7,
          location: 'Теплица',
          source: 'seed',
          time: 300,
        },
        {
          event_type: 'Шуршание',
          intensity: 6,
          location: 'Теплица',
          source: 'seed',
          time: 301,
        },
        {
          event_type: 'Датчик движения',
          intensity: 10,
          location: 'Теплица',
          source: 'seed',
          time: 302,
        },
      ]),
    )

    renderWithFarmState(state, <DashboardProjectionProvider><AppShell /></DashboardProjectionProvider>)

    const zonesArea = screen.getByRole('region', { name: 'Зоны' })
    const evidenceSection = within(zonesArea).getByRole('heading', { name: /доказательство количества/i }).parentElement
    const topSignalsSection = within(zonesArea).getByRole('heading', { name: /сильнейшие сигналы/i }).parentElement

    expect(evidenceSection).not.toBeNull()
    expect(topSignalsSection).not.toBeNull()

    expect(within(evidenceSection as HTMLElement).getByText('Теплица')).toBeVisible()
    expect(within(evidenceSection as HTMLElement).getByText('Следы')).toBeVisible()
    expect(within(evidenceSection as HTMLElement).queryByText('Шуршание')).not.toBeInTheDocument()

    expect(within(topSignalsSection as HTMLElement).getByText('Теплица')).toBeVisible()
    expect(within(topSignalsSection as HTMLElement).getByText('Следы')).toBeVisible()
    expect(within(topSignalsSection as HTMLElement).getByText('Шуршание')).toBeVisible()
    expect(within(topSignalsSection as HTMLElement).getByText('Датчик движения')).toBeVisible()
  })

  it('shows a stable no-data state for explainability when the live zone projection has no evidence yet', () => {
    const state = buildState([])

    renderWithFarmState(state, <DashboardProjectionProvider><AppShell /></DashboardProjectionProvider>)

    const zonesArea = screen.getByRole('region', { name: 'Зоны' })

    expect(within(zonesArea).getByText(/нет данных для объяснения|нет объяснения/i)).toBeVisible()
  })
})

import { fireEvent, screen, within } from '@testing-library/react'
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

describe('stage 6 estimator settings panel + live recompute', () => {
  it('shows live estimator controls in the app shell with dedicated priority threshold fields', () => {
    const state = buildState(
      withIds([
        {
          event_type: 'Следы',
          intensity: 5,
          location: 'Забор — Восток',
          source: 'seed',
          time: 300,
        },
      ]),
    )

    renderWithFarmState(state, <DashboardProjectionProvider><AppShell /></DashboardProjectionProvider>)

    // Estimator settings live in the Simulator panel (control-area), not the
    // dashboard's Рекомендации region.
    const controlArea = screen.getByTestId('control-area')

    expect(within(controlArea).getByLabelText(/k\b/i)).toBeVisible()
    expect(within(controlArea).getByLabelText(/τ|tau/i)).toBeVisible()
    expect(within(controlArea).getByLabelText(/окно одновременности|concurrency/i)).toBeVisible()
    expect(within(controlArea).getByLabelText(/нижн.*порог.*приоритет/i)).toBeVisible()
    expect(within(controlArea).getByLabelText(/верхн.*порог.*приоритет/i)).toBeVisible()
  })

  it('reclassifies the same live recommendation when the high-priority threshold changes without mutating the log', () => {
    const state = buildState(
      withIds([
        {
          event_type: 'Следы',
          intensity: 5,
          location: 'Забор — Восток',
          source: 'seed',
          time: 300,
        },
      ]),
    )

    renderWithFarmState(state, <DashboardProjectionProvider><AppShell /></DashboardProjectionProvider>)

    const recommendations = screen.getByRole('region', { name: 'Рекомендации и настройки' })
    const controlArea = screen.getByTestId('control-area')
    const logRegion = screen.getByRole('region', { name: 'Лог событий' })
    const highPriorityColumn = screen.getByRole('heading', { name: /высокий приоритет/i }).parentElement
    const lowPriorityColumn = screen.getByRole('heading', { name: /низкий приоритет/i }).parentElement

    expect(highPriorityColumn).not.toBeNull()
    expect(lowPriorityColumn).not.toBeNull()

    expect(within(lowPriorityColumn as HTMLElement).getByText('Забор — Восток')).toBeVisible()
    expect(within(highPriorityColumn as HTMLElement).queryByText('Забор — Восток')).not.toBeInTheDocument()

    const logRowsBefore = within(logRegion).getAllByRole('row').length
    expect(within(logRegion).getByText('#1')).toBeVisible()
    expect(within(recommendations).getByText(/кролики подтверждены, урон маловероятен/i)).toBeVisible()

    fireEvent.change(within(controlArea).getByLabelText(/верхн.*порог.*приоритет/i), {
      target: { value: '4' },
    })

    expect(within(highPriorityColumn as HTMLElement).getByText('Забор — Восток')).toBeVisible()
    expect(within(lowPriorityColumn as HTMLElement).queryByText('Забор — Восток')).not.toBeInTheDocument()
    expect(within(logRegion).getAllByRole('row')).toHaveLength(logRowsBefore)
    expect(within(logRegion).getByText('#1')).toBeVisible()
  })
})

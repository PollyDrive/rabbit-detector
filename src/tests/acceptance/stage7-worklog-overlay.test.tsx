import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AppShell from '../../components/AppShell'
import { DashboardProjectionProvider } from '../../context/DashboardProjectionContext'
import type { FarmState } from '../../domain/contract'
import { renderWithFarmState } from '../../testing/contractTestHelpers'

function buildState(): FarmState {
  return {
    events: [],
    gameTime: 3600,
    running: false,
    dogInGarden: false,
    lastDispatchTime: Number.NEGATIVE_INFINITY,
    lastRejectedReason: null,
  }
}

function renderShell() {
  renderWithFarmState(
    buildState(),
    <DashboardProjectionProvider>
      <AppShell />
    </DashboardProjectionProvider>,
  )
}

describe('stage 7 AI Worklog overlay', () => {
  it('worklog_trigger_opens_overlay_with_structured_static_content', () => {
    renderShell()

    const trigger = screen.getByRole('button', { name: 'AI Worklog' })

    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog', { name: /ai worklog/i })

    expect(dialog).toBeVisible()
    expect(screen.getByTestId('app-shell')).toBeVisible()
    expect(within(dialog).getByRole('heading', { name: 'AI Worklog' })).toBeVisible()
    expect(within(dialog).getByRole('heading', { name: /контекст demo/i })).toBeVisible()
    expect(within(dialog).getByRole('heading', { name: /что уже собрано/i })).toBeVisible()
    expect(within(dialog).getByRole('heading', { name: /что осталось на полировку/i })).toBeVisible()
  })

  it('worklog_overlay_is_more_than_a_single_placeholder_sentence', () => {
    renderShell()

    fireEvent.click(screen.getByRole('button', { name: 'AI Worklog' }))

    const dialog = screen.getByRole('dialog', { name: /ai worklog/i })
    const headings = within(dialog).getAllByRole('heading')

    expect(headings.length).toBeGreaterThanOrEqual(4)
    expect(within(dialog).queryByText('Журнал разработки проекта появится здесь.')).not.toBeInTheDocument()
    expect(within(dialog).getByText(/канвас, лог и дашборд уже живут в одном shell/i)).toBeVisible()
    expect(within(dialog).getByText(/симулятор сыплет seed, sim и manual событиями/i)).toBeVisible()
    expect(within(dialog).getByText(/stage 7 доводит demo-layer: badges, legend и worklog overlays/i)).toBeVisible()
  })

  it('worklog_overlay_closes_cleanly_without_tearing_down_the_demo_shell', () => {
    renderShell()

    const trigger = screen.getByRole('button', { name: 'AI Worklog' })

    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: /закрыть/i }))

    expect(screen.queryByRole('dialog', { name: /ai worklog/i })).not.toBeInTheDocument()
    expect(screen.getByTestId('app-shell')).toBeVisible()
    expect(trigger).toHaveFocus()

    fireEvent.click(trigger)

    expect(screen.getAllByRole('dialog', { name: /ai worklog/i })).toHaveLength(1)
  })
})

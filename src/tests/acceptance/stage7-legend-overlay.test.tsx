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

function renderLegendShell() {
  return renderWithFarmState(
    buildState(),
    <DashboardProjectionProvider>
      <AppShell />
    </DashboardProjectionProvider>,
  )
}

describe('stage 7 legend overlay', () => {
  it('legend_trigger_opens_overlay_without_removing_the_farm_shell', () => {
    renderLegendShell()

    expect(screen.queryByText('Правила фермы')).not.toBeInTheDocument()

    const trigger = screen.getByRole('button', { name: 'Legend' })
    fireEvent.click(trigger)

    const overlay = screen.getByRole('dialog', { name: /legend|правила мира/i })
    expect(overlay).toBeVisible()
    expect(screen.getByTestId('app-shell')).toBeVisible()
  })

  it('legend_overlay_renders_world_rules_and_assumptions_as_static_reference_text', () => {
    renderLegendShell()

    fireEvent.click(screen.getByRole('button', { name: 'Legend' }))

    const overlay = screen.getByRole('dialog', { name: /legend|правила мира/i })
    expect(within(overlay).getByText(/часы тикают 1:1 реальному времени/i)).toBeVisible()
    expect(within(overlay).getByText(/в огороде нет датчиков/i)).toBeVisible()
    expect(within(overlay).getByText(/на заборе никогда не пропадает морковка/i)).toBeVisible()
    expect(within(overlay).getByText(/следы/i)).toBeVisible()
  })

  it('legend_overlay_closes_cleanly_and_returns_focus_to_the_demo_shell', () => {
    renderLegendShell()

    const trigger = screen.getByRole('button', { name: 'Legend' })
    fireEvent.click(trigger)

    const overlay = screen.getByRole('dialog', { name: /legend|правила мира/i })
    fireEvent.click(within(overlay).getByRole('button', { name: /закрыть/i }))

    expect(screen.queryByRole('dialog', { name: /legend|правила мира/i })).not.toBeInTheDocument()
    expect(screen.getByTestId('app-shell')).toBeVisible()
    expect(trigger).toHaveFocus()
  })
})

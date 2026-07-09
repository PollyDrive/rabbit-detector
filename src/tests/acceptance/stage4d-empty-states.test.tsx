import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import DashboardShell from '../../components/DashboardShell'
import { renderWithMockedProjection } from '../../testing/contractTestHelpers'

const emptyProjection = {
  low: 0,
  high: 0,
  pointEstimate: 0,
  confidencePercent: 0,
  recommendations: [],
  zones: {},
}

describe('stage 4D empty/loading states + badge/overlay layout slots', () => {
  it('renders a readable "no activity" state on a fully empty mocked projection, without crashing', () => {
    renderWithMockedProjection(emptyProjection, <DashboardShell />)

    expect(screen.getByText(/нет активности/i)).toBeVisible()
  })

  it('renders a distinct loading-like state when no mocked projection has been provided yet', () => {
    // contract: `undefined` projection = "not loaded yet", separate from a confirmed-empty
    // projection object — the two must not render the same text.
    renderWithMockedProjection(undefined, <DashboardShell />)

    expect(screen.getByText(/загрузка|loading/i)).toBeVisible()
    expect(screen.queryByText(/нет активности/i)).not.toBeInTheDocument()
  })

  it('exposes a layout slot for the badge stack so Stage 8 can fill it without re-laying-out the page', () => {
    renderWithMockedProjection(emptyProjection, <DashboardShell />)

    expect(screen.getByTestId('badge-stack-slot')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
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

  it('exposes layout slots for the badge stack and overlays so Stage 8 can fill them without re-laying-out the page', () => {
    renderWithMockedProjection(emptyProjection, <DashboardShell />)

    expect(screen.getByTestId('badge-stack-slot')).toBeInTheDocument()
    expect(screen.getByTestId('overlay-ai-worklog-slot')).toBeInTheDocument()
    expect(screen.getByTestId('overlay-legend-slot')).toBeInTheDocument()
  })
})

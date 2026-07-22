import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import DashboardBoard from '../../components/DashboardBoard'
import { renderWithMockedProjection } from '../../testing/contractTestHelpers'
import { mockedDashboardProjection } from '../../testing/contractFixtures'

describe('stage 4D per-zone + estimate/confidence dashboard cards (mocked)', () => {
  it('renders per-zone presence/priority and the low-high/pointEstimate/confidence BI plaque from mocked projection', () => {
    renderWithMockedProjection(mockedDashboardProjection, <DashboardBoard />)

    expect(screen.getByText('Огород')).toBeVisible()
    expect(screen.getByText(/75\s*%/)).toBeVisible() // confidencePercent
    expect(screen.getByText('Гарантированно кроликов')).toBeVisible()
    expect(screen.getByText('1')).toBeVisible()
    expect(screen.getByText('Подозреваемых зон')).toBeVisible()
    expect(screen.getByText('3')).toBeVisible()
  })

  it('re-renders different numbers when the mocked projection changes, proving it reads the data and is not hardcoded', () => {
    const otherProjection = {
      low: 4,
      high: 4,
      pointEstimate: 4,
      confidencePercent: 100,
      recommendations: [],
      zones: {
        Сарай: {
          presence: 0.6,
          priority: 4.8,
          dominantSignal: 'Шуршание',
          urgencyLevel: 'средний',
          evidence: [],
          topSignals: [],
        },
      },
    }

    renderWithMockedProjection(otherProjection, <DashboardBoard />)

    expect(screen.getByText('Сарай')).toBeVisible()
    expect(screen.getByText(/100\s*%/)).toBeVisible()
    expect(screen.queryByText('Огород')).not.toBeInTheDocument()
  })
})

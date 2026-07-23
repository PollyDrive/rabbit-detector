import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import RecommendationsPanel from '../../components/RecommendationsPanel'
import { renderWithMockedProjection } from '../../testing/contractTestHelpers'
import { mockedDashboardProjection } from '../../testing/contractFixtures'

describe('stage 4D recommendations block + estimator settings panel shell (mocked)', () => {
  it('renders each mocked recommendation with its zone and text', () => {
    renderWithMockedProjection(mockedDashboardProjection, <RecommendationsPanel />)

    expect(screen.getByText(/выпустить пса в огород/i)).toBeVisible()
    expect(screen.getByText('Огород')).toBeVisible()
  })

  it('shows an estimator settings panel shell with a labeled input for every documented parameter', () => {
    renderWithMockedProjection(mockedDashboardProjection, <RecommendationsPanel />)

    expect(screen.getByLabelText(/k\b/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/t \(порог\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/concurrency|окно одновременности/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dogSuppression|подавление.*пс/i)).toBeInTheDocument()
  })
})

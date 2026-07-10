import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 1 shell', () => {
  it('renders the fixed desktop farm shell', () => {
    render(<App />)

    expect(screen.getByRole('main')).toBeVisible()
    expect(screen.getByTestId('farm-shell')).toHaveStyle({ minWidth: '1024px' })
  })
})

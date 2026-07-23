import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 3 seed history', () => {
  it('seeds the log with roughly an hour of history before any user action', () => {
    render(<App />)

    expect(screen.getAllByText(/^#\d+$/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/стартовые данные/i).length).toBeGreaterThan(1)
  })

  it('regenerating history replaces only seed rows and keeps manual rows intact', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Огород' }))
    fireEvent.change(screen.getByLabelText(/тип события/i), {
      target: { value: 'Следы' },
    })
    fireEvent.change(screen.getByLabelText(/интенсивность/i), {
      target: { value: '6' },
    })
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))

    const manualRowsBefore = screen.getAllByText(/вручную/i).length

    fireEvent.click(screen.getByRole('button', { name: /пересоздать историю/i }))

    const seedRowsAfter = screen.getAllByText(/стартовые данные/i).length
    const manualRowsAfter = screen.getAllByText(/вручную/i).length

    expect(manualRowsAfter).toBe(manualRowsBefore)
    expect(seedRowsAfter).toBeGreaterThan(0)
  })
})

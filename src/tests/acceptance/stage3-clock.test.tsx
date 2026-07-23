import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from '../../App.tsx'

describe('stage 3 game clock', () => {
  it('fast-forwards the game clock by one hour without generating new log rows', () => {
    render(<App />)

    const rowsBefore = screen.getAllByText(/^#\d+$/).length
    const clockBefore = screen.getByText(/игровое время/i).textContent

    fireEvent.click(screen.getByRole('button', { name: /промотать/i }))

    const rowsAfter = screen.getAllByText(/^#\d+$/).length
    const clockAfter = screen.getByText(/игровое время/i).textContent

    expect(rowsAfter).toBe(rowsBefore)
    expect(clockAfter).not.toBe(clockBefore)
  })
})

import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../../App.tsx'

describe('stage 3 simulator engine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('appends new log rows on its own once started', () => {
    render(<App />)

    const rowsBefore = screen.getAllByText(/^#\d+$/).length

    fireEvent.click(screen.getByRole('button', { name: /запустить/i }))
    act(() => {
      vi.advanceTimersByTime(6000)
    })

    const rowsAfter = screen.getAllByText(/^#\d+$/).length
    expect(rowsAfter).toBeGreaterThan(rowsBefore)
  })

  it('stops appending rows once paused again', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /запустить/i }))
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    fireEvent.click(screen.getByRole('button', { name: /остановить/i }))
    const rowsAfterPause = screen.getAllByText(/^#\d+$/).length

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(screen.getAllByText(/^#\d+$/).length).toBe(rowsAfterPause)
  })
})

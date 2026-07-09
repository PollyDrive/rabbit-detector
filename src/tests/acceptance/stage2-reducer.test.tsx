import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../../App.tsx'
import { ANTI_SPAM_INTERVAL_MS } from '../../domain/config.ts'

describe('stage 2 append-only reducer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps earlier log rows untouched when a second event is added', () => {
    render(<App />)

    // Stage 4A seeds ~an hour of random history at mount (ТЗ 3.7), so the
    // log is never empty and row ids/locations aren't predictable — assert
    // on row count deltas and the two newly-appended rows, not literal #1/#2.
    const rowsBefore = screen.getAllByRole('row').length // includes the header row

    fireEvent.click(screen.getByRole('button', { name: 'Огород' }))
    fireEvent.change(screen.getByLabelText(/тип события/i), {
      target: { value: 'Следы' },
    })
    fireEvent.change(screen.getByLabelText(/интенсивность/i), {
      target: { value: '5' },
    })
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))

    // Real submissions are anti-spam gated (ТЗ 9.1) — space the two
    // dispatches apart instead of firing them in the same tick.
    vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 50)

    fireEvent.click(screen.getByRole('button', { name: 'Теплица' }))
    fireEvent.change(screen.getByLabelText(/тип события/i), {
      target: { value: 'Шуршание' },
    })
    fireEvent.change(screen.getByLabelText(/интенсивность/i), {
      target: { value: '8' },
    })
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))

    const dataRows = screen.getAllByRole('row').slice(1) // drop header
    expect(dataRows).toHaveLength(rowsBefore - 1 + 2)

    const [secondToLast, last] = dataRows.slice(-2)
    expect(within(secondToLast).getByText('Огород')).toBeVisible()
    expect(within(last).getByText('Теплица')).toBeVisible()
  })
})

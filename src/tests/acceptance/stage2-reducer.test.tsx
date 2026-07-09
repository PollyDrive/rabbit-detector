import { fireEvent, render, screen } from '@testing-library/react'
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

    expect(screen.getByText(/#1/)).toBeVisible()
    expect(screen.getByText(/#2/)).toBeVisible()
    expect(screen.getByText('Огород')).toBeVisible()
    expect(screen.getByText('Теплица')).toBeVisible()
  })
})

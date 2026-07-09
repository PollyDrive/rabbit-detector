import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../../App.tsx'

function submit(location: string, eventType: string, intensity: string) {
  fireEvent.click(screen.getByRole('button', { name: location }))
  fireEvent.change(screen.getByLabelText(/тип события/i), {
    target: { value: eventType },
  })
  fireEvent.change(screen.getByLabelText(/интенсивность/i), {
    target: { value: intensity },
  })
  fireEvent.click(screen.getByRole('button', { name: /добавить/i }))
}

describe('stage 2 manual input feedback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('closes the popup once the reducer accepts the event', () => {
    render(<App />)

    submit('Огород', 'Следы', '5')

    expect(screen.queryByRole('dialog', { name: /ручной ввод/i })).not.toBeInTheDocument()
  })

  it('keeps the popup open and shows an error when the reducer rejects the dispatch', () => {
    render(<App />)

    submit('Огород', 'Следы', '5')

    // Second submission lands inside the anti-spam window (no time
    // advanced) — the reducer rejects it, so the popup must stay open
    // with visible feedback instead of silently vanishing.
    submit('Теплица', 'Шуршание', '8')

    expect(screen.getByRole('dialog', { name: /ручной ввод/i })).toBeVisible()
    expect(screen.getByRole('alert')).toBeVisible()
  })
})

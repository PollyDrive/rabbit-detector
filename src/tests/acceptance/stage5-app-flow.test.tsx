import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from '../../App'
import { ANTI_SPAM_INTERVAL_MS } from '../../domain/config'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('stage 5 integrated app flow', () => {
  it('seed_manual_fast_forward_and_simulator_flow_stays_visible_in_the_event_log', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    vi.spyOn(Math, 'random').mockReturnValue(0)

    render(<App />)

    const logRegion = screen.getByRole('region', { name: 'Лог событий' })
    const log = within(logRegion).getByRole('table')
    const initialSeedRow = within(log).getByRole('row', { name: /#1\b.*seed/i })

    expect(initialSeedRow).toBeVisible()
    expect(screen.getAllByText(/seed/i).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Теплица' }))
    fireEvent.change(screen.getByLabelText(/тип события/i), {
      target: { value: 'Следы' },
    })
    fireEvent.change(screen.getByLabelText(/интенсивность/i), {
      target: { value: '10' },
    })
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))

    const manualRow = within(log).getByRole('row', { name: /#25\b.*Теплица.*manual/i })

    expect(manualRow).toBeVisible()
    expect(screen.getAllByText(/manual/i).length).toBeGreaterThan(0)
    expect(screen.queryByRole('dialog', { name: 'Ручной ввод' })).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 1)
    })
    fireEvent.click(screen.getByRole('button', { name: /промотать час/i }))

    act(() => {
      vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 1)
    })
    fireEvent.click(screen.getByRole('button', { name: /промотать час/i }))

    expect(screen.getByText('Игровое время: 03:00:00')).toBeVisible()

    act(() => {
      vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 1)
    })
    fireEvent.click(screen.getByRole('button', { name: /пересоздать историю/i }))

    expect(screen.getAllByText(/seed/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/manual/i).length).toBeGreaterThan(0)

    act(() => {
      vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 1)
    })
    fireEvent.click(screen.getByRole('button', { name: /запустить/i }))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getAllByText(/sim/i).length).toBeGreaterThan(0)
  })
})

import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from '../../App'
import { ANTI_SPAM_INTERVAL_MS } from '../../domain/config'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('stage 5 integrated app flow', () => {
  it('simulator_manual_seed_and_fast_forward_update_one_integrated_dashboard', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    vi.spyOn(Math, 'random').mockReturnValue(0)

    render(<App />)

    const dashboard = screen.getByRole('region', { name: 'Дашборд' })
    const recommendations = screen.getByRole('region', { name: 'Рекомендации и настройки' })

    expect(screen.getAllByText(/seed/i).length).toBeGreaterThan(0)
    expect(within(dashboard).getByText('Огород')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Теплица' }))
    fireEvent.change(screen.getByLabelText(/тип события/i), {
      target: { value: 'Следы' },
    })
    fireEvent.change(screen.getByLabelText(/интенсивность/i), {
      target: { value: '10' },
    })
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))

    expect(screen.getAllByText(/manual/i).length).toBeGreaterThan(0)
    expect(within(dashboard).getByText('Теплица')).toBeVisible()
    expect(within(recommendations).getByText('Теплица')).toBeVisible()

    act(() => {
      vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 1)
    })
    fireEvent.click(screen.getByRole('button', { name: /промотать час/i }))

    act(() => {
      vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 1)
    })
    fireEvent.click(screen.getByRole('button', { name: /промотать час/i }))

    expect(within(dashboard).queryByText('Теплица')).not.toBeInTheDocument()
    expect(within(recommendations).queryByText('Теплица')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 1)
    })
    fireEvent.click(screen.getByRole('button', { name: /пересоздать историю/i }))

    expect(screen.getAllByText(/seed/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/manual/i).length).toBeGreaterThan(0)
    expect(within(dashboard).getByText('Огород')).toBeVisible()

    act(() => {
      vi.advanceTimersByTime(ANTI_SPAM_INTERVAL_MS + 1)
    })
    fireEvent.click(screen.getByRole('button', { name: /запустить/i }))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getAllByText(/sim/i).length).toBeGreaterThan(0)
    expect(within(dashboard).queryByText('Нет активности')).not.toBeInTheDocument()
  })
})

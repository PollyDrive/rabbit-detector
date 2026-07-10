import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import { vi } from 'vitest'

import { BadgeLayer } from '../../components/BadgeLayer'
import type { FarmEvent } from '../../domain/contract'

function event(overrides: Partial<FarmEvent>): FarmEvent {
  return {
    id: 1,
    event_type: 'Следы',
    location: 'Теплица',
    intensity: 5,
    time: 100,
    source: 'sim',
    ...overrides,
  }
}

describe('BadgeLayer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not show a badge for events already present at mount (initial seed)', () => {
    render(<BadgeLayer events={[event({ id: 1 })]} />)
    expect(screen.queryByRole('region', { name: /уведомления на карте/i })).not.toBeInTheDocument()
  })

  it('does not duplicate a badge when the same events array re-renders', () => {
    const events = [event({ id: 1 })]
    const { rerender } = render(<BadgeLayer events={[]} />)

    rerender(<BadgeLayer events={events} />)
    let badgeLayer = screen.getByRole('region', { name: /уведомления на карте/i })
    expect(within(badgeLayer).getByText(/^Следы$/)).toBeVisible()
    expect(within(badgeLayer).queryByText(/^×/)).not.toBeInTheDocument()

    rerender(<BadgeLayer events={events} />)
    badgeLayer = screen.getByRole('region', { name: /уведомления на карте/i })
    expect(within(badgeLayer).queryByText(/^×/)).not.toBeInTheDocument()
  })

  it('keeps badges for different zones independent', () => {
    const { rerender } = render(<BadgeLayer events={[]} />)

    rerender(
      <BadgeLayer
        events={[
          event({ id: 1, location: 'Теплица' }),
          event({ id: 2, location: 'Сарай', event_type: 'Шуршание' }),
        ]}
      />,
    )

    const badgeLayer = screen.getByRole('region', { name: /уведомления на карте/i })
    expect(within(badgeLayer).getByTestId('badge-Теплица')).toBeVisible()
    expect(within(badgeLayer).getByTestId('badge-Сарай')).toBeVisible()
  })

  it('a new event in a zone restarts that zone stack visibility timer', () => {
    const { rerender } = render(<BadgeLayer events={[]} />)

    rerender(<BadgeLayer events={[event({ id: 1 })]} />)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    rerender(<BadgeLayer events={[event({ id: 1 }), event({ id: 2 })]} />)

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByRole('region', { name: /уведомления на карте/i })).toBeVisible()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.queryByRole('region', { name: /уведомления на карте/i })).not.toBeInTheDocument()
  })
})

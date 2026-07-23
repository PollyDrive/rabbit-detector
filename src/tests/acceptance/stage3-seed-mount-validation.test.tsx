import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import App from '../../App.tsx'

vi.mock('../../domain/runtime', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../domain/runtime')>()
  return {
    ...actual,
    createSeedBatch: () => [
      { event_type: 'Следы', location: 'Огород', intensity: 5, time: 0, source: 'seed' as const },
      { event_type: 'Следы', location: 'Огород', intensity: 99, time: 0, source: 'seed' as const },
      { event_type: 'Следы', location: 'Огород', intensity: 6, time: 0, source: 'seed' as const },
    ],
  }
})

describe('stage 3 initial seed mount validation (issue #95)', () => {
  it('rejects malformed or matrix-invalid events in the initial mount seed batch instead of writing them to the log', () => {
    render(<App />)

    // mocked createSeedBatch returns 3 events, one with intensity=99 (invalid shape) —
    // only the 2 valid ones should reach the log on mount, same as SEED_BULK/regenerate already does.
    expect(screen.getAllByText(/стартовые данные/i).length).toBe(2)
  })
})

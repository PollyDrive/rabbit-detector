import { describe, expect, it } from 'vitest'

describe('stage 3 canonical contract shape', () => {
  it('exposes one versioned contract surface with settings, window, action, and projection specs', async () => {
    const contract = await import('../../domain/contract')

    expect(contract.CONTRACT_VERSION).toMatch(/\S+/)

    expect(contract.DEFAULT_ESTIMATOR_SETTINGS).toMatchObject({
      dogSuppression: expect.any(Number),
    })

    expect(contract.TIME_WINDOW_SPEC).toMatchObject({
      durationSeconds: 3600,
      startBoundary: expect.stringMatching(/inclusive|exclusive/i),
      endBoundary: expect.stringMatching(/inclusive|exclusive/i),
      manualEventTimeSource: expect.any(String),
    })

    expect(contract.ACTION_CONTRACTS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'ADD_EVENT' }),
        expect.objectContaining({ type: 'SEED_BULK' }),
        expect.objectContaining({ type: 'FAST_FORWARD' }),
        expect.objectContaining({ type: 'TOGGLE_DOG' }),
      ]),
    )

    expect(contract.PROJECTION_CONTRACT).toMatchObject({
      zone: expect.any(Object),
      dashboard: expect.any(Object),
    })
  })
})

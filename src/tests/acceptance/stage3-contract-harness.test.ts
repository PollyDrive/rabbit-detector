import { z } from 'zod'
import { describe, expect, it } from 'vitest'

describe('stage 3 contract harness', () => {
  it('accepts valid output and rejects invalid output with a useful field-level error', async () => {
    const harness = await import('../../testing/contractHarness')

    const projectionSchema = z.object({
      presence: z.number(),
      priority: z.number(),
      dominantSignal: z.string(),
    })

    expect(() =>
      harness.expectMatchesContractShape(
        {
          dominantSignal: 'Следы',
          presence: 1,
          priority: 10,
        },
        projectionSchema,
      ),
    ).not.toThrow()

    expect(() =>
      harness.expectMatchesContractShape(
        {
          dominantSignal: 'Следы',
          presence: '1.0',
          priority: 10,
        },
        projectionSchema,
      ),
    ).toThrowError(/presence|type|required|expected/i)
  })
})

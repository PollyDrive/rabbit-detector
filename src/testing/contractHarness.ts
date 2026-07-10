import { z } from 'zod';

/**
 * Helper to assert that a value matches a Zod schema defining a contract shape.
 * Throws a detailed error message listing path, expected type, and actual value upon mismatch.
 */
export function expectMatchesContractShape(value: unknown, schema: z.ZodTypeAny): void {
  const result = schema.safeParse(value);
  if (!result.success) {
    const issues = result.error.issues || [];
    const formatted = issues
      .map((err) => `Field "${(err.path || []).join('.')}" validation failed: ${err.message}`)
      .join('\n');
    throw new Error(`Contract validation failed:\n${formatted}`);
  }
}

/**
 * --- CONTRACT VERSIONING RULE ---
 * The contract version is specified in `src/domain/contract.ts` via the `CONTRACT_VERSION` constant.
 * 
 * Reviewer Checklist when a PR modifies the contract shape:
 * 1. Check if types in `src/domain/contract.ts` or their validation schemas have changed.
 * 2. If yes, verify that the `CONTRACT_VERSION` constant has been bumped (e.g. from '1.0.0' to '1.1.0' or '2.0.0').
 * 3. Verify that all consumer-driven contract tests in the project are updated to comply with the new version.
 */

/**
 * --- TEMPLATE: Consumer-Driven Contract Test for 4C ---
 * 
 * ```typescript
 * import { describe, expect, it } from 'vitest';
 * import { expectMatchesContractShape } from '../testing/contractHarness';
 * import { presencePrioritySchema } from '../domain/contract';
 * import { computePresenceAndPriority } from '../domain/projection'; // real 4B logic
 * import { strongSignalScenario } from '../testing/contractFixtures';
 * 
 * describe('4C Consumer-driven contract test: 4B output compatibility', () => {
 *   it('should produce presence/priority output matching the contract schema', () => {
 *     const realOutput = computePresenceAndPriority(strongSignalScenario.events);
 *     expectMatchesContractShape(realOutput, presencePrioritySchema);
 *   });
 * });
 * ```
 */

/**
 * --- TEMPLATE: Consumer-Driven Contract Test for 4D ---
 * 
 * ```typescript
 * import { describe, expect, it } from 'vitest';
 * import { expectMatchesContractShape } from '../testing/contractHarness';
 * import { dashboardProjectionSchema } from '../domain/contract';
 * import { selectDashboardData } from '../domain/selectors'; // real selector logic
 * import { strongSignalScenario } from '../testing/contractFixtures';
 * 
 * describe('4D Consumer-driven contract test: selector output compatibility', () => {
 *   it('should produce dashboard projection output matching the contract schema', () => {
 *     const realOutput = selectDashboardData(strongSignalScenario);
 *     expectMatchesContractShape(realOutput, dashboardProjectionSchema);
 *   });
 * });
 * ```
 */

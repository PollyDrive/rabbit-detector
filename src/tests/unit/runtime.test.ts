import { describe, expect, it } from 'vitest';

import { getEventTypeOptions, isValidEvent } from '../../domain/event';
import { createSeedBatch, createSimulatorEvent, formatGameTime } from '../../domain/runtime';

describe('runtime helpers', () => {
  it('creates only valid seed events inside the last hour window', () => {
    const randomValues = [
      0.01, 0.2, 0.5,
      0.1, 0.4, 0.7,
      0.2, 0.6, 0.9,
    ];
    let index = 0;
    const random = () => randomValues[index++ % randomValues.length] ?? 0.5;

    const batch = createSeedBatch(7200, random, false, 6);

    expect(batch).toHaveLength(6);
    for (const event of batch) {
      expect(event.source).toBe('seed');
      expect(event.time).toBeGreaterThanOrEqual(3600);
      expect(event.time).toBeLessThanOrEqual(7200);
      expect(isValidEvent(event, false)).toBe(true);
    }
  });

  it('creates valid simulator events with the current time', () => {
    const event = createSimulatorEvent(1234, () => 0.75, false);

    expect(event.source).toBe('sim');
    expect(event.time).toBe(1234);
    expect(isValidEvent(event, false)).toBe(true);
  });

  it('disables traces in the garden when the dog is active', () => {
    const options = getEventTypeOptions('Огород', true);

    expect(options.some((option) => option.value === 'Следы' && option.disabled)).toBe(true);
    expect(options.some((option) => option.value === 'Пропажа моркови' && !option.disabled)).toBe(true);
  });

  it('formats the clock as hh:mm:ss', () => {
    expect(formatGameTime(3661)).toBe('01:01:01');
  });
});

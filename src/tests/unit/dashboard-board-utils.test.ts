import { describe, expect, it } from 'vitest';

import { formatConfidencePercent, formatRange, getZoneRows } from '../../components/dashboard-board-utils';
import { mockedDashboardProjection } from '../../testing/contractFixtures';

describe('dashboard board utils', () => {
  it('formats the low-high range and confidence percent for the BI plaque', () => {
    expect(formatRange(1, 3)).toBe('1 - 3');
    expect(formatConfidencePercent(75)).toBe('75%');
  });

  it('sorts zone rows by priority and then by presence', () => {
    const rows = getZoneRows({
      ...mockedDashboardProjection,
      zones: {
        Огород: {
          presence: 1,
          priority: 10,
          dominantSignal: 'Следы',
          urgencyLevel: 'высокий',
          evidence: [],
          topSignals: [],
        },
        Сарай: {
          presence: 0.6,
          priority: 4.8,
          dominantSignal: 'Шуршание',
          urgencyLevel: 'средний',
          evidence: [],
          topSignals: [],
        },
      },
    });

    expect(rows.map((row) => row.location)).toEqual(['Огород', 'Сарай']);
  });
});

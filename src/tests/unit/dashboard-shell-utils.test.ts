import { describe, expect, it } from 'vitest';

import {
  isEmptyDashboardProjection,
  isLoadingDashboardProjection,
  type DashboardProjectionLike,
} from '../../components/dashboard-shell-utils';

describe('dashboard shell utils', () => {
  it('treats a fully empty projection as empty', () => {
    const emptyProjection: DashboardProjectionLike = {
      low: 0,
      high: 0,
      pointEstimate: 0,
      confidencePercent: 0,
      recommendations: [],
      zones: {},
    };

    expect(isEmptyDashboardProjection(emptyProjection)).toBe(true);
  });

  it('treats a populated projection as non-empty', () => {
    const populatedProjection: DashboardProjectionLike = {
      low: 1,
      high: 2,
      pointEstimate: 1,
      confidencePercent: 50,
      recommendations: ['inspect the garden'],
      zones: {
        garden: { presence: 1 },
      },
    };

    expect(isEmptyDashboardProjection(populatedProjection)).toBe(false);
  });

  it('treats undefined projection as loading', () => {
    expect(isLoadingDashboardProjection(undefined)).toBe(true);
    expect(isEmptyDashboardProjection(undefined)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import { getRecommendationItems } from '../../components/recommendations-panel-utils';

describe('recommendations panel utils', () => {
  it('returns recommendation items without mutating the source array', () => {
    const projection = {
      recommendations: [
        { zone: 'Огород', priority: 8, text: 'Выпустить пса в огород' },
      ],
    };

    const items = getRecommendationItems(projection);

    expect(items).toEqual(projection.recommendations);
    expect(items).not.toBe(projection.recommendations);
  });
});

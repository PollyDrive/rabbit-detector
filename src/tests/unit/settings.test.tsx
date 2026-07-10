import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useEstimatorSettings } from '../../context/EstimatorSettingsContext';
import { useDashboardProjection, DashboardProjectionProvider } from '../../context/DashboardProjectionContext';
import { FarmContext } from '../../context/FarmContext';
import type { FarmState } from '../../domain/contract';

const mockFarmState: FarmState = {
  events: [
    {
      id: 1,
      event_type: 'Следы',
      intensity: 5,
      location: 'Забор — Восток',
      source: 'seed',
      time: 300,
    },
  ],
  gameTime: 3600,
  running: false,
  dogInGarden: false,
  lastDispatchTime: Number.NEGATIVE_INFINITY,
  lastRejectedReason: null,
};

const mockFarmValue = {
  state: mockFarmState,
  addEvent: () => {},
  simulateEvent: () => {},
  seedEvents: () => {},
  regenerateHistory: () => {},
  fastForward: () => {},
  setRunning: () => {},
  toggleDog: () => {},
};

const FarmWrapper = ({ children }: { children: React.ReactNode }) => (
  <FarmContext.Provider value={mockFarmValue}>
    <DashboardProjectionProvider>
      {children}
    </DashboardProjectionProvider>
  </FarmContext.Provider>
);

describe('Estimator Settings and Live Recompute Unit Tests', () => {
  it('should initialize settings from default values', () => {
    const { result } = renderHook(() => useEstimatorSettings(), { wrapper: FarmWrapper });
    expect(result.current).toBeDefined();
    expect(result.current?.settings.k).toBe(1.5);
    expect(result.current?.settings.priorityHighThreshold).toBe(6);
    expect(result.current?.settings.priorityLowThreshold).toBe(3);
  });

  it('should update settings correctly', () => {
    const { result } = renderHook(() => useEstimatorSettings(), { wrapper: FarmWrapper });
    
    act(() => {
      result.current?.updateSetting('priorityHighThreshold', 4);
      result.current?.updateSetting('priorityLowThreshold', 2);
    });

    expect(result.current?.settings.priorityHighThreshold).toBe(4);
    expect(result.current?.settings.priorityLowThreshold).toBe(2);
  });

  it('should reclassify urgency levels and recommendations on settings changes', () => {
    const { result } = renderHook(() => {
      const settings = useEstimatorSettings();
      const projection = useDashboardProjection();
      return { settings, projection };
    }, { wrapper: FarmWrapper });

    // Initial state: Забор — Восток has:
    // presence = 1.0 (credibility 0.5 >= tau 0.5)
    // priority = presence * asset_value = 1.0 * 4 = 4.0
    // priorityHighThreshold = 6, priorityLowThreshold = 3
    // So priority (4) is between 3 and 6, meaning urgency level is "средний"
    expect(result.current.projection?.zones['Забор — Восток']?.urgencyLevel).toBe('средний');

    // Change priorityLowThreshold to 5
    act(() => {
      result.current.settings?.updateSetting('priorityLowThreshold', 5);
    });

    // Now priority (4) < priorityLowThreshold (5), so urgency level should change to "низкий"
    expect(result.current.projection?.zones['Забор — Восток']?.urgencyLevel).toBe('низкий');

    // Change priorityLowThreshold to 2 and priorityHighThreshold to 3
    act(() => {
      result.current.settings?.updateSetting('priorityLowThreshold', 2);
      result.current.settings?.updateSetting('priorityHighThreshold', 3);
    });

    // Now priority (4) > priorityHighThreshold (3), so urgency level should change to "высокий"
    expect(result.current.projection?.zones['Забор — Восток']?.urgencyLevel).toBe('высокий');
  });
});

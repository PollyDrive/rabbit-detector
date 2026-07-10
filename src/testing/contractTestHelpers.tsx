import React, { useContext } from 'react';
import { render } from '@testing-library/react';
import { FarmContext } from '../context/FarmContext';
import { DashboardProjectionContext } from '../context/DashboardProjectionContext';
import type { FarmState } from '../domain/contract';
import type { DashboardProjection } from '../components/dashboard-board-utils';

export function renderWithFarmState(state: FarmState, children: React.ReactNode) {
  const mockValue = {
    state,
    addEvent: () => {},
    simulateEvent: () => {},
    seedEvents: () => {},
    regenerateHistory: () => {},
    fastForward: () => {},
    setRunning: () => {},
    toggleDog: () => {},
  };
  return render(
    <FarmContext.Provider value={mockValue}>
      {children}
    </FarmContext.Provider>
  );
}

export function runSelectorOnFixture<T, R>(selector: (state: T) => R, fixture: T): R {
  return selector(fixture);
}


export const MockedProjectionContext = DashboardProjectionContext;

export function renderWithMockedProjection(projection: DashboardProjection | undefined, children: React.ReactNode) {
  return render(
    <DashboardProjectionContext.Provider value={projection}>
      {children}
    </DashboardProjectionContext.Provider>
  );
}

export function useMockedProjection() {
  return useContext(MockedProjectionContext);
}

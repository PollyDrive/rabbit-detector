import React, { createContext, useContext } from 'react';
import { render } from '@testing-library/react';
import { FarmContext } from '../context/FarmContext';
import type { FarmState } from '../domain/contract';

export function renderWithFarmState(state: FarmState, children: React.ReactNode) {
  const mockValue = {
    state,
    addEvent: () => {},
    seedEvents: () => {},
    fastForward: () => {},
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

export const MockedProjectionContext = createContext<any>(undefined);

export function renderWithMockedProjection(projection: any, children: React.ReactNode) {
  return render(
    <MockedProjectionContext.Provider value={projection}>
      {children}
    </MockedProjectionContext.Provider>
  );
}

export function useMockedProjection() {
  return useContext(MockedProjectionContext);
}

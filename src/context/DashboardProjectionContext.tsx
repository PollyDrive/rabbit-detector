import { createContext, useContext, useMemo } from 'react';
import { FarmContext } from './FarmContext';
import { buildDashboardProjection } from '../domain/dashboardProjection';
import { DEFAULT_ESTIMATOR_SETTINGS } from '../domain/contract';
import { type FarmEvent } from '../domain/contract';
import type { DashboardProjection } from '../components/dashboard-board-utils';

export const DashboardProjectionContext = createContext<DashboardProjection | undefined>(undefined);

function computeRealProjection(
  events: FarmEvent[],
  gameTime: number,
): DashboardProjection {
  const full = buildDashboardProjection(events, gameTime, DEFAULT_ESTIMATOR_SETTINGS);
  const activeZones: DashboardProjection['zones'] = {};
  for (const [key, zone] of Object.entries(full.zones)) {
    if (zone.presence !== 0 || zone.priority !== 0) {
      activeZones[key] = zone;
    }
  }
  return {
    ...full,
    zones: activeZones,
  };
}

/**
 * Resolves to an ancestor-provided projection (e.g. a test's mock context)
 * when present, otherwise computes the real projection from live farm state.
 * Reads FarmContext directly (not the throwing useFarm()) so it degrades to
 * "no data yet" instead of crashing when rendered without a FarmProvider —
 * e.g. DashboardShell unit tests that only supply a mocked projection.
 */
export function useDashboardProjection(): DashboardProjection | undefined {
  const injected = useContext(DashboardProjectionContext);
  const farmCtx = useContext(FarmContext);
  const events = farmCtx?.state.events ?? [];
  const gameTime = farmCtx?.state.gameTime ?? 0;

  const real = useMemo(
    () => (farmCtx ? computeRealProjection(events, gameTime) : undefined),
    [farmCtx, events, gameTime],
  );

  return injected ?? real;
}

/**
 * True once there's real data to show: either a test injected a mocked
 * projection explicitly, or the farm session has non-seed activity
 * (manual/simulator events). Kept separate from the projection value itself
 * so the board/recommendations can still render off the background seed
 * data while the "Загрузка..." banner reflects "has anything happened yet",
 * not "is the zeros-only seed batch present".
 */
export function useDashboardActivityStarted(): boolean {
  const injected = useContext(DashboardProjectionContext);
  const farmCtx = useContext(FarmContext);

  if (injected !== undefined) {
    return true;
  }

  return farmCtx?.state.events.some((e) => e.source !== 'seed') ?? false;
}

export function DashboardProjectionProvider({ children }: { children: React.ReactNode }) {
  const farmCtx = useContext(FarmContext);
  const state = farmCtx?.state || { events: [], gameTime: 0 };

  const projection = useMemo(() => {
    const { events, gameTime } = state;
    return computeRealProjection(events, gameTime);
  }, [state]);

  return (
    <DashboardProjectionContext.Provider value={projection}>
      {children}
    </DashboardProjectionContext.Provider>
  );
}

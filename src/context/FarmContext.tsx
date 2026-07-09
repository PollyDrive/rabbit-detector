import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';

import { ANTI_SPAM_INTERVAL_MS, FAST_FORWARD_STEP_S, INITIAL_GAME_TIME_S } from '../domain/config';
import { farmEventSchema, isValidEvent } from '../domain/event';
import type { FarmEvent, FarmState } from '../domain/contract';
import {
  createSeedBatch,
  createSimulatorEvent,
  INITIAL_SEED_COUNT,
} from '../domain/runtime';
import { createLogger } from '../domain/logger';

const log = createLogger('reducer');

function nextEventId(events: FarmEvent[]): number {
  return events.length > 0 ? Math.max(...events.map((event) => event.id)) + 1 : 1;
}

function createInitialEvents(now: number): FarmEvent[] {
  const seedBatch = createSeedBatch(now, Math.random, false, INITIAL_SEED_COUNT);
  return seedBatch.map((event, index) => ({
    ...event,
    id: index + 1,
  }));
}

function appendValidatedEvent(
  state: FarmState,
  event: Omit<FarmEvent, 'id'>,
  now: number,
  touchDispatchTime = true,
): FarmState {
  if (!isValidEvent(event, state.dogInGarden)) {
    log.warn('Rejected invalid event combination:', event);
    return {
      ...state,
      lastDispatchTime: now,
      lastRejectedReason: 'invalid-combination',
    };
  }

  const candidate: FarmEvent = {
    ...event,
    id: nextEventId(state.events),
  };

  const parsed = farmEventSchema.safeParse(candidate);
  if (!parsed.success) {
    log.warn('Rejected malformed event:', parsed.error.flatten());
    return {
      ...state,
      lastDispatchTime: now,
      lastRejectedReason: 'invalid-shape',
    };
  }

  log.info(`Added event #${parsed.data.id}:`, parsed.data);

  return {
    ...state,
    events: [...state.events, parsed.data],
    lastDispatchTime: touchDispatchTime ? now : state.lastDispatchTime,
    lastRejectedReason: null,
  };
}

function createInitialState(): FarmState {
  return {
    events: createInitialEvents(INITIAL_GAME_TIME_S),
    gameTime: INITIAL_GAME_TIME_S,
    running: false,
    dogInGarden: false,
    lastDispatchTime: Number.NEGATIVE_INFINITY,
    lastRejectedReason: null,
  };
}

type FarmAction =
  | { type: 'ADD_EVENT'; payload: Omit<FarmEvent, 'id' | 'time'> }
  | { type: 'SIMULATE_EVENT'; payload: Omit<FarmEvent, 'id'> }
  | { type: 'SEED_BULK'; payload: Omit<FarmEvent, 'id'>[] }
  | { type: 'FAST_FORWARD' }
  | { type: 'CLOCK_TICK'; payload: number }
  | { type: 'SET_RUNNING'; payload: boolean }
  | { type: 'TOGGLE_DOG' };

function farmReducer(state: FarmState, action: FarmAction): FarmState {
  const now = Date.now();

  const bypassAntiSpam =
    action.type === 'SEED_BULK' ||
    action.type === 'CLOCK_TICK' ||
    action.type === 'SIMULATE_EVENT';

  if (!bypassAntiSpam && now - state.lastDispatchTime < ANTI_SPAM_INTERVAL_MS) {
    log.warn('Rejected dispatch due to anti-spam guard');
    return { ...state, lastRejectedReason: 'anti-spam' };
  }

  switch (action.type) {
    case 'ADD_EVENT': {
      return appendValidatedEvent(
        state,
        {
          ...action.payload,
          time: state.gameTime,
        },
        now,
        true,
      );
    }

    case 'SIMULATE_EVENT': {
      return appendValidatedEvent(state, action.payload, now, false);
    }

    case 'SEED_BULK': {
      // Every event in the batch is validated one at a time (shape + matrix) —
      // the same guard ADD_EVENT goes through. Invalid entries are dropped,
      // not the whole batch (see #95 for the mount-time createInitialEvents gap
      // this doesn't cover).
      const nonSeedEvents = state.events.filter((event) => event.source !== 'seed');
      let id = nextEventId(nonSeedEvents);
      const seeded: FarmEvent[] = [];
      let rejectedCount = 0;

      for (const event of action.payload) {
        const candidate: FarmEvent = {
          ...event,
          id,
        };
        const parsed = farmEventSchema.safeParse(candidate);
        if (!parsed.success || !isValidEvent(candidate, state.dogInGarden)) {
          rejectedCount += 1;
          continue;
        }

        seeded.push(parsed.data);
        id += 1;
      }

      if (rejectedCount > 0) {
        log.warn(`Dropped ${rejectedCount} invalid seed events`);
      }
      log.info(`Seeded ${seeded.length} events`);

      return {
        ...state,
        events: [...nonSeedEvents, ...seeded],
        lastRejectedReason: null,
      };
    }

    case 'FAST_FORWARD': {
      log.info('Fast forwarding 1 hour');
      return {
        ...state,
        gameTime: state.gameTime + FAST_FORWARD_STEP_S,
        lastDispatchTime: now,
        lastRejectedReason: null,
      };
    }

    case 'CLOCK_TICK': {
      return {
        ...state,
        gameTime: state.gameTime + action.payload,
      };
    }

    case 'SET_RUNNING': {
      return {
        ...state,
        running: action.payload,
        lastDispatchTime: now,
        lastRejectedReason: null,
      };
    }

    case 'TOGGLE_DOG': {
      log.info('Toggling dog in garden:', !state.dogInGarden);
      return {
        ...state,
        dogInGarden: !state.dogInGarden,
        lastDispatchTime: now,
        lastRejectedReason: null,
      };
    }

    default:
      return state;
  }
}

interface FarmContextProps {
  state: FarmState;
  addEvent: (event: Omit<FarmEvent, 'id' | 'time'>) => void;
  simulateEvent: (event: Omit<FarmEvent, 'id'>) => void;
  seedEvents: (events: Omit<FarmEvent, 'id'>[]) => void;
  regenerateHistory: () => void;
  fastForward: () => void;
  setRunning: (running: boolean) => void;
  toggleDog: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const FarmContext = createContext<FarmContextProps | undefined>(undefined);

export function FarmProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(farmReducer, undefined, createInitialState);
  const snapshotRef = useRef(state);

  useEffect(() => {
    snapshotRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!state.running) {
      return;
    }

    const clockId = window.setInterval(() => {
      dispatch({ type: 'CLOCK_TICK', payload: 1 });
    }, 1000);

    let cancelled = false;
    let timeoutId: number | null = null;

    const scheduleNextEvent = () => {
      const delay = 2000 + Math.floor(Math.random() * 3000);
      timeoutId = window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        const current = snapshotRef.current;
        dispatch({
          type: 'SIMULATE_EVENT',
          payload: createSimulatorEvent(current.gameTime, Math.random, current.dogInGarden),
        });
        scheduleNextEvent();
      }, delay);
    };

    scheduleNextEvent();

    return () => {
      cancelled = true;
      window.clearInterval(clockId);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [state.running]);

  const addEvent = (event: Omit<FarmEvent, 'id' | 'time'>) => {
    dispatch({ type: 'ADD_EVENT', payload: event });
  };

  const simulateEvent = (event: Omit<FarmEvent, 'id'>) => {
    dispatch({ type: 'SIMULATE_EVENT', payload: event });
  };

  const seedEvents = (events: Omit<FarmEvent, 'id'>[]) => {
    dispatch({ type: 'SEED_BULK', payload: events });
  };

  const regenerateHistory = () => {
    const current = snapshotRef.current;
    dispatch({
      type: 'SEED_BULK',
      payload: createSeedBatch(current.gameTime, Math.random, current.dogInGarden, INITIAL_SEED_COUNT),
    });
  };

  const fastForward = () => {
    dispatch({ type: 'FAST_FORWARD' });
  };

  const setRunning = (running: boolean) => {
    dispatch({ type: 'SET_RUNNING', payload: running });
  };

  const toggleDog = () => {
    dispatch({ type: 'TOGGLE_DOG' });
  };

  return (
    <FarmContext.Provider
      value={{
        state,
        addEvent,
        simulateEvent,
        seedEvents,
        regenerateHistory,
        fastForward,
        setRunning,
        toggleDog,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};

import React, { createContext, useContext, useReducer } from "react";
import { farmEventSchema, isValidEvent } from "../domain/event";
import type { FarmEvent, FarmState } from "../domain/contract";
import {
  ANTI_SPAM_INTERVAL_MS,
  FAST_FORWARD_STEP_S,
  INITIAL_GAME_TIME_S,
} from "../domain/config";
import { createLogger } from "../domain/logger";

const log = createLogger("reducer");

const initialState: FarmState = {
  events: [],
  gameTime: INITIAL_GAME_TIME_S,
  dogInGarden: false,
  lastDispatchTime: 0,
  lastRejectedReason: null,
};

type FarmAction =
  | { type: "ADD_EVENT"; payload: Omit<FarmEvent, "id" | "time"> }
  | { type: "SEED_BULK"; payload: Omit<FarmEvent, "id">[] }
  | { type: "FAST_FORWARD" }
  | { type: "TOGGLE_DOG" };

function nextEventId(events: FarmEvent[]): number {
  return events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1;
}

function farmReducer(state: FarmState, action: FarmAction): FarmState {
  const now = Date.now();

  // Anti-spam guard: reject if dispatch happens too quickly (except SEED_BULK,
  // which is a batch action, not a user gesture — see ТЗ 9.1).
  if (action.type !== "SEED_BULK" && now - state.lastDispatchTime < ANTI_SPAM_INTERVAL_MS) {
    log.warn("Rejected dispatch due to anti-spam guard");
    return { ...state, lastRejectedReason: "anti-spam" };
  }

  switch (action.type) {
    case "ADD_EVENT": {
      // Compatibility matrix + dog-suppression business rules.
      if (!isValidEvent(action.payload, state.dogInGarden)) {
        log.warn("Rejected invalid event combination:", action.payload);
        return { ...state, lastDispatchTime: now, lastRejectedReason: "invalid-combination" };
      }

      const candidate: FarmEvent = {
        ...action.payload,
        id: nextEventId(state.events),
        time: state.gameTime,
      };

      // Structural validation (types, ranges, enum membership) — the one
      // point of entry that actually enforces the schema declared in
      // domain/event.ts, instead of leaving it unused.
      const parsed = farmEventSchema.safeParse(candidate);
      if (!parsed.success) {
        log.warn("Rejected malformed event:", parsed.error.flatten());
        return { ...state, lastDispatchTime: now, lastRejectedReason: "invalid-shape" };
      }

      log.info(`Added event #${parsed.data.id}:`, parsed.data);

      return {
        ...state,
        events: [...state.events, parsed.data],
        lastDispatchTime: now,
        lastRejectedReason: null,
      };
    }

    case "SEED_BULK": {
      // Filter out existing seed events and replace them with the new ones;
      // live (sim/manual) events are untouched. Ids are assigned here, off
      // the same sequence ADD_EVENT uses — callers never supply an id, so a
      // seed batch can never collide with a live manual/sim event's id.
      const nonSeedEvents = state.events.filter((e) => e.source !== "seed");
      let id = nextEventId(nonSeedEvents);
      const seeded: FarmEvent[] = action.payload.map((event) => ({ ...event, id: id++ }));

      log.info(`Seeded ${seeded.length} events`);

      return {
        ...state,
        events: [...nonSeedEvents, ...seeded],
        // SEED_BULK does not update lastDispatchTime to avoid blocking user actions
      };
    }

    case "FAST_FORWARD": {
      log.info("Fast forwarding 1 hour");
      return {
        ...state,
        gameTime: state.gameTime + FAST_FORWARD_STEP_S,
        lastDispatchTime: now,
      };
    }

    case "TOGGLE_DOG": {
      log.info("Toggling dog in garden:", !state.dogInGarden);
      return {
        ...state,
        dogInGarden: !state.dogInGarden,
        lastDispatchTime: now,
      };
    }

    default:
      return state;
  }
}

interface FarmContextProps {
  state: FarmState;
  addEvent: (event: Omit<FarmEvent, "id" | "time">) => void;
  seedEvents: (events: Omit<FarmEvent, "id">[]) => void;
  fastForward: () => void;
  toggleDog: () => void;
}

const FarmContext = createContext<FarmContextProps | undefined>(undefined);

export function FarmProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(farmReducer, initialState);

  const addEvent = (event: Omit<FarmEvent, "id" | "time">) => {
    dispatch({ type: "ADD_EVENT", payload: event });
  };

  const seedEvents = (events: Omit<FarmEvent, "id">[]) => {
    dispatch({ type: "SEED_BULK", payload: events });
  };

  const fastForward = () => {
    dispatch({ type: "FAST_FORWARD" });
  };

  const toggleDog = () => {
    dispatch({ type: "TOGGLE_DOG" });
  };

  return (
    <FarmContext.Provider
      value={{
        state,
        addEvent,
        seedEvents,
        fastForward,
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
    throw new Error("useFarm must be used within a FarmProvider");
  }
  return context;
};

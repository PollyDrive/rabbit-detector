import React, { createContext, useContext, useReducer } from "react";
import { isValidEvent } from "../domain/event";
import type { FarmEvent } from "../domain/event";

export interface FarmState {
  events: FarmEvent[];
  gameTime: number; // in seconds
  dogInGarden: boolean;
  lastDispatchTime: number; // Date.now()
}

const initialState: FarmState = {
  events: [],
  gameTime: 3600, // starts at 1 hour (3600s)
  dogInGarden: false,
  lastDispatchTime: 0,
};

type FarmAction =
  | { type: "ADD_EVENT"; payload: Omit<FarmEvent, "id" | "time"> }
  | { type: "SEED_BULK"; payload: FarmEvent[] }
  | { type: "FAST_FORWARD" }
  | { type: "TOGGLE_DOG" };

function farmReducer(state: FarmState, action: FarmAction): FarmState {
  const now = Date.now();

  // Anti-spam guard: reject if dispatch happens too quickly (except SEED_BULK)
  if (action.type !== "SEED_BULK") {
    if (now - state.lastDispatchTime < 200) {
      console.warn("[reducer] Rejected dispatch due to anti-spam guard");
      return state;
    }
  }

  switch (action.type) {
    case "ADD_EVENT": {
      // Validate compatibility matrix
      if (!isValidEvent(action.payload, state.dogInGarden)) {
        console.warn("[reducer] Rejected invalid event combination:", action.payload);
        return state;
      }

      const nextId =
        state.events.length > 0
          ? Math.max(...state.events.map((e) => e.id)) + 1
          : 1;

      const newEvent: FarmEvent = {
        ...action.payload,
        id: nextId,
        time: state.gameTime,
      };

      console.info(`[reducer] Added event #${newEvent.id}:`, newEvent);

      return {
        ...state,
        events: [...state.events, newEvent],
        lastDispatchTime: now,
      };
    }

    case "SEED_BULK": {
      // Filter out existing seed events and replace them with the new ones
      const nonSeedEvents = state.events.filter((e) => e.source !== "seed");
      return {
        ...state,
        events: [...nonSeedEvents, ...action.payload],
        // SEED_BULK does not update lastDispatchTime to avoid blocking user actions
      };
    }

    case "FAST_FORWARD": {
      console.info("[reducer] Fast forwarding 1 hour");
      return {
        ...state,
        gameTime: state.gameTime + 3600,
        lastDispatchTime: now,
      };
    }

    case "TOGGLE_DOG": {
      console.info("[reducer] Toggling dog in garden:", !state.dogInGarden);
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
  seedEvents: (events: FarmEvent[]) => void;
  fastForward: () => void;
  toggleDog: () => void;
}

const FarmContext = createContext<FarmContextProps | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(farmReducer, initialState);

  const addEvent = (event: Omit<FarmEvent, "id" | "time">) => {
    dispatch({ type: "ADD_EVENT", payload: event });
  };

  const seedEvents = (events: FarmEvent[]) => {
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
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error("useFarm must be used within a FarmProvider");
  }
  return context;
};

import type { Location } from './zones';

export interface FarmEvent {
  id: number;
  location: Location | string;
  eventType: string;
  intensity: number;
}

export interface FarmState {
  events: FarmEvent[];
  nextId: number;
}

export type FarmAction = 
  | { type: 'ADD_EVENT'; payload: { location: string; eventType: string; intensity: number } };

export const initialState: FarmState = {
  events: [],
  nextId: 1,
};

export function farmReducer(state: FarmState, action: FarmAction): FarmState {
  switch (action.type) {
    case 'ADD_EVENT': {
      const newEvent: FarmEvent = {
        id: state.nextId,
        location: action.payload.location,
        eventType: action.payload.eventType,
        intensity: action.payload.intensity,
      };
      
      return {
        ...state,
        events: [...state.events, newEvent],
        nextId: state.nextId + 1,
      };
    }
    default:
      return state;
  }
}

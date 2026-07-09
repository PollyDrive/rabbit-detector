import { describe, expect, it } from 'vitest';
import { farmReducer, initialState } from '../../domain/store';

describe('farmReducer', () => {
  it('should append new events to the log and auto-increment id', () => {
    let state = initialState;
    
    // Add first event
    state = farmReducer(state, {
      type: 'ADD_EVENT',
      payload: {
        location: 'Огород',
        eventType: 'Следы',
        intensity: 5,
      },
    });

    expect(state.events).toHaveLength(1);
    expect(state.events[0]).toEqual({
      id: 1,
      location: 'Огород',
      eventType: 'Следы',
      intensity: 5,
    });
    expect(state.nextId).toBe(2);

    const oldState = state;
    
    // Add second event
    state = farmReducer(state, {
      type: 'ADD_EVENT',
      payload: {
        location: 'Теплица',
        eventType: 'Шуршание',
        intensity: 8,
      },
    });

    // Prove append-only behavior (existing record is untouched)
    expect(state.events).toHaveLength(2);
    expect(state.events[0]).toEqual(oldState.events[0]);
    // It should be a new array reference
    expect(state.events).not.toBe(oldState.events);
    
    expect(state.events[1]).toEqual({
      id: 2,
      location: 'Теплица',
      eventType: 'Шуршание',
      intensity: 8,
    });
    expect(state.nextId).toBe(3);
  });
});

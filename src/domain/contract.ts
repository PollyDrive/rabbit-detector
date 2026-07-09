import { z } from 'zod';
import type { EventType, EventSource } from './event';
import type { Location } from './zones';

export const CONTRACT_VERSION = '1.0.0';

export interface FarmEvent {
  id: number;
  event_type: EventType;
  location: Location;
  intensity: number; // 1-10
  time: number; // game time in seconds
  source: EventSource;
}

export type RejectReason = 'anti-spam' | 'invalid-combination' | 'invalid-shape';

export interface FarmState {
  events: FarmEvent[];
  gameTime: number; // in seconds
  dogInGarden: boolean;
  lastDispatchTime: number; // Date.now()
  lastRejectedReason: RejectReason | null;
}

export const estimatorSettingsSchema = z.object({
  k: z.number().positive(),
  concurrencyWindowSeconds: z.number().nonnegative(),
  tau: z.number().min(0).max(1),
  priorityLowThreshold: z.number().nonnegative(),
  priorityHighThreshold: z.number().nonnegative(),
  dogSuppression: z.number().min(0).max(1),
});

export type EstimatorSettings = z.infer<typeof estimatorSettingsSchema>;

export const DEFAULT_ESTIMATOR_SETTINGS: EstimatorSettings = {
  k: 1.5,
  concurrencyWindowSeconds: 5,
  tau: 0.5,
  priorityLowThreshold: 3,
  priorityHighThreshold: 6,
  dogSuppression: 0.2,
};

export const TIME_WINDOW_SPEC = {
  durationSeconds: 3600,
  startBoundary: 'inclusive',
  endBoundary: 'inclusive',
  manualEventTimeSource: 'gameTime',
};

export const ACTION_CONTRACTS = [
  {
    type: 'ADD_EVENT',
    payload: {
      event_type: 'EventType',
      location: 'Location',
      intensity: 'number',
    },
  },
  {
    type: 'SEED_BULK',
    payload: 'Array of Omit<FarmEvent, "id">',
  },
  {
    type: 'FAST_FORWARD',
    payload: 'void',
  },
  {
    type: 'TOGGLE_DOG',
    payload: 'void',
  },
] as const;

export const PROJECTION_CONTRACT = {
  zone: {
    presence: 'number',
    priority: 'number',
    dominantSignal: 'string',
    urgencyLevel: 'string',
    evidence: 'array',
    topSignals: 'array',
  },
  dashboard: {
    low: 'number',
    high: 'number',
    pointEstimate: 'number',
    confidencePercent: 'number',
    recommendations: 'array',
  },
} as const;

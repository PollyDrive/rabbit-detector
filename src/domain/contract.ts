import { z } from 'zod';
import type { EventType, EventSource } from './event';
import type { Location } from './zones';

export const CONTRACT_VERSION = '1.1.0'; // 1.1.0: added FarmState.running (Stage 4A game clock/simulator)

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
  running: boolean; // Stage 4A: game clock / simulator on-off
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
  suspiciousActivityWindowSeconds: z.number().nonnegative(),
  suspiciousActivityMinEvents: z.number().int().min(2),
});

export type EstimatorSettings = z.infer<typeof estimatorSettingsSchema>;

export const DEFAULT_ESTIMATOR_SETTINGS: EstimatorSettings = {
  k: 1.5,
  concurrencyWindowSeconds: 5,
  tau: 0.5,
  priorityLowThreshold: 3,
  priorityHighThreshold: 6,
  dogSuppression: 0.2,
  suspiciousActivityWindowSeconds: 10,
  suspiciousActivityMinEvents: 3,
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

export const presencePrioritySchema = z.object({
  presence: z.number(),
  priority: z.number(),
  dominantSignal: z.string(),
  urgencyLevel: z.string(),
  evidence: z.array(z.any()),
  topSignals: z.array(z.any()),
});

export const dashboardProjectionSchema = z.object({
  low: z.number(),
  high: z.number(),
  pointEstimate: z.number(),
  confidencePercent: z.number(),
  suspiciousZonesCount: z.number(),
  recommendations: z.array(z.any()),
});

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
    suspiciousZonesCount: 'number',
    recommendations: 'array',
  },
} as const;

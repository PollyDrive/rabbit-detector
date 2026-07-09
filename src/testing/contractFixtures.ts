import { DEFAULT_ESTIMATOR_SETTINGS } from '../domain/contract';

export const emptyLogScenario = {
  events: []
};

export const strongSignalScenario = {
  events: [
    {
      event_type: 'Следы' as const,
      intensity: 8,
      location: 'Теплица' as const,
      source: 'seed' as const,
      time: 100,
    }
  ]
};

export const weakSignalsScenario = {
  events: [
    {
      event_type: 'Шуршание' as const,
      intensity: 5,
      location: 'Сарай' as const,
      source: 'seed' as const,
      time: 200,
    },
    {
      event_type: 'Датчик движения' as const,
      intensity: 8,
      location: 'Сарай' as const,
      source: 'seed' as const,
      time: 210,
    },
    {
      event_type: 'Шуршание' as const,
      intensity: 4,
      location: 'Сарай' as const,
      source: 'seed' as const,
      time: 220,
    }
  ]
};

export const concurrentZonesScenario = {
  events: [
    {
      event_type: 'Следы' as const,
      intensity: 7,
      location: 'Теплица' as const,
      source: 'seed' as const,
      time: 300,
    },
    {
      event_type: 'Шуршание' as const,
      intensity: 6,
      location: 'Сарай' as const,
      source: 'seed' as const,
      time: 301,
    },
    {
      event_type: 'Новая яма' as const,
      intensity: 5,
      location: 'Огород' as const,
      source: 'seed' as const,
      time: 303,
    }
  ]
};

export const windowBoundaryScenario = {
  events: [
    {
      event_type: 'Следы' as const,
      intensity: 8,
      location: 'Теплица' as const,
      source: 'seed' as const,
      time: 0,
    },
    {
      event_type: 'Следы' as const,
      intensity: 8,
      location: 'Теплица' as const,
      source: 'seed' as const,
      time: 3600,
    }
  ]
};

export const defaultEstimatorSettings = DEFAULT_ESTIMATOR_SETTINGS;

export const mockedDashboardProjection = {
  low: 1,
  high: 3,
  pointEstimate: 2,
  confidencePercent: 75,
  recommendations: [
    {
      zone: 'Огород',
      priority: 8,
      text: 'Выпустить пса в огород',
    }
  ],
  zones: {
    'Огород': {
      presence: 1.0,
      priority: 10,
      dominantSignal: 'Следы',
      urgencyLevel: 'high',
      evidence: [],
      topSignals: [],
    },
  }
};

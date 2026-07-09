import type { EstimatorSettings } from './contract';
import type { EventType } from './event';
import type { Location } from './zones';

export type UrgencyLevel = 'нет активности' | 'низкий' | 'средний' | 'высокий';

const LOW_VALUE_PRIORITY_THRESHOLD = 3;

const FENCE_LOCATIONS = new Set<Location>([
  'Забор — Запад',
  'Забор — Юго-Запад',
  'Забор — Восток',
  'Забор — Юго-Восток',
]);

function isHighValueLocation(location: Location) {
  return location === 'Огород' || location === 'Теплица';
}

function isFenceLocation(location: Location) {
  return FENCE_LOCATIONS.has(location);
}

export function computeUrgencyLevel(priority: number, settings: EstimatorSettings): UrgencyLevel {
  if (priority <= 0) {
    return 'нет активности';
  }

  if (priority < settings.priorityLowThreshold) {
    return 'низкий';
  }

  if (priority <= settings.priorityHighThreshold) {
    return 'средний';
  }

  return 'высокий';
}

function buildRecommendationText(
  dominantSignal: EventType | null,
  location: Location
): string {
  if (!dominantSignal) {
    return 'проверить зону на месте';
  }

  switch (dominantSignal) {
    case 'Пропажа моркови':
      if (location === 'Огород') {
        return 'выпустить пса в огород';
      }

      if (location === 'Теплица') {
        return 'закрыть теплицу';
      }

      if (location === 'Сарай') {
        return 'забрать урожай с фермы';
      }

      return `проверить / укрепить сектор ${location}`;

    case 'Новая яма':
      if (isHighValueLocation(location)) {
        return 'осмотреть грядки, засыпать подкоп';
      }

      return `проверить / укрепить сектор ${location}`;

    case 'Датчик движения':
      return 'проверить зону лично';

    case 'Следы':
      if (isHighValueLocation(location)) {
        return 'подтверждено — приоритетная защита урожая';
      }

      if (isFenceLocation(location)) {
        return 'кролики подтверждены, урон маловероятен';
      }

      return 'кролики подтверждены';

    case 'Шуршание':
      return 'проверить зону на месте';

    default:
      return 'проверить зону на месте';
  }
}

export function computeRecommendationText(input: {
  presence: number;
  dominantSignal: EventType | null;
  location: Location;
  priority: number;
}): string {
  if (input.presence <= 0 || input.priority <= 0) {
    return 'нет активности';
  }

  const baseText = buildRecommendationText(input.dominantSignal, input.location);

  if (input.priority < LOW_VALUE_PRIORITY_THRESHOLD && input.presence === 1) {
    return `${baseText} — кролики подтверждены, но зона малоценна — защита урожая не требуется`;
  }

  return baseText;
}

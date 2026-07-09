import type { Location } from './zones';

export const EVENT_TYPES = [
  'Следы',
  'Пропажа моркови',
  'Новая яма',
  'Шуршание',
  'Датчик движения',
] as const;

export type EventType = typeof EVENT_TYPES[number];

export const EVENT_TYPE_CONFIDENCE: Record<EventType, number> = {
  'Следы': 1.0,
  'Пропажа моркови': 0.8,
  'Новая яма': 0.6,
  'Шуршание': 0.4,
  'Датчик движения': 0.2,
};

export const VALID_LOCATION_EVENT_MATRIX: Record<Location, readonly EventType[]> = {
  'Огород': ['Следы', 'Пропажа моркови', 'Новая яма'],
  'Теплица': ['Следы', 'Пропажа моркови', 'Новая яма', 'Шуршание', 'Датчик движения'],
  'Сарай': ['Пропажа моркови', 'Шуршание', 'Датчик движения'],
  'Забор — Запад': ['Следы', 'Новая яма', 'Шуршание', 'Датчик движения'],
  'Забор — Юго-Запад': ['Следы', 'Новая яма', 'Шуршание', 'Датчик движения'],
  'Забор — Восток': ['Следы', 'Новая яма', 'Шуршание', 'Датчик движения'],
  'Забор — Юго-Восток': ['Следы', 'Новая яма', 'Шуршание', 'Датчик движения'],
};

export function isValidLocationEventType(location: Location, eventType: EventType): boolean {
  return VALID_LOCATION_EVENT_MATRIX[location]?.includes(eventType) ?? false;
}

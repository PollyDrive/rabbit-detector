import { z } from 'zod';
import type { Location } from "./zones";
import type { FarmEvent } from "./contract";

export const EVENT_TYPES = [
  'Следы',
  'Пропажа моркови',
  'Новая яма',
  'Шуршание',
  'Датчик движения',
] as const;

export type EventType = typeof EVENT_TYPES[number];

export const EVENT_SOURCES = ['sim', 'manual', 'seed'] as const;
export type EventSource = typeof EVENT_SOURCES[number];

export const COMPATIBILITY_MATRIX: Record<Location, readonly EventType[]> = {
  'Огород': ['Следы', 'Пропажа моркови', 'Новая яма'],
  'Теплица': ['Следы', 'Пропажа моркови', 'Новая яма', 'Шуршание', 'Датчик движения'],
  'Сарай': ['Пропажа моркови', 'Шуршание', 'Датчик движения'],
  'Забор — Запад': ['Следы', 'Новая яма', 'Шуршание', 'Датчик движения'],
  'Забор — Юго-Запад': ['Следы', 'Новая яма', 'Шуршание', 'Датчик движения'],
  'Забор — Восток': ['Следы', 'Новая яма', 'Шуршание', 'Датчик движения'],
  'Забор — Юго-Восток': ['Следы', 'Новая яма', 'Шуршание', 'Датчик движения'],
};

export const eventTypeSchema = z.enum(EVENT_TYPES);
export const eventSourceSchema = z.enum(EVENT_SOURCES);
export const locationSchema = z.enum([
  'Огород',
  'Теплица',
  'Сарай',
  'Забор — Запад',
  'Забор — Юго-Запад',
  'Забор — Восток',
  'Забор — Юго-Восток',
]);

export const farmEventSchema = z.object({
  id: z.number().int().positive(),
  event_type: eventTypeSchema,
  location: locationSchema,
  intensity: z.number().int().min(1).max(10),
  time: z.number(),
  source: eventSourceSchema,
});

export function isValidEvent(
  event: Omit<FarmEvent, 'id' | 'time'>,
  dogInGarden = false
): boolean {
  const allowedTypes = COMPATIBILITY_MATRIX[event.location];
  if (!allowedTypes || !allowedTypes.includes(event.event_type)) {
    return false;
  }
  if (dogInGarden && event.location === 'Огород' && event.event_type === 'Следы') {
    return false;
  }
  if (event.intensity < 1 || event.intensity > 10) {
    return false;
  }
  return true;
}

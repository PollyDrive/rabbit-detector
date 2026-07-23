import { COMPATIBILITY_MATRIX, type EventType, isValidEvent, farmEventSchema } from './event';
import type { FarmEvent } from './contract';
import type { Location } from './zones';
import { CARROT_FIXED_INTENSITY } from './config';

export const GAME_DAY_SECONDS = 3600;
export const INITIAL_SEED_COUNT = 24;

export function formatGameTime(totalSeconds: number): string {
  const normalizedSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(normalizedSeconds / 3600);
  const minutes = Math.floor((normalizedSeconds % 3600) / 60);
  const seconds = normalizedSeconds % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

function randomInt(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pickRandomItem<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

export function pickRandomEventDetails(
  random: () => number,
  dogInGarden = false,
): { location: Location; event_type: EventType; intensity: number } {
  const candidates = Object.entries(COMPATIBILITY_MATRIX).flatMap(([location, eventTypes]) =>
    eventTypes.flatMap((eventType) => {
      if (dogInGarden && location === 'Огород') {
        return [];
      }

      return [{ location: location as Location, event_type: eventType }];
    }),
  );

  const picked = pickRandomItem(candidates, random);

  return {
    ...picked,
    intensity: picked.event_type === 'Пропажа морковки' ? CARROT_FIXED_INTENSITY : randomInt(1, 10, random),
  };
}

export function createSimulatorEvent(
  time: number,
  random: () => number,
  dogInGarden = false,
): Omit<FarmEvent, 'id'> {
  const details = pickRandomEventDetails(random, dogInGarden);

  return {
    ...details,
    time,
    source: 'sim',
  };
}

export function createSeedBatch(
  now: number,
  random: () => number,
  dogInGarden = false,
  count = INITIAL_SEED_COUNT,
): Omit<FarmEvent, 'id'>[] {
  const startTime = now - GAME_DAY_SECONDS;
  const batch = Array.from({ length: count }, () => {
    const details = pickRandomEventDetails(random, dogInGarden);
    const time = Math.floor(startTime + random() * GAME_DAY_SECONDS);

    return {
      ...details,
      time,
      source: 'seed' as const,
    };
  });

  return batch.sort((left, right) => left.time - right.time);
}

export function isValidSeedBatchEntry(
  event: Omit<FarmEvent, 'id'>,
  dogInGarden = false,
): boolean {
  return isValidEvent(event, dogInGarden);
}

export function validateSeedBatch(
  batch: Omit<FarmEvent, 'id'>[],
  dogInGarden: boolean,
  startId: number
): { valid: FarmEvent[]; rejectedCount: number } {
  const valid: FarmEvent[] = [];
  let id = startId;
  let rejectedCount = 0;

  for (const event of batch) {
    const candidate: FarmEvent = {
      ...event,
      id,
    };
    const parsed = farmEventSchema.safeParse(candidate);
    if (!parsed.success || !isValidEvent(candidate, dogInGarden)) {
      rejectedCount += 1;
      continue;
    }

    valid.push(parsed.data);
    id += 1;
  }

  return { valid, rejectedCount };
}

import { TIME_WINDOW_SPEC, type EstimatorSettings, type FarmEvent } from './contract';
import { credibilityOf } from './projection';
import type { EventType } from './event';

import { EVENT_TYPE_CONFIDENCE } from './event';

function getEventTypeConfidence(eventType: EventType): number {
  return EVENT_TYPE_CONFIDENCE[eventType];
}

function compareByStrength(a: FarmEvent, b: FarmEvent): number {
  const credibilityDelta = credibilityOf(b) - credibilityOf(a);
  if (credibilityDelta !== 0) {
    return credibilityDelta;
  }

  const confidenceDelta = getEventTypeConfidence(b.event_type) - getEventTypeConfidence(a.event_type);
  if (confidenceDelta !== 0) {
    return confidenceDelta;
  }

  if (b.id !== a.id) {
    return b.id - a.id;
  }

  if (b.time !== a.time) {
    return b.time - a.time;
  }

  return a.event_type.localeCompare(b.event_type);
}

export function computeDominantSignal(events: FarmEvent[]): EventType | null {
  if (events.length === 0) {
    return null;
  }

  const grouped = new Map<
    EventType,
    {
      credibility: number;
      lastEventId: number;
    }
  >();

  for (const event of events) {
    const score = credibilityOf(event);
    const current = grouped.get(event.event_type);

    if (!current) {
      grouped.set(event.event_type, {
        credibility: score,
        lastEventId: event.id,
      });
      continue;
    }

    current.credibility += score;
    current.lastEventId = Math.max(current.lastEventId, event.id);
  }

  let winner: { eventType: EventType; credibility: number; lastEventId: number } | null = null;

  for (const [eventType, stats] of grouped) {
    if (!winner) {
      winner = { eventType, ...stats };
      continue;
    }

    const currentConfidence = getEventTypeConfidence(eventType);
    const winnerConfidence = getEventTypeConfidence(winner.eventType);

    if (
      stats.credibility > winner.credibility ||
      (stats.credibility === winner.credibility && currentConfidence > winnerConfidence) ||
      (stats.credibility === winner.credibility &&
        currentConfidence === winnerConfidence &&
        stats.lastEventId > winner.lastEventId) ||
      (stats.credibility === winner.credibility &&
        currentConfidence === winnerConfidence &&
        stats.lastEventId === winner.lastEventId &&
        eventType.localeCompare(winner.eventType) < 0)
    ) {
      winner = { eventType, ...stats };
    }
  }

  return winner?.eventType ?? null;
}

export function computeEvidence(
  events: FarmEvent[],
  now: number,
  settings: EstimatorSettings
): FarmEvent[] {
  const windowStart = now - TIME_WINDOW_SPEC.durationSeconds;
  const windowEvents = events.filter((event) => event.time >= windowStart && event.time <= now);
  const strongEvents = windowEvents.filter((event) => credibilityOf(event) >= settings.tau);

  if (strongEvents.length === 0) {
    return [];
  }

  let bestWindowStart = strongEvents[0]!.time;
  let bestWindowEnd = strongEvents[0]!.time;
  let bestOccupiedCount = 0;
  let bestCredibilitySum = -Infinity;
  let bestMaxEventId = -Infinity;
  let bestEvidence: FarmEvent[] = [];

  const orderedStrongEvents = [...strongEvents].sort((a, b) => a.time - b.time || a.id - b.id);

  for (const endEvent of orderedStrongEvents) {
    const windowLowerBound = endEvent.time - settings.concurrencyWindowSeconds;
    const candidateEvidence = orderedStrongEvents.filter(
      (event) => event.time >= windowLowerBound && event.time <= endEvent.time
    );
    const occupiedLocations = new Set(candidateEvidence.map((event) => event.location));
    const credibilitySum = candidateEvidence.reduce((sum, event) => sum + credibilityOf(event), 0);
    const maxEventId = candidateEvidence.reduce((max, event) => Math.max(max, event.id), -Infinity);

    if (
      occupiedLocations.size > bestOccupiedCount ||
      (occupiedLocations.size === bestOccupiedCount && credibilitySum > bestCredibilitySum) ||
      (occupiedLocations.size === bestOccupiedCount &&
        credibilitySum === bestCredibilitySum &&
        endEvent.time > bestWindowEnd) ||
      (occupiedLocations.size === bestOccupiedCount &&
        credibilitySum === bestCredibilitySum &&
        endEvent.time === bestWindowEnd &&
        maxEventId > bestMaxEventId)
    ) {
      bestOccupiedCount = occupiedLocations.size;
      bestCredibilitySum = credibilitySum;
      bestWindowStart = windowLowerBound;
      bestWindowEnd = endEvent.time;
      bestMaxEventId = maxEventId;
      bestEvidence = candidateEvidence;
    }
  }

  return events.filter(
    (event) =>
      event.time >= bestWindowStart &&
      event.time <= bestWindowEnd &&
      credibilityOf(event) >= settings.tau &&
      bestEvidence.some((evidenceEvent) => evidenceEvent.id === event.id)
  );
}

export function computeTopSignals(events: FarmEvent[]): FarmEvent[] {
  return [...events].sort(compareByStrength);
}

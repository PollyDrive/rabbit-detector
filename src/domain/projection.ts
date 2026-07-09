import type { FarmEvent } from './contract'

export function eventsInWindow(log: FarmEvent[], now: number): FarmEvent[] {
  return log.filter((event) => event.time >= now - 3600 && event.time <= now)
}

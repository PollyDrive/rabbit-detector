import { DEFAULT_ESTIMATOR_SETTINGS } from "../domain/contract";
import type { FarmEvent } from "../domain/contract";
import { LOCATIONS, type Location } from "../domain/zones";

// Confidence mapping for credibility
const confidenceByEventType: Record<string, number> = {
  "Следы": 1.0,
  "Шорох": 0.4,
  "Пропала морковь": 0.8,
  "Движение": 0.6,
};

// Mock asset values for priority math
const mockAssetValues: Record<Location, number> = {
  "Огород": 10,
  "Теплица": 8,
  "Сарай": 5,
  "Забор — Запад": 1,
  "Забор — Юго-Запад": 1,
  "Забор — Восток": 1,
  "Забор — Юго-Восток": 1,
};

export function calculateCredibility(event: FarmEvent): number {
  const confidence = confidenceByEventType[event.event_type] ?? 0.5;
  return confidence * (event.intensity / 10);
}

export function calculateZonePresence(
  location: Location,
  events: FarmEvent[],
  tau: number = DEFAULT_ESTIMATOR_SETTINGS.tau,
  k: number = DEFAULT_ESTIMATOR_SETTINGS.k
) {
  const zoneEvents = events.filter((e) => e.location === location);
  if (zoneEvents.length === 0) return 0;

  const credibilities = zoneEvents.map(calculateCredibility);
  const maxCred = Math.max(...credibilities);
  if (maxCred >= tau) {
    return 1.0;
  }

  const avgCred = credibilities.reduce((a, b) => a + b, 0) / zoneEvents.length;
  return avgCred * (1 - Math.exp(-zoneEvents.length / k));
}

export function calculateDashboardEstimates(
  events: FarmEvent[],
  concurrencyWindow: number = DEFAULT_ESTIMATOR_SETTINGS.concurrencyWindowSeconds,
  tau: number = DEFAULT_ESTIMATOR_SETTINGS.tau
) {
  // calculate High: unique zones with ANY activity
  const activeZones = new Set(events.map((e) => e.location));
  const high = activeZones.size;

  // calculate Low: max over any concurrency_window of zones with at least one event with credibility >= tau
  let low = 0;
  
  if (events.length > 0) {
    // Sort events by time
    const sorted = [...events].sort((a, b) => a.time - b.time);
    
    // Slide a window of size `concurrencyWindow` over the events
    for (let i = 0; i < sorted.length; i++) {
      const windowStart = sorted[i].time;
      const windowEnd = windowStart + concurrencyWindow;
      
      const eventsInWindow = sorted.filter(e => e.time >= windowStart && e.time <= windowEnd);
      
      const zonesWithStrongSignal = new Set<Location>();
      for (const e of eventsInWindow) {
        if (calculateCredibility(e) >= tau) {
          zonesWithStrongSignal.add(e.location);
        }
      }
      
      if (zonesWithStrongSignal.size > low) {
        low = zonesWithStrongSignal.size;
      }
    }
  }

  const pointEstimate = low;
  const confidencePercent = high === 0 ? 0 : Math.round((low / high) * 100);

  return {
    low,
    high,
    pointEstimate,
    confidencePercent
  };
}

export function runSpike(scenario: { events: FarmEvent[], name: string }) {
  console.log(`\n=== Running spike for scenario: ${scenario.name} ===`);
  
  const dashboard = calculateDashboardEstimates(scenario.events);
  
  // Fields revealed by spike math:
  // We clearly need presence and priority.
  // We can also extract topSignals (events with highest credibility), dominantSignal, urgencyLevel.
  // And the raw list of evidence.
  const zonesResult: Record<string, any> = {};
  
  for (const loc of LOCATIONS) {
    const presence = calculateZonePresence(loc, scenario.events);
    const priority = presence * mockAssetValues[loc];
    
    const zoneEvents = scenario.events.filter(e => e.location === loc);
    const credibilities = zoneEvents.map(calculateCredibility);
    const maxCred = credibilities.length > 0 ? Math.max(...credibilities) : 0;
    
    let urgencyLevel = "low";
    if (presence === 1.0) urgencyLevel = "critical";
    else if (presence > 0.5) urgencyLevel = "high";
    else if (presence > 0) urgencyLevel = "medium";
    
    const dominantSignal = zoneEvents.length > 0 
      ? zoneEvents.reduce((prev, current) => 
          calculateCredibility(prev) > calculateCredibility(current) ? prev : current
        ).event_type 
      : null;
      
    zonesResult[loc] = {
      presence,
      priority,
      dominantSignal,
      urgencyLevel,
      evidence: zoneEvents,
      topSignals: zoneEvents.sort((a, b) => calculateCredibility(b) - calculateCredibility(a)).slice(0, 3)
    };
  }
  
  console.log("Dashboard:", dashboard);
  
  // Print zones with non-zero presence
  const active = Object.entries(zonesResult)
    .filter(([_, data]) => data.presence > 0)
    .sort((a, b) => b[1].priority - a[1].priority);
    
  for (const [loc, data] of active) {
    console.log(`Zone: ${loc} | Presence: ${data.presence.toFixed(2)} | Priority: ${data.priority.toFixed(2)} | Dominant: ${data.dominantSignal} | Urgency: ${data.urgencyLevel}`);
  }
}

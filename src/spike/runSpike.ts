import { emptyLogScenario, strongSignalScenario, weakSignalsScenario } from "../testing/contractFixtures";
import { runSpike } from "./mathSpike";

import type { FarmEvent } from "../domain/contract";

runSpike({ events: emptyLogScenario.events as FarmEvent[], name: "Empty Log Scenario" });
runSpike({ events: strongSignalScenario.events as FarmEvent[], name: "Strong Signal Scenario" });
runSpike({ events: weakSignalsScenario.events as FarmEvent[], name: "Weak Signals Scenario" });

// Documented fields for the projection shape:
// ZONE:
// - presence (number)
// - priority (number)
// - dominantSignal (string | null)
// - urgencyLevel (string: 'critical' | 'high' | 'medium' | 'low')
// - evidence (array of events)
// - topSignals (array of events)
//
// DASHBOARD:
// - low (number)
// - high (number)
// - pointEstimate (number)
// - confidencePercent (number)
// - recommendations (array of strings, e.g., 'Check Огород first')

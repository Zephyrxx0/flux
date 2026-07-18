import type { SimulationInput } from "../../src/simulation/contracts/input.schema"

export function createBaseInput(overrides: Partial<SimulationInput> = {}): SimulationInput {
  return {
    schemaVersion: "1.1.0",
    mode: "zone",
    phases: [
      { id: "entry", order: 1, durationMin: 15 },
      { id: "first-half", order: 2, durationMin: 45 },
    ],
    zones: [
      { id: "north", capacity: 1000 },
      { id: "south", capacity: 800 },
    ],
    gates: [
      { id: "north-g1", zoneId: "north", throughputPerMin: 20, delayMin: 0 },
      { id: "south-g1", zoneId: "south", throughputPerMin: 15, delayMin: 0 },
    ],
    arrivals: [
      { phaseId: "entry", zoneId: "north", demandFans: 200 },
      { phaseId: "entry", zoneId: "south", demandFans: 120 },
    ],
    detailed: {
      subZonesPerZone: 2,
    },
    ...overrides,
  }
}

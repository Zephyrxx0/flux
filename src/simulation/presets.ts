import { CURRENT_SCHEMA_VERSION } from "./contracts/schemaVersion"
import type { SimulationInput } from "./contracts/input.schema"

export type PresetName = "normal" | "rush" | "crisis"

export const presets: Record<PresetName, SimulationInput> = {
  normal: {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    mode: "zone",
    phases: [
      { id: "entry", order: 1, durationMin: 20 },
      { id: "first-half", order: 2, durationMin: 45 },
      { id: "halftime", order: 3, durationMin: 20 },
    ],
    zones: [
      { id: "north", capacity: 1200 },
      { id: "south", capacity: 1100 },
      { id: "east", capacity: 900 },
      { id: "west", capacity: 900 },
    ],
    gates: [
      { id: "north-g1", zoneId: "north", throughputPerMin: 30, delayMin: 0 },
      { id: "south-g1", zoneId: "south", throughputPerMin: 26, delayMin: 0 },
      { id: "east-g1", zoneId: "east", throughputPerMin: 22, delayMin: 1 },
      { id: "west-g1", zoneId: "west", throughputPerMin: 22, delayMin: 1 },
    ],
    arrivals: [
      { phaseId: "entry", zoneId: "north", demandFans: 700 },
      { phaseId: "entry", zoneId: "south", demandFans: 600 },
      { phaseId: "entry", zoneId: "east", demandFans: 500 },
      { phaseId: "entry", zoneId: "west", demandFans: 500 },
      { phaseId: "first-half", zoneId: "north", demandFans: 200 },
      { phaseId: "first-half", zoneId: "south", demandFans: 200 },
      { phaseId: "first-half", zoneId: "east", demandFans: 150 },
      { phaseId: "first-half", zoneId: "west", demandFans: 150 },
    ],
  },
  rush: {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    mode: "zone",
    phases: [
      { id: "entry", order: 1, durationMin: 10 },
      { id: "first-half", order: 2, durationMin: 45 },
      { id: "halftime", order: 3, durationMin: 15 },
    ],
    zones: [
      { id: "north", capacity: 1200 },
      { id: "south", capacity: 1100 },
      { id: "east", capacity: 900 },
      { id: "west", capacity: 900 },
    ],
    gates: [
      { id: "north-g1", zoneId: "north", throughputPerMin: 32, delayMin: 0 },
      { id: "south-g1", zoneId: "south", throughputPerMin: 28, delayMin: 0 },
      { id: "east-g1", zoneId: "east", throughputPerMin: 24, delayMin: 0 },
      { id: "west-g1", zoneId: "west", throughputPerMin: 24, delayMin: 0 },
    ],
    arrivals: [
      { phaseId: "entry", zoneId: "north", demandFans: 900 },
      { phaseId: "entry", zoneId: "south", demandFans: 800 },
      { phaseId: "entry", zoneId: "east", demandFans: 650 },
      { phaseId: "entry", zoneId: "west", demandFans: 650 },
      { phaseId: "first-half", zoneId: "north", demandFans: 200 },
      { phaseId: "first-half", zoneId: "south", demandFans: 200 },
      { phaseId: "first-half", zoneId: "east", demandFans: 200 },
      { phaseId: "first-half", zoneId: "west", demandFans: 200 },
    ],
  },
  crisis: {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    mode: "zone",
    phases: [
      { id: "entry", order: 1, durationMin: 20 },
      { id: "first-half", order: 2, durationMin: 45 },
      { id: "halftime", order: 3, durationMin: 20 },
    ],
    zones: [
      { id: "north", capacity: 1200 },
      { id: "south", capacity: 1100 },
      { id: "east", capacity: 900 },
      { id: "west", capacity: 900 },
    ],
    gates: [
      { id: "north-g1", zoneId: "north", throughputPerMin: 30, delayMin: 4 },
      { id: "south-g1", zoneId: "south", throughputPerMin: 18, delayMin: 6 },
      { id: "east-g1", zoneId: "east", throughputPerMin: 14, delayMin: 7 },
      { id: "west-g1", zoneId: "west", throughputPerMin: 14, delayMin: 7 },
    ],
    arrivals: [
      { phaseId: "entry", zoneId: "north", demandFans: 1100 },
      { phaseId: "entry", zoneId: "south", demandFans: 1000 },
      { phaseId: "entry", zoneId: "east", demandFans: 800 },
      { phaseId: "entry", zoneId: "west", demandFans: 800 },
      { phaseId: "first-half", zoneId: "north", demandFans: 300 },
      { phaseId: "first-half", zoneId: "south", demandFans: 200 },
      { phaseId: "first-half", zoneId: "east", demandFans: 200 },
      { phaseId: "first-half", zoneId: "west", demandFans: 200 },
    ],
  },
}

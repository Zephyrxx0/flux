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
    ],
    gates: [
      { id: "north-g1", zoneId: "north", throughputPerMin: 30, delayMin: 0 },
      { id: "south-g1", zoneId: "south", throughputPerMin: 26, delayMin: 0 },
      { id: "east-g1", zoneId: "east", throughputPerMin: 22, delayMin: 1 },
    ],
    arrivals: [
      { phaseId: "entry", zoneId: "north", demandFans: 380 },
      { phaseId: "entry", zoneId: "south", demandFans: 320 },
      { phaseId: "entry", zoneId: "east", demandFans: 260 },
      { phaseId: "first-half", zoneId: "north", demandFans: 120 },
      { phaseId: "first-half", zoneId: "south", demandFans: 110 },
      { phaseId: "first-half", zoneId: "east", demandFans: 80 },
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
      { id: "north", capacity: 1300 },
      { id: "south", capacity: 1200 },
      { id: "east", capacity: 950 },
    ],
    gates: [
      { id: "north-g1", zoneId: "north", throughputPerMin: 32, delayMin: 0 },
      { id: "south-g1", zoneId: "south", throughputPerMin: 28, delayMin: 0 },
      { id: "east-g1", zoneId: "east", throughputPerMin: 24, delayMin: 0 },
    ],
    arrivals: [
      { phaseId: "entry", zoneId: "north", demandFans: 620 },
      { phaseId: "entry", zoneId: "south", demandFans: 560 },
      { phaseId: "entry", zoneId: "east", demandFans: 420 },
      { phaseId: "first-half", zoneId: "north", demandFans: 180 },
      { phaseId: "first-half", zoneId: "south", demandFans: 160 },
      { phaseId: "first-half", zoneId: "east", demandFans: 130 },
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
      { id: "north", capacity: 1250 },
      { id: "south", capacity: 1150 },
      { id: "east", capacity: 900 },
    ],
    gates: [
      { id: "north-g1", zoneId: "north", throughputPerMin: 30, delayMin: 4 },
      { id: "south-g1", zoneId: "south", throughputPerMin: 18, delayMin: 6 },
      { id: "east-g1", zoneId: "east", throughputPerMin: 14, delayMin: 7 },
    ],
    arrivals: [
      { phaseId: "entry", zoneId: "north", demandFans: 500 },
      { phaseId: "entry", zoneId: "south", demandFans: 460 },
      { phaseId: "entry", zoneId: "east", demandFans: 350 },
      { phaseId: "first-half", zoneId: "north", demandFans: 150 },
      { phaseId: "first-half", zoneId: "south", demandFans: 130 },
      { phaseId: "first-half", zoneId: "east", demandFans: 110 },
    ],
  },
}

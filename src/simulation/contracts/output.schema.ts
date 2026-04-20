import { z } from "zod"
import { CURRENT_SCHEMA_VERSION } from "./schemaVersion"

const SeveritySchema = z.enum(["green", "amber", "red", "critical"])

const PhaseZoneRowSchema = z.object({
  phaseId: z.string().min(1),
  zoneId: z.string().min(1),
  occupancyFans: z.int().min(0),
  occupancyRatio: z.number().min(0),
  occupancySeverity: SeveritySchema,
  carryInFans: z.int().min(0),
  arrivalsFans: z.int().min(0),
  availableThroughput: z.int().min(0),
  processedFans: z.int().min(0),
  overflowCarryFans: z.int().min(0),
  blockedByDelay: z.boolean(),
})

const PeakSummarySchema = z.object({
  zoneId: z.string().min(1),
  phaseId: z.string().min(1),
  peakOccupancyFans: z.int().min(0),
  peakOccupancyRatio: z.number().min(0),
  peakSeverity: SeveritySchema,
})

const InvariantsSchema = z.object({
  deterministicReplay: z.boolean(),
  nonNegativeOccupancy: z.boolean(),
  throughputBoundRespected: z.boolean(),
  carryOverConservation: z.boolean(),
  matrixComplete: z.boolean(),
})

export const SimulationOutputSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  runDeterministicHash: z.string().min(1),
  mode: z.enum(["zone", "detailed"]),
  phaseZoneMatrix: z.array(PhaseZoneRowSchema),
  peakSummaries: z.array(PeakSummarySchema),
  invariants: InvariantsSchema,
  warnings: z.array(z.string()),
})

export type SimulationOutput = z.infer<typeof SimulationOutputSchema>

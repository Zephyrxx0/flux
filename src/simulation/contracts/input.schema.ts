import { z } from "zod"
import { CURRENT_SCHEMA_VERSION } from "./schemaVersion"

const ModeSchema = z.enum(["zone", "detailed"])

const PhaseSchema = z.object({
  id: z.string().min(1),
  order: z.int().min(1),
  durationMin: z.int().min(1),
})

const ZoneSchema = z.object({
  id: z.string().min(1),
  capacity: z.int().min(1),
})

const GateSchema = z.object({
  id: z.string().min(1),
  zoneId: z.string().min(1),
  throughputPerMin: z.int().min(0),
  delayMin: z.int().min(0),
})

const ArrivalSchema = z.object({
  phaseId: z.string().min(1),
  zoneId: z.string().min(1),
  demandFans: z.int().min(0),
})

const DetailedModeSchema = z.object({
  subZonesPerZone: z.literal(2),
})

function findDuplicateIndexes<T>(values: T[]): number[] {
  const seen = new Map<T, number>()
  const duplicates: number[] = []

  values.forEach((value, index) => {
    if (seen.has(value)) {
      duplicates.push(index)
      return
    }
    seen.set(value, index)
  })

  return duplicates
}

export const SimulationInputSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  mode: ModeSchema,
  phases: z.array(PhaseSchema).min(1),
  zones: z.array(ZoneSchema).min(1),
  gates: z.array(GateSchema),
  arrivals: z.array(ArrivalSchema),
  detailed: DetailedModeSchema.optional(),
}).superRefine((input, ctx) => {
  findDuplicateIndexes(input.phases.map((phase) => phase.id)).forEach((index) => {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phases", index, "id"],
      message: "duplicate phase id",
    })
  })

  findDuplicateIndexes(input.phases.map((phase) => phase.order)).forEach((index) => {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phases", index, "order"],
      message: "duplicate phase order",
    })
  })

  findDuplicateIndexes(input.zones.map((zone) => zone.id)).forEach((index) => {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["zones", index, "id"],
      message: "duplicate zone id",
    })
  })

  findDuplicateIndexes(input.gates.map((gate) => gate.id)).forEach((index) => {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["gates", index, "id"],
      message: "duplicate gate id",
    })
  })

  const phaseIds = new Set(input.phases.map((phase) => phase.id))
  const zoneIds = new Set(input.zones.map((zone) => zone.id))

  input.gates.forEach((gate, index) => {
    if (!zoneIds.has(gate.zoneId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gates", index, "zoneId"],
        message: `gate references unknown zone '${gate.zoneId}'`,
      })
    }
  })

  input.arrivals.forEach((arrival, index) => {
    if (!phaseIds.has(arrival.phaseId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["arrivals", index, "phaseId"],
        message: `arrival references unknown phase '${arrival.phaseId}'`,
      })
    }

    if (!zoneIds.has(arrival.zoneId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["arrivals", index, "zoneId"],
        message: `arrival references unknown zone '${arrival.zoneId}'`,
      })
    }
  })

  if (input.mode === "detailed" && !input.detailed) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["detailed"],
      message: "detailed mode requires explicit two-sub-zone metadata",
    })
  }

  if (input.mode === "zone" && input.detailed?.subZonesPerZone === 2) {
    // Zone mode can carry compatibility metadata, so this branch is intentionally no-op.
  }
})

export type SimulationInput = z.infer<typeof SimulationInputSchema>

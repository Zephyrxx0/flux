import { z } from "zod"

export const BriefingExportSchema = z.strictObject({
  generatedAt: z.string().min(1),
  metadata: z.strictObject({
    baseline: z.strictObject({
      id: z.string().min(1),
      scenarioLabel: z.string().min(1),
      runDeterministicHash: z.string().min(1),
      createdAt: z.string().min(1),
    }),
    candidate: z.strictObject({
      id: z.string().min(1),
      scenarioLabel: z.string().min(1),
      runDeterministicHash: z.string().min(1),
      createdAt: z.string().min(1),
    }),
  }),
  overall: z.strictObject({
    baselinePeakRatio: z.number().min(0),
    candidatePeakRatio: z.number().min(0),
    absoluteDelta: z.number(),
    percentDelta: z.number(),
  }),
  topChanges: z.array(
    z.strictObject({
      zoneId: z.string().min(1),
      baselinePeakRatio: z.number().min(0),
      candidatePeakRatio: z.number().min(0),
      absoluteDelta: z.number(),
      percentDelta: z.number(),
      severityTransition: z.string().min(1),
    }),
  ),
  recommendations: z.array(z.string().min(1)),
  assumptionsLimitations: z.array(z.string().min(1)),
})

export type BriefingExport = z.infer<typeof BriefingExportSchema>

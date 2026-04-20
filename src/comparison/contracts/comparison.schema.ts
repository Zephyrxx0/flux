import { z } from "zod"

import { SimulationOutputSchema } from "@/simulation/contracts/output.schema"

export const PersistedRunSchema = z.strictObject({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  runDeterministicHash: z.string().min(1),
  scenarioLabel: z.string().min(1),
  output: SimulationOutputSchema,
})

export const ComparisonPairSchema = z
  .strictObject({
    baselineRunId: z.string().min(1),
    candidateRunId: z.string().min(1),
  })
  .refine((value) => value.baselineRunId !== value.candidateRunId, {
    message: "Baseline and candidate runs must be different",
    path: ["candidateRunId"],
  })

export type PersistedRun = z.infer<typeof PersistedRunSchema>
export type ComparisonPair = z.infer<typeof ComparisonPairSchema>

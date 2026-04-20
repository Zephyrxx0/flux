import { z } from "zod"

export const RiskReportSectionKeys = [
  "overall",
  "criticalZones",
  "staffingRecommendations",
  "assumptionsLimitations",
  "evidence",
  "executiveSummary",
] as const

const RiskLevelSchema = z.enum(["green", "amber", "red", "critical"])
const PrioritySchema = z.enum(["high", "medium", "low"])

const OverallRiskSchema = z.strictObject({
  riskLevel: RiskLevelSchema,
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1),
})

const CriticalZoneSchema = z.strictObject({
  zoneId: z.string().min(1),
  phaseId: z.string().min(1),
  peakOccupancyRatio: z.number().min(0),
  peakSeverity: RiskLevelSchema,
  recommendedAction: z.string().min(1),
})

const StaffingRecommendationSchema = z.strictObject({
  zoneId: z.string().min(1),
  phaseId: z.string().min(1),
  priority: PrioritySchema,
  action: z.string().min(1),
  expectedImpact: z.string().min(1),
})

const EvidenceSchema = z.strictObject({
  runDeterministicHash: z.string().min(1),
  generatedFrom: z.literal("simulation-output"),
  rowsAnalyzed: z.int().min(0),
  peakZones: z.array(z.string().min(1)),
  warnings: z.array(z.string()),
})

export const RiskReportSchema = z.strictObject({
  source: z.enum(["ai", "fallback"]),
  generatedAt: z.string().min(1),
  overall: OverallRiskSchema,
  criticalZones: z.array(CriticalZoneSchema),
  staffingRecommendations: z.array(StaffingRecommendationSchema),
  assumptionsLimitations: z.array(z.string().min(1)),
  evidence: EvidenceSchema,
  executiveSummary: z.string().min(1),
})

export type RiskReport = z.infer<typeof RiskReportSchema>

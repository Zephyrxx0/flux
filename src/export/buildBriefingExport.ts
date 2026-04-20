import type { ComparisonViewModel } from "@/comparison/selectors/buildComparisonViewModel"
import type { RiskReport } from "@/reporting"
import { BriefingExportSchema, type BriefingExport } from "@/export/contracts/briefingExport.schema"

export function buildBriefingExport(model: ComparisonViewModel, report: RiskReport | null): BriefingExport {
  const recommendations = report
    ? report.staffingRecommendations.map((item) => `${item.priority.toUpperCase()}: ${item.action} (${item.expectedImpact})`)
    : ["No report recommendations available for this run pair."]

  const assumptionsLimitations = report?.assumptionsLimitations ?? ["No report assumptions/limitations available."]

  return BriefingExportSchema.parse({
    generatedAt: new Date().toISOString(),
    metadata: {
      baseline: {
        id: model.baseline.id,
        scenarioLabel: model.baseline.scenarioLabel,
        runDeterministicHash: model.baseline.runDeterministicHash,
        createdAt: model.baseline.createdAt,
      },
      candidate: {
        id: model.candidate.id,
        scenarioLabel: model.candidate.scenarioLabel,
        runDeterministicHash: model.candidate.runDeterministicHash,
        createdAt: model.candidate.createdAt,
      },
    },
    overall: model.overall,
    topChanges: model.topZoneDeltas.map((zone) => ({
      zoneId: zone.zoneId,
      baselinePeakRatio: zone.baselinePeakRatio,
      candidatePeakRatio: zone.candidatePeakRatio,
      absoluteDelta: zone.absoluteDelta,
      percentDelta: zone.percentDelta,
      severityTransition: zone.severityTransition,
    })),
    recommendations,
    assumptionsLimitations,
  })
}

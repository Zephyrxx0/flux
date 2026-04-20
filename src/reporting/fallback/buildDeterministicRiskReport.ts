import { RiskReportSchema, type RiskReport } from "@/reporting/contracts/riskReport.schema"
import type { SimulationOutput } from "@/simulation/contracts/output.schema"
import { createRecommendation, rankPeaks } from "./rules"

function summarizeInvariantGaps(output: SimulationOutput): string[] {
  const gaps = Object.entries(output.invariants)
    .filter(([, value]) => !value)
    .map(([key]) => `Invariant check failed: ${key}`)

  if (output.warnings.length > 0) {
    gaps.push(`Simulation warnings present: ${output.warnings.length}`)
  }

  return gaps.length > 0
    ? gaps
    : ["Deterministic simulation invariants passed for this run."]
}

export function buildDeterministicRiskReport(output: SimulationOutput): RiskReport {
  const sortedPeaks = rankPeaks(output)
  const topPeaks = sortedPeaks.slice(0, 3)
  const highest = topPeaks[0]

  const overallRisk = highest?.peakSeverity ?? "green"
  const confidenceChecks = Object.values(output.invariants).filter(Boolean).length
  const confidence = Number((confidenceChecks / Math.max(1, Object.keys(output.invariants).length)).toFixed(2))

  const criticalZones = topPeaks.map((peak) => ({
    zoneId: peak.zoneId,
    phaseId: peak.phaseId,
    peakOccupancyRatio: peak.peakOccupancyRatio,
    peakSeverity: peak.peakSeverity,
    recommendedAction: createRecommendation(peak).action,
  }))

  const staffingRecommendations = topPeaks.map((peak) => createRecommendation(peak))

  const report: RiskReport = {
    source: "fallback",
    generatedAt: `deterministic:${output.runDeterministicHash}`,
    overall: {
      riskLevel: overallRisk,
      confidence,
      rationale:
        criticalZones.length > 0
          ? `Highest peak risk observed in ${criticalZones[0].zoneId} during ${criticalZones[0].phaseId}.`
          : "No peak zones were available; defaulting to low-risk baseline.",
    },
    criticalZones,
    staffingRecommendations,
    assumptionsLimitations: summarizeInvariantGaps(output),
    evidence: {
      runDeterministicHash: output.runDeterministicHash,
      generatedFrom: "simulation-output",
      rowsAnalyzed: output.phaseZoneMatrix.length,
      peakZones: topPeaks.map((peak) => peak.zoneId),
      warnings: output.warnings,
    },
    executiveSummary:
      criticalZones.length > 0
        ? `Fallback report: prioritize ${criticalZones[0].zoneId} in ${criticalZones[0].phaseId}; ${staffingRecommendations.length} staffing action(s) queued.`
        : "Fallback report: no critical hotspots detected from current simulation output.",
  }

  return RiskReportSchema.parse(report)
}

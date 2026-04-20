import type { SimulationOutput } from "@/simulation/contracts/output.schema"

type Peak = SimulationOutput["peakSummaries"][number]

function priorityFromRatio(ratio: number): "high" | "medium" | "low" {
  if (ratio >= 0.95) {
    return "high"
  }

  if (ratio >= 0.8) {
    return "medium"
  }

  return "low"
}

function actionFromSeverity(severity: Peak["peakSeverity"]): string {
  if (severity === "critical" || severity === "red") {
    return "Deploy additional stewards and activate queue split routing immediately."
  }

  if (severity === "amber") {
    return "Pre-position support stewards and begin directional queue metering."
  }

  return "Maintain standard staffing with observation cadence checks."
}

function impactFromSeverity(severity: Peak["peakSeverity"]): string {
  if (severity === "critical" || severity === "red") {
    return "Reduces near-capacity dwell time and lowers spillover risk."
  }

  if (severity === "amber") {
    return "Prevents escalation into red-band occupancy during next phase."
  }

  return "Maintains steady ingress and preserves throughput headroom."
}

export function rankPeaks(output: SimulationOutput): Peak[] {
  return [...output.peakSummaries].sort((left, right) => {
    if (right.peakOccupancyRatio !== left.peakOccupancyRatio) {
      return right.peakOccupancyRatio - left.peakOccupancyRatio
    }

    if (left.zoneId !== right.zoneId) {
      return left.zoneId.localeCompare(right.zoneId)
    }

    return left.phaseId.localeCompare(right.phaseId)
  })
}

export function createRecommendation(peak: Peak) {
  return {
    zoneId: peak.zoneId,
    phaseId: peak.phaseId,
    priority: priorityFromRatio(peak.peakOccupancyRatio),
    action: actionFromSeverity(peak.peakSeverity),
    expectedImpact: impactFromSeverity(peak.peakSeverity),
  }
}

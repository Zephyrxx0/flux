import type { ComparisonViewModel } from "@/comparison/selectors/buildComparisonViewModel"

export type SensitivityZoneNarrative = {
  zoneId: string
  sentence: string
}

export type SensitivityNarrative = {
  overall: string
  zones: SensitivityZoneNarrative[]
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatPoints(value: number) {
  const sign = value > 0 ? "+" : ""
  return `${sign}${(value * 100).toFixed(1)} pts`
}

export function buildSensitivityNarrative(model: ComparisonViewModel): SensitivityNarrative {
  const overallSign = model.overall.absoluteDelta > 0 ? "+" : ""
  const overall = `Overall peak risk changed from ${formatPercent(model.overall.baselinePeakRatio * 100)} to ${formatPercent(
    model.overall.candidatePeakRatio * 100,
  )} (${formatPoints(model.overall.absoluteDelta)}, ${overallSign}${model.overall.percentDelta.toFixed(1)}%).`

  const zones = model.topZoneDeltas.map((zone) => {
    const sign = zone.percentDelta > 0 ? "+" : ""
    const sentence = `${zone.zoneId} moved ${zone.severityTransition} (${formatPercent(zone.baselinePeakRatio * 100)} -> ${formatPercent(
      zone.candidatePeakRatio * 100,
    )}, ${formatPoints(zone.absoluteDelta)}, ${sign}${zone.percentDelta.toFixed(1)}%).`

    return { zoneId: zone.zoneId, sentence }
  })

  return { overall, zones }
}

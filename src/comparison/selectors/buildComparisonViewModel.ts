import type { PersistedRun } from "@/comparison/contracts/comparison.schema"

type ZoneDelta = {
  zoneId: string
  baselinePeakRatio: number
  candidatePeakRatio: number
  absoluteDelta: number
  percentDelta: number
  baselineSeverity: string
  candidateSeverity: string
  severityTransition: string
}

export type ComparisonViewModel = {
  baseline: PersistedRun
  candidate: PersistedRun
  topZoneDeltas: ZoneDelta[]
  overall: {
    baselinePeakRatio: number
    candidatePeakRatio: number
    absoluteDelta: number
    percentDelta: number
  }
}

function toZonePeakMap(run: PersistedRun) {
  const peaks = new Map<string, { ratio: number; severity: string }>()
  for (const peak of run.output.peakSummaries) {
    const current = peaks.get(peak.zoneId)
    if (!current || peak.peakOccupancyRatio > current.ratio) {
      peaks.set(peak.zoneId, { ratio: peak.peakOccupancyRatio, severity: peak.peakSeverity })
    }
  }
  return peaks
}

function round(value: number) {
  return Number(value.toFixed(4))
}

function calculatePercentDelta(baseline: number, absoluteDelta: number) {
  if (baseline === 0) {
    return absoluteDelta === 0 ? 0 : 100
  }
  return (absoluteDelta / baseline) * 100
}

export function buildComparisonViewModel(
  baseline: PersistedRun | null,
  candidate: PersistedRun | null,
): ComparisonViewModel | null {
  if (!baseline || !candidate || baseline.id === candidate.id) {
    return null
  }

  const baselinePeaks = toZonePeakMap(baseline)
  const candidatePeaks = toZonePeakMap(candidate)
  const allZoneIds = new Set([...baselinePeaks.keys(), ...candidatePeaks.keys()])

  const zoneDeltas: ZoneDelta[] = [...allZoneIds].map((zoneId) => {
    const baselineZone = baselinePeaks.get(zoneId)
    const candidateZone = candidatePeaks.get(zoneId)

    const baselinePeakRatio = baselineZone?.ratio ?? 0
    const candidatePeakRatio = candidateZone?.ratio ?? 0
    const absoluteDelta = candidatePeakRatio - baselinePeakRatio
    const percentDelta = calculatePercentDelta(baselinePeakRatio, absoluteDelta)

    const baselineSeverity = baselineZone?.severity ?? "green"
    const candidateSeverity = candidateZone?.severity ?? "green"

    return {
      zoneId,
      baselinePeakRatio: round(baselinePeakRatio),
      candidatePeakRatio: round(candidatePeakRatio),
      absoluteDelta: round(absoluteDelta),
      percentDelta: round(percentDelta),
      baselineSeverity,
      candidateSeverity,
      severityTransition: `${baselineSeverity} -> ${candidateSeverity}`,
    }
  })

  const sorted = zoneDeltas.sort((left, right) => Math.abs(right.absoluteDelta) - Math.abs(left.absoluteDelta))

  const baselineOverall = Math.max(...baseline.output.peakSummaries.map((peak) => peak.peakOccupancyRatio), 0)
  const candidateOverall = Math.max(...candidate.output.peakSummaries.map((peak) => peak.peakOccupancyRatio), 0)
  const overallAbsoluteDelta = candidateOverall - baselineOverall

  return {
    baseline,
    candidate,
    topZoneDeltas: sorted.slice(0, 3),
    overall: {
      baselinePeakRatio: round(baselineOverall),
      candidatePeakRatio: round(candidateOverall),
      absoluteDelta: round(overallAbsoluteDelta),
      percentDelta: round(calculatePercentDelta(baselineOverall, overallAbsoluteDelta)),
    },
  }
}

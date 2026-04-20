import type { SimulationInput } from "../contracts/input.schema"
import { severityFromRatio, type SeverityTier } from "./severity"
import { computeAvailableThroughput, processDemandAgainstThroughput } from "./throughput"

type Phase = SimulationInput["phases"][number]
type Zone = SimulationInput["zones"][number]
type Gate = SimulationInput["gates"][number]

export type PhaseProcessingInput = {
  phase: Phase
  zone: Zone
  gates: Gate[]
  carryInFans: number
  arrivalsFans: number
  phaseStartMin: number
  previousOccupancyFans: number
}

export type PhaseProcessingResult = {
  occupancyFans: number
  occupancyRatio: number
  occupancySeverity: SeverityTier
  carryInFans: number
  arrivalsFans: number
  availableThroughput: number
  processedFans: number
  overflowCarryFans: number
  blockedByDelay: boolean
}

export function processPhase(input: PhaseProcessingInput): PhaseProcessingResult {
  const {
    phase,
    zone,
    gates,
    carryInFans,
    arrivalsFans,
    phaseStartMin,
    previousOccupancyFans,
  } = input

  const demandFans = carryInFans + arrivalsFans
  const { availableThroughput, blockedByDelay } = computeAvailableThroughput({
    phaseDurationMin: phase.durationMin,
    phaseStartMin,
    gates,
  })

  const { processedFans, overflowCarryFans } = processDemandAgainstThroughput(
    demandFans,
    availableThroughput,
  )
  const occupancyFans = previousOccupancyFans + processedFans
  const occupancyRatio = occupancyFans / zone.capacity

  return {
    occupancyFans,
    occupancyRatio,
    occupancySeverity: severityFromRatio(occupancyRatio),
    carryInFans,
    arrivalsFans,
    availableThroughput,
    processedFans,
    overflowCarryFans,
    blockedByDelay,
  }
}

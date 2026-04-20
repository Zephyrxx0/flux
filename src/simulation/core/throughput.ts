import type { SimulationInput } from "../contracts/input.schema"

type Gate = SimulationInput["gates"][number]

export type ThroughputWindow = {
  availableThroughput: number
  blockedByDelay: boolean
}

export type ThroughputInput = {
  phaseDurationMin: number
  phaseStartMin: number
  gates: Gate[]
}

export function computeAvailableThroughput(input: ThroughputInput): ThroughputWindow {
  const { phaseDurationMin, phaseStartMin, gates } = input

  if (gates.length === 0) {
    return { availableThroughput: 0, blockedByDelay: false }
  }

  const phaseEndMin = phaseStartMin + phaseDurationMin
  const gateHasActiveWindow = (gate: Gate) => {
    const activeStart = Math.max(phaseStartMin, gate.delayMin)
    return Math.max(0, phaseEndMin - activeStart) > 0
  }

  const availableThroughput = gates.reduce((sum, gate) => {
    const activeStart = Math.max(phaseStartMin, gate.delayMin)
    const activeMinutes = Math.max(0, phaseEndMin - activeStart)
    return sum + gate.throughputPerMin * activeMinutes
  }, 0)

  const blockedByDelay = gates.every((gate) => !gateHasActiveWindow(gate))

  return {
    availableThroughput,
    blockedByDelay,
  }
}

export function processDemandAgainstThroughput(
  demandFans: number,
  availableThroughput: number,
): { processedFans: number; overflowCarryFans: number } {
  const processedFans = Math.min(demandFans, availableThroughput)
  return {
    processedFans,
    overflowCarryFans: demandFans - processedFans,
  }
}

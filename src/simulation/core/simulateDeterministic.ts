import { SimulationInputSchema, type SimulationInput } from "../contracts/input.schema"
import { SimulationOutputSchema, type SimulationOutput } from "../contracts/output.schema"
import { processPhase } from "./enginePhases"
import { validateInvariantFlags } from "./invariants"

type SubZone = "entry" | "interior"

type EffectiveZone = {
  id: string
  baseZoneId: string
  capacity: number
  subZone: SubZone
}

type PeakAccumulator = {
  zoneId: string
  phaseId: string
  peakOccupancyFans: number
  peakOccupancyRatio: number
  peakSeverity: "green" | "amber" | "red" | "critical"
}

function splitEven(total: number, subZone: SubZone): number {
  if (subZone === "entry") {
    return Math.ceil(total / 2)
  }
  return Math.floor(total / 2)
}

function createEffectiveZones(input: SimulationInput): EffectiveZone[] {
  const baseZones = [...input.zones].sort((a, b) => a.id.localeCompare(b.id))

  if (input.mode !== "detailed") {
    return baseZones.map((zone) => ({
      id: zone.id,
      baseZoneId: zone.id,
      capacity: zone.capacity,
      subZone: "entry",
    }))
  }

  return baseZones.flatMap((zone) => [
    {
      id: `${zone.id}:entry`,
      baseZoneId: zone.id,
      capacity: Math.max(1, splitEven(zone.capacity, "entry")),
      subZone: "entry" as const,
    },
    {
      id: `${zone.id}:interior`,
      baseZoneId: zone.id,
      capacity: Math.max(1, splitEven(zone.capacity, "interior")),
      subZone: "interior" as const,
    },
  ])
}

export function simulateDeterministic(input: SimulationInput): SimulationOutput {
  const parsed = SimulationInputSchema.parse(input)
  const phases = [...parsed.phases].sort((a, b) => a.order - b.order)
  const zones = createEffectiveZones(parsed)

  const carryByZone = new Map<string, number>()
  const occupancyByZone = new Map<string, number>()
  const peaksByZone = new Map<string, PeakAccumulator>()

  for (const zone of zones) {
    carryByZone.set(zone.id, 0)
    occupancyByZone.set(zone.id, 0)
    peaksByZone.set(zone.id, {
      zoneId: zone.id,
      phaseId: phases[0]?.id ?? "",
      peakOccupancyFans: 0,
      peakOccupancyRatio: 0,
      peakSeverity: "green",
    })
  }

  const phaseStartById = new Map<string, number>()
  let elapsed = 0
  for (const phase of phases) {
    phaseStartById.set(phase.id, elapsed)
    elapsed += phase.durationMin
  }

  const phaseZoneMatrix: SimulationOutput["phaseZoneMatrix"] = []

  for (const phase of phases) {
    for (const zone of zones) {
      const carryIn = carryByZone.get(zone.id) ?? 0
      const arrivals = parsed.arrivals
        .filter((arrival) => arrival.phaseId === phase.id && arrival.zoneId === zone.baseZoneId)
        .reduce(
          (sum, arrival) =>
            sum + (parsed.mode === "detailed" ? splitEven(arrival.demandFans, zone.subZone) : arrival.demandFans),
          0,
        )

      const phaseStartMin = phaseStartById.get(phase.id) ?? 0
      const zoneGates = parsed.gates
        .filter((gate) => gate.zoneId === zone.baseZoneId)
        .map((gate) => ({
          ...gate,
          throughputPerMin:
            parsed.mode === "detailed" ? splitEven(gate.throughputPerMin, zone.subZone) : gate.throughputPerMin,
        }))
      const phaseResult = processPhase({
        phase,
        zone,
        gates: zoneGates,
        carryInFans: carryIn,
        arrivalsFans: arrivals,
        phaseStartMin,
        previousOccupancyFans: occupancyByZone.get(zone.id) ?? 0,
      })

      occupancyByZone.set(zone.id, phaseResult.occupancyFans)
      carryByZone.set(zone.id, phaseResult.overflowCarryFans)

      const currentPeak = peaksByZone.get(zone.id)
      if (!currentPeak || phaseResult.occupancyFans > currentPeak.peakOccupancyFans) {
        peaksByZone.set(zone.id, {
          zoneId: zone.id,
          phaseId: phase.id,
          peakOccupancyFans: phaseResult.occupancyFans,
          peakOccupancyRatio: phaseResult.occupancyRatio,
          peakSeverity: phaseResult.occupancySeverity,
        })
      }

      phaseZoneMatrix.push({
        phaseId: phase.id,
        zoneId: zone.id,
        ...phaseResult,
      })
    }
  }

  const invariants = validateInvariantFlags(
    phaseZoneMatrix,
    parsed.mode,
    phases.length * zones.length,
  )

  const output: SimulationOutput = {
    schemaVersion: parsed.schemaVersion,
    runDeterministicHash: JSON.stringify(parsed),
    mode: parsed.mode,
    phaseZoneMatrix,
    peakSummaries: zones.map((zone) => peaksByZone.get(zone.id)!).filter(Boolean),
    invariants,
    warnings: [],
  }

  return SimulationOutputSchema.parse(output)
}

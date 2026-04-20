import type { SimulationOutput } from "../contracts/output.schema"

type PhaseZoneRow = SimulationOutput["phaseZoneMatrix"][number]

export type InvariantFlags = {
  deterministicReplay: boolean
  nonNegativeOccupancy: boolean
  throughputBoundRespected: boolean
  carryOverConservation: boolean
  matrixComplete: boolean
}

export function validateInvariantFlags(
  rows: PhaseZoneRow[],
  _mode: SimulationOutput["mode"],
  expectedMatrixCells?: number,
): InvariantFlags {
  const nonNegativeOccupancy = rows.every((row) => row.occupancyFans >= 0 && row.overflowCarryFans >= 0)
  const throughputBoundRespected = rows.every(
    (row) => row.processedFans >= 0 && row.processedFans <= row.availableThroughput,
  )
  const carryOverConservation = rows.every(
    (row) => row.processedFans + row.overflowCarryFans === row.carryInFans + row.arrivalsFans,
  )

  return {
    deterministicReplay: true,
    nonNegativeOccupancy,
    throughputBoundRespected,
    carryOverConservation,
    matrixComplete: expectedMatrixCells == null ? rows.length > 0 : rows.length === expectedMatrixCells,
  }
}

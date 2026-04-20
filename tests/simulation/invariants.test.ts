import { describe, expect, it } from "vitest"
import { simulateDeterministic } from "../../src/simulation/core/simulateDeterministic"
import { validateInvariantFlags } from "../../src/simulation/core/invariants"
import { severityFromRatio } from "../../src/simulation/core/severity"
import { createBaseInput } from "./fixtures"

describe("output invariants", () => {
  it("maps occupancy ratio to severity tiers above capacity", () => {
    expect(severityFromRatio(0.5)).toBe("green")
    expect(severityFromRatio(0.95)).toBe("amber")
    expect(severityFromRatio(1.05)).toBe("red")
    expect(severityFromRatio(1.25)).toBe("critical")
  })

  it("reports deterministic invariant flags", () => {
    const output = simulateDeterministic(createBaseInput())
    const recomputed = validateInvariantFlags(output.phaseZoneMatrix, output.mode)

    expect(output.invariants.deterministicReplay).toBe(true)
    expect(output.invariants.nonNegativeOccupancy).toBe(true)
    expect(output.invariants.throughputBoundRespected).toBe(true)
    expect(output.invariants.carryOverConservation).toBe(true)
    expect(output.invariants.matrixComplete).toBe(true)
    expect(output.invariants).toMatchObject(recomputed)
  })

  it("preserves occupancy beyond 100% and derives severity from ratio", () => {
    const output = simulateDeterministic(
      createBaseInput({
        phases: [{ id: "entry", order: 1, durationMin: 10 }],
        zones: [{ id: "north", capacity: 100 }],
        gates: [{ id: "north-g1", zoneId: "north", throughputPerMin: 15, delayMin: 0 }],
        arrivals: [{ phaseId: "entry", zoneId: "north", demandFans: 140 }],
      }),
    )

    const row = output.phaseZoneMatrix.find((r) => r.phaseId === "entry" && r.zoneId === "north")
    expect(row).toBeDefined()
    expect(row?.occupancyFans).toBe(140)
    expect(row?.occupancyRatio).toBe(1.4)
    expect(row?.occupancySeverity).toBe(severityFromRatio(1.4))
  })
})

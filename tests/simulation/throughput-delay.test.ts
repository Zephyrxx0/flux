import { describe, expect, it } from "vitest"
import { simulateDeterministic } from "../../src/simulation/core/simulateDeterministic"
import { computeAvailableThroughput } from "../../src/simulation/core/throughput"
import { createBaseInput } from "./fixtures"

describe("throughput and delay behavior", () => {
  it("computes zero throughput while all gates are delayed", () => {
    const available = computeAvailableThroughput({
      phaseDurationMin: 10,
      phaseStartMin: 0,
      gates: [{ id: "north-g1", zoneId: "north", throughputPerMin: 50, delayMin: 30 }],
    })

    expect(available).toEqual({
      availableThroughput: 0,
      blockedByDelay: true,
    })
  })

  it("blocks throughput before delay expiry", () => {
    const input = createBaseInput({
      phases: [{ id: "entry", order: 1, durationMin: 10 }],
      zones: [{ id: "north", capacity: 1000 }],
      gates: [{ id: "north-g1", zoneId: "north", throughputPerMin: 50, delayMin: 30 }],
      arrivals: [{ phaseId: "entry", zoneId: "north", demandFans: 400 }],
    })

    const output = simulateDeterministic(input)
    const entryNorth = output.phaseZoneMatrix.find((row) => row.phaseId === "entry" && row.zoneId === "north")

    expect(entryNorth).toBeDefined()
    expect(entryNorth?.blockedByDelay).toBe(true)
    expect(entryNorth?.processedFans).toBe(0)
    expect(entryNorth?.overflowCarryFans).toBe(400)
  })

  it("carries overflow into the next phase in the same zone", () => {
    const input = createBaseInput({
      phases: [
        { id: "entry", order: 1, durationMin: 10 },
        { id: "first-half", order: 2, durationMin: 10 },
      ],
      zones: [{ id: "north", capacity: 1000 }],
      gates: [{ id: "north-g1", zoneId: "north", throughputPerMin: 20, delayMin: 0 }],
      arrivals: [
        { phaseId: "entry", zoneId: "north", demandFans: 400 },
        { phaseId: "first-half", zoneId: "north", demandFans: 20 },
      ],
    })

    const output = simulateDeterministic(input)
    const entry = output.phaseZoneMatrix.find((row) => row.phaseId === "entry" && row.zoneId === "north")
    const firstHalf = output.phaseZoneMatrix.find(
      (row) => row.phaseId === "first-half" && row.zoneId === "north",
    )

    expect(entry?.processedFans).toBe(200)
    expect(entry?.overflowCarryFans).toBe(200)

    expect(firstHalf?.processedFans).toBe(200)
    expect(firstHalf?.overflowCarryFans).toBe(20)
    expect(firstHalf?.occupancyFans).toBe(400)
  })
})

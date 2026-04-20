import { describe, expect, it } from "vitest"
import { simulateDeterministic } from "../../src/simulation/core/simulateDeterministic"
import { createBaseInput } from "./fixtures"

describe("determinism", () => {
  it("returns deeply equal output for identical input", () => {
    const input = createBaseInput()

    const first = simulateDeterministic(input)
    const second = simulateDeterministic(input)
    const third = simulateDeterministic(input)

    expect(second).toEqual(first)
    expect(third).toEqual(first)
  })

  it("keeps detailed mode deterministic with exactly two sub-zones per zone", () => {
    const input = createBaseInput({
      mode: "detailed",
      phases: [{ id: "entry", order: 1, durationMin: 10 }],
      zones: [{ id: "north", capacity: 1000 }],
      gates: [{ id: "north-g1", zoneId: "north", throughputPerMin: 30, delayMin: 0 }],
      arrivals: [{ phaseId: "entry", zoneId: "north", demandFans: 300 }],
      detailed: { subZonesPerZone: 2 },
    })

    const first = simulateDeterministic(input)
    const second = simulateDeterministic(input)

    expect(second).toEqual(first)

    const rows = first.phaseZoneMatrix.filter((row) => row.phaseId === "entry")
    expect(rows).toHaveLength(2)
    expect(rows.map((row) => row.zoneId)).toEqual(["north:entry", "north:interior"])
  })
})

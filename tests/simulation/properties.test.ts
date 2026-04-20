import { describe, expect, it } from "vitest"
import fc from "fast-check"
import { simulateDeterministic } from "../../src/simulation/core/simulateDeterministic"
import { createBaseInput } from "./fixtures"

describe("deterministic properties", () => {
  it("is deterministic across generated demand values", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2_000 }), (demandFans) => {
        const input = createBaseInput({
          phases: [{ id: "entry", order: 1, durationMin: 15 }],
          zones: [{ id: "north", capacity: 1000 }],
          gates: [{ id: "north-g1", zoneId: "north", throughputPerMin: 40, delayMin: 0 }],
          arrivals: [{ phaseId: "entry", zoneId: "north", demandFans }],
        })

        const one = simulateDeterministic(input)
        const two = simulateDeterministic(input)

        expect(one).toEqual(two)
      }),
      { numRuns: 25 },
    )
  })

  it("preserves matrix cardinality and conservation invariants across generated scenarios", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2_000 }),
        fc.boolean(),
        (demandFans, detailedMode) => {
          const input = createBaseInput({
            mode: detailedMode ? "detailed" : "zone",
            phases: [
              { id: "entry", order: 1, durationMin: 10 },
              { id: "first-half", order: 2, durationMin: 10 },
            ],
            zones: [{ id: "north", capacity: 1000 }],
            gates: [{ id: "north-g1", zoneId: "north", throughputPerMin: 40, delayMin: 0 }],
            arrivals: [
              { phaseId: "entry", zoneId: "north", demandFans },
              { phaseId: "first-half", zoneId: "north", demandFans },
            ],
            detailed: detailedMode ? { subZonesPerZone: 2 } : undefined,
          })

          const output = simulateDeterministic(input)
          const expectedCells = input.phases.length * input.zones.length * (detailedMode ? 2 : 1)

          expect(output.phaseZoneMatrix).toHaveLength(expectedCells)
          expect(output.invariants.carryOverConservation).toBe(true)
          expect(output.invariants.matrixComplete).toBe(true)
        },
      ),
      { numRuns: 25 },
    )
  })
})

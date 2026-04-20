import { describe, expect, it } from "vitest"

import { buildComparisonViewModel } from "@/comparison/selectors/buildComparisonViewModel"
import type { PersistedRun } from "@/comparison/contracts/comparison.schema"
import { simulationOutputFixture } from "../fixtures/simulationOutput"

function createRun(id: string, zoneBPeakRatio: number, zoneAPeakRatio: number): PersistedRun {
  return {
    id,
    createdAt: `2026-04-19T00:00:0${id}Z`,
    runDeterministicHash: `hash-${id}`,
    scenarioLabel: `scenario-${id}`,
    output: {
      ...simulationOutputFixture,
      runDeterministicHash: `hash-${id}`,
      peakSummaries: [
        {
          zoneId: "zone-a",
          phaseId: "phase-2",
          peakOccupancyFans: Math.round(zoneAPeakRatio * 100),
          peakOccupancyRatio: zoneAPeakRatio,
          peakSeverity: zoneAPeakRatio >= 0.95 ? "red" : zoneAPeakRatio >= 0.8 ? "amber" : "green",
        },
        {
          zoneId: "zone-b",
          phaseId: "phase-2",
          peakOccupancyFans: Math.round(zoneBPeakRatio * 100),
          peakOccupancyRatio: zoneBPeakRatio,
          peakSeverity: zoneBPeakRatio >= 0.95 ? "red" : zoneBPeakRatio >= 0.8 ? "amber" : "green",
        },
      ],
    },
  }
}

describe("buildComparisonViewModel", () => {
  it("returns null when comparison pair is invalid", () => {
    const run = createRun("1", 0.9, 0.8)
    expect(buildComparisonViewModel(run, run)).toBeNull()
    expect(buildComparisonViewModel(run, null)).toBeNull()
  })

  it("computes absolute and percent deltas with severity transition", () => {
    const baseline = createRun("1", 0.97, 0.91)
    const candidate = createRun("2", 0.88, 0.82)

    const model = buildComparisonViewModel(baseline, candidate)

    expect(model).not.toBeNull()
    expect(model?.overall.absoluteDelta).toBeLessThan(0)

    const zoneB = model?.topZoneDeltas.find((zone) => zone.zoneId === "zone-b")
    expect(zoneB).toBeDefined()
    expect(zoneB?.absoluteDelta).toBeCloseTo(-0.09, 3)
    expect(zoneB?.severityTransition).toBe("red -> amber")
  })

  it("limits top deltas to three zones", () => {
    const baseline = createRun("1", 0.97, 0.91)
    const candidate: PersistedRun = {
      ...createRun("2", 0.8, 0.75),
      output: {
        ...simulationOutputFixture,
        runDeterministicHash: "hash-2",
        peakSummaries: [
          { zoneId: "zone-a", phaseId: "phase-2", peakOccupancyFans: 75, peakOccupancyRatio: 0.75, peakSeverity: "green" },
          { zoneId: "zone-b", phaseId: "phase-2", peakOccupancyFans: 80, peakOccupancyRatio: 0.8, peakSeverity: "amber" },
          { zoneId: "zone-c", phaseId: "phase-2", peakOccupancyFans: 84, peakOccupancyRatio: 0.84, peakSeverity: "amber" },
          { zoneId: "zone-d", phaseId: "phase-2", peakOccupancyFans: 60, peakOccupancyRatio: 0.6, peakSeverity: "green" },
        ],
      },
    }

    const expandedBaseline: PersistedRun = {
      ...baseline,
      output: {
        ...baseline.output,
        peakSummaries: [
          ...baseline.output.peakSummaries,
          { zoneId: "zone-c", phaseId: "phase-2", peakOccupancyFans: 99, peakOccupancyRatio: 0.99, peakSeverity: "red" },
          { zoneId: "zone-d", phaseId: "phase-2", peakOccupancyFans: 95, peakOccupancyRatio: 0.95, peakSeverity: "red" },
        ],
      },
    }

    const model = buildComparisonViewModel(expandedBaseline, candidate)
    expect(model?.topZoneDeltas).toHaveLength(3)
  })
})

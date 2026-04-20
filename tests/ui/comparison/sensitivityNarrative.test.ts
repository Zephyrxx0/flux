import { describe, expect, it } from "vitest"

import { buildSensitivityNarrative } from "@/comparison/narrative/buildSensitivityNarrative"
import { buildComparisonViewModel } from "@/comparison/selectors/buildComparisonViewModel"
import type { PersistedRun } from "@/comparison/contracts/comparison.schema"
import { simulationOutputFixture } from "../fixtures/simulationOutput"

function createRun(id: string, peaks: Array<{ zoneId: string; ratio: number; severity: "green" | "amber" | "red" | "critical" }>): PersistedRun {
  return {
    id,
    createdAt: `2026-04-19T00:00:0${id}Z`,
    runDeterministicHash: `hash-${id}`,
    scenarioLabel: `scenario-${id}`,
    output: {
      ...simulationOutputFixture,
      runDeterministicHash: `hash-${id}`,
      peakSummaries: peaks.map((peak) => ({
        zoneId: peak.zoneId,
        phaseId: "phase-2",
        peakOccupancyFans: Math.round(peak.ratio * 100),
        peakOccupancyRatio: peak.ratio,
        peakSeverity: peak.severity,
      })),
    },
  }
}

describe("buildSensitivityNarrative", () => {
  it("builds quantified overall and per-zone narratives", () => {
    const baseline = createRun("1", [
      { zoneId: "zone-a", ratio: 0.92, severity: "amber" },
      { zoneId: "zone-b", ratio: 0.97, severity: "red" },
      { zoneId: "zone-c", ratio: 0.89, severity: "amber" },
    ])
    const candidate = createRun("2", [
      { zoneId: "zone-a", ratio: 0.82, severity: "amber" },
      { zoneId: "zone-b", ratio: 0.88, severity: "amber" },
      { zoneId: "zone-c", ratio: 0.84, severity: "amber" },
    ])

    const model = buildComparisonViewModel(baseline, candidate)
    if (!model) {
      throw new Error("Expected comparison model")
    }

    const narrative = buildSensitivityNarrative(model)

    expect(narrative.overall).toContain("Overall peak risk changed")
    expect(narrative.zones).toHaveLength(3)
    expect(narrative.zones[0]?.sentence).toContain("pts")
    expect(narrative.zones.some((zone) => zone.sentence.includes("red -> amber"))).toBe(true)
  })
})

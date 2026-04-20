import { describe, expect, it } from "vitest"

import { buildBriefingExport } from "@/export/buildBriefingExport"
import { renderBriefingHtml } from "@/export/renderBriefingHtml"
import { BriefingExportSchema } from "@/export/contracts/briefingExport.schema"
import { buildComparisonViewModel } from "@/comparison/selectors/buildComparisonViewModel"
import type { PersistedRun } from "@/comparison/contracts/comparison.schema"
import { simulationOutputFixture } from "../fixtures/simulationOutput"
import { buildDeterministicRiskReport } from "@/reporting/fallback/buildDeterministicRiskReport"

function createRun(id: string, zoneBRatio: number): PersistedRun {
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
          peakOccupancyFans: 82,
          peakOccupancyRatio: 0.82,
          peakSeverity: "amber",
        },
        {
          zoneId: "zone-b",
          phaseId: "phase-2",
          peakOccupancyFans: Math.round(zoneBRatio * 100),
          peakOccupancyRatio: zoneBRatio,
          peakSeverity: zoneBRatio >= 0.95 ? "red" : "amber",
        },
      ],
    },
  }
}

describe("briefing export", () => {
  it("builds schema-valid JSON with required sections", () => {
    const baseline = createRun("1", 0.97)
    const candidate = createRun("2", 0.88)
    const model = buildComparisonViewModel(baseline, candidate)
    if (!model) {
      throw new Error("Expected model")
    }

    const report = buildDeterministicRiskReport(candidate.output)
    const briefing = buildBriefingExport(model, report)
    const parsed = BriefingExportSchema.parse(briefing)

    expect(parsed.metadata.baseline.id).toBe("1")
    expect(parsed.topChanges.length).toBeGreaterThan(0)
    expect(parsed.recommendations.length).toBeGreaterThan(0)
    expect(parsed.assumptionsLimitations.length).toBeGreaterThan(0)
  })

  it("renders print-friendly HTML with key briefing sections", () => {
    const baseline = createRun("1", 0.97)
    const candidate = createRun("2", 0.88)
    const model = buildComparisonViewModel(baseline, candidate)
    if (!model) {
      throw new Error("Expected model")
    }

    const briefing = buildBriefingExport(model, null)
    const html = renderBriefingHtml(briefing)

    expect(html).toContain("Scenario Comparison Briefing")
    expect(html).toContain("Run Metadata")
    expect(html).toContain("Top Zone Changes")
    expect(html).toContain("Action Recommendations")
    expect(html).toContain("Assumptions and Limitations")
  })
})

import { describe, expect, it } from "vitest"

import { RiskReportSchema } from "@/reporting/contracts/riskReport.schema"
import { buildDeterministicRiskReport } from "@/reporting/fallback/buildDeterministicRiskReport"
import { simulationOutputFixture } from "../fixtures/simulationOutput"

describe("deterministic fallback report", () => {
  it("produces stable output for the same simulation payload", () => {
    const first = buildDeterministicRiskReport(simulationOutputFixture)
    const second = buildDeterministicRiskReport(simulationOutputFixture)

    expect(first).toEqual(second)
    expect(first.generatedAt).toBe(`deterministic:${simulationOutputFixture.runDeterministicHash}`)
  })

  it("always returns schema-valid structured content", () => {
    const report = buildDeterministicRiskReport(simulationOutputFixture)
    const parsed = RiskReportSchema.safeParse(report)

    expect(parsed.success).toBe(true)
    expect(report.criticalZones.length).toBeGreaterThan(0)
    expect(report.staffingRecommendations.length).toBeGreaterThan(0)
    expect(report.executiveSummary.length).toBeGreaterThan(0)
  })

  it("uses fallback provenance metadata", () => {
    const report = buildDeterministicRiskReport(simulationOutputFixture)

    expect(report.source).toBe("fallback")
    expect(report.evidence.generatedFrom).toBe("simulation-output")
    expect(report.evidence.rowsAnalyzed).toBe(simulationOutputFixture.phaseZoneMatrix.length)
  })
})

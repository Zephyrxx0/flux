import { describe, expect, it } from "vitest"

import { generateRiskReport } from "@/reporting/gemini/generateRiskReport"
import { GeminiInvalidSchemaError, GeminiMalformedOutputError } from "@/reporting/gemini/errors"
import { simulationOutputFixture } from "../fixtures/simulationOutput"

const validAiResponse = JSON.stringify({
  source: "ai",
  generatedAt: "2026-04-19T00:00:00Z",
  overall: {
    riskLevel: "red",
    confidence: 0.91,
    rationale: "Zone-b enters red threshold in phase-2.",
  },
  criticalZones: [
    {
      zoneId: "zone-b",
      phaseId: "phase-2",
      peakOccupancyRatio: 0.97,
      peakSeverity: "red",
      recommendedAction: "Deploy additional stewards.",
    },
  ],
  staffingRecommendations: [
    {
      zoneId: "zone-b",
      phaseId: "phase-2",
      priority: "high",
      action: "Shift two gate stewards.",
      expectedImpact: "Reduce queue pressure.",
    },
  ],
  assumptionsLimitations: ["No live telemetry available."],
  evidence: {
    runDeterministicHash: "fixture-hash-01",
    generatedFrom: "simulation-output",
    rowsAnalyzed: 4,
    peakZones: ["zone-b"],
    warnings: [],
  },
  executiveSummary: "Highest concern is zone-b in phase-2.",
})

describe("generateRiskReport", () => {
  it("parses schema-valid AI JSON output", async () => {
    const report = await generateRiskReport({
      output: simulationOutputFixture,
      invokeModel: async () => validAiResponse,
    })

    expect(report.source).toBe("ai")
    expect(report.criticalZones[0]?.zoneId).toBe("zone-b")
  })

  it("throws on malformed JSON", async () => {
    await expect(
      generateRiskReport({
        output: simulationOutputFixture,
        invokeModel: async () => "{ this is not json",
      }),
    ).rejects.toBeInstanceOf(GeminiMalformedOutputError)
  })

  it("throws on schema-invalid AI payload", async () => {
    await expect(
      generateRiskReport({
        output: simulationOutputFixture,
        invokeModel: async () => JSON.stringify({ source: "ai" }),
      }),
    ).rejects.toBeInstanceOf(GeminiInvalidSchemaError)
  })
})

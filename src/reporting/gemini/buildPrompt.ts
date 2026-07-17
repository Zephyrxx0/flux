import type { SimulationOutput } from "@/simulation/contracts/output.schema"

export function buildGeminiRiskPrompt(output: SimulationOutput): string {
  return [
    "You are a stadium crowd-risk analyst.",
    "Return ONLY JSON that matches the required risk report schema.",
    "Do not include markdown code fences or commentary.",
    "You must generate JSON matching this exact structure:",
    `{
      "source": "ai",
      "generatedAt": "2026-07-17T12:00:00Z",
      "overall": { "riskLevel": "green|amber|red|critical", "confidence": 0.9, "rationale": "..." },
      "criticalZones": [
        { "zoneId": "...", "phaseId": "...", "peakOccupancyRatio": 1.2, "peakSeverity": "amber", "recommendedAction": "..." }
      ],
      "staffingRecommendations": [
        { "zoneId": "...", "phaseId": "...", "priority": "high|medium|low", "action": "...", "expectedImpact": "..." }
      ],
      "assumptionsLimitations": ["..."],
      "evidence": {
        "runDeterministicHash": "...",
        "generatedFrom": "simulation-output",
        "rowsAnalyzed": 100,
        "peakZones": ["..."],
        "warnings": ["..."]
      },
      "executiveSummary": "..."
    }`,
    "Ground every recommendation in the provided simulation payload.",
    "Simulation payload:",
    JSON.stringify(output),
  ].join("\n")
}

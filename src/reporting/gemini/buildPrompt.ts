import type { SimulationOutput } from "@/simulation/contracts/output.schema"

export function buildGeminiRiskPrompt(output: SimulationOutput): string {
  return [
    "You are a stadium crowd-risk analyst.",
    "Return ONLY JSON that matches the required risk report schema.",
    "Do not include markdown code fences or commentary.",
    "Ground every recommendation in the provided simulation payload.",
    "Simulation payload:",
    JSON.stringify(output),
  ].join("\n")
}

import { RiskReportSchema, type RiskReport } from "@/reporting/contracts/riskReport.schema"
import type { SimulationOutput } from "@/simulation/contracts/output.schema"
import { buildGeminiRiskPrompt } from "./buildPrompt"
import {
  GeminiInvalidSchemaError,
  GeminiMalformedOutputError,
  GeminiServerError,
  GeminiTimeoutError,
} from "./errors"

export type GeminiInvoke = (prompt: string) => Promise<string>

type GenerateRiskReportArgs = {
  output: SimulationOutput
  invokeModel?: GeminiInvoke
  timeoutMs?: number
}

function parseAiPayload(rawPayload: string): RiskReport {
  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(rawPayload)
  } catch {
    throw new GeminiMalformedOutputError("Gemini response was not valid JSON")
  }

  const parsed = RiskReportSchema.safeParse(parsedJson)
  if (!parsed.success) {
    throw new GeminiInvalidSchemaError("Gemini response failed risk report schema validation")
  }

  if (parsed.data.source !== "ai") {
    throw new GeminiInvalidSchemaError("Gemini response source must be 'ai'")
  }

  return parsed.data
}

export async function generateRiskReport({ output, invokeModel, timeoutMs = 60_000 }: GenerateRiskReportArgs): Promise<RiskReport> {
  const prompt = buildGeminiRiskPrompt(output)

  if (invokeModel) {
    const rawResponse = await invokeModel(prompt)
    return parseAiPayload(rawResponse)
  }

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ output }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new GeminiServerError(`Report API returned ${response.status}`)
    }

    const parsed = RiskReportSchema.safeParse(await response.json())
    if (!parsed.success) {
      throw new GeminiInvalidSchemaError("Report API response failed risk report schema validation")
    }

    return parsed.data
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new GeminiTimeoutError("Report API request timed out")
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

import { RiskReportSchema, type RiskReport } from "@/reporting/contracts/riskReport.schema"
import type { SimulationOutput } from "@/simulation/contracts/output.schema"
import { buildGeminiRiskPrompt } from "./buildPrompt"
import {
  GeminiInvalidSchemaError,
  GeminiMalformedOutputError,
  GeminiRateLimitError,
  GeminiServerError,
  GeminiTimeoutError,
} from "./errors"

export type GeminiInvoke = (prompt: string) => Promise<string>

type GenerateRiskReportArgs = {
  output: SimulationOutput
  invokeModel?: GeminiInvoke
  timeoutMs?: number
}

const DEFAULT_MODEL = "gemini-2.5-flash"

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

async function invokeGeminiViaFetch(prompt: string, timeoutMs: number): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? import.meta.env?.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new GeminiServerError("Missing NEXT_PUBLIC_GEMINI_API_KEY")
  }

  const model = process.env.NEXT_PUBLIC_GEMINI_MODEL ?? import.meta.env?.VITE_GEMINI_MODEL ?? DEFAULT_MODEL
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      },
    )

    if (response.status === 429) {
      throw new GeminiRateLimitError("Gemini rate limit exceeded")
    }

    if (response.status >= 500) {
      throw new GeminiServerError(`Gemini server error ${response.status}`)
    }

    if (!response.ok) {
      throw new GeminiServerError(`Gemini request failed with status ${response.status}`)
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      throw new GeminiMalformedOutputError("Gemini response did not include content text")
    }

    return text
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new GeminiTimeoutError("Gemini request timed out")
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function generateRiskReport({ output, invokeModel, timeoutMs = 60_000 }: GenerateRiskReportArgs): Promise<RiskReport> {
  const prompt = buildGeminiRiskPrompt(output)
  const invoke = invokeModel ?? ((inputPrompt: string) => invokeGeminiViaFetch(inputPrompt, timeoutMs))
  const rawResponse = await invoke(prompt)
  return parseAiPayload(rawResponse)
}

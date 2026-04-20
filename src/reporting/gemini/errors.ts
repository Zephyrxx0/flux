export class GeminiError extends Error {}

export class GeminiTimeoutError extends GeminiError {}

export class GeminiRateLimitError extends GeminiError {}

export class GeminiServerError extends GeminiError {}

export class GeminiMalformedOutputError extends GeminiError {}

export class GeminiInvalidSchemaError extends GeminiError {}

export function isTransientGeminiError(error: unknown): boolean {
  return error instanceof GeminiTimeoutError || error instanceof GeminiRateLimitError || error instanceof GeminiServerError
}

import { streamGeminiResponse } from "./gemini";

export function extractJsonPayload(rawPayload: string): string {
  const cleaned = rawPayload.replace(/```(?:json)?/gi, "").trim();

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // Continue and try to recover the first complete JSON object/array.
  }

  const start = cleaned.search(/[\[{]/);
  if (start === -1) {
    return cleaned;
  }

  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (let index = start; index < cleaned.length; index += 1) {
    const char = cleaned[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      stack.push("}");
    } else if (char === "[") {
      stack.push("]");
    } else if (char === "}" || char === "]") {
      if (stack.pop() !== char) {
        return cleaned;
      }

      if (stack.length === 0) {
        return cleaned.slice(start, index + 1).trim();
      }
    }
  }

  return cleaned;
}

export async function collectGeminiJson(prompt: string, signal: AbortSignal): Promise<string> {
  let rawJson = "";
  for await (const token of streamGeminiResponse(prompt, { signal })) {
    rawJson += token;
  }
  return extractJsonPayload(rawJson);
}

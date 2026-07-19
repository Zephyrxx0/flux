import { describe, expect, it } from "vitest";

import { extractJsonPayload } from "@/lib/ai/collectGeminiJson";

describe("extractJsonPayload", () => {
  it("returns already-valid JSON unchanged", () => {
    expect(extractJsonPayload('{"source":"ai"}')).toBe('{"source":"ai"}');
  });

  it("extracts JSON from markdown fences and surrounding prose", () => {
    expect(extractJsonPayload('Here is the report:\n```json\n{"source":"ai"}\n```\nDone.')).toBe(
      '{"source":"ai"}',
    );
  });

  it("does not stop at braces inside JSON strings", () => {
    expect(extractJsonPayload('prefix {"text":"Use {gate A} first","items":[1,2]} suffix')).toBe(
      '{"text":"Use {gate A} first","items":[1,2]}',
    );
  });
});

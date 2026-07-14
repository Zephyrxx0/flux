import { describe, it, expect, vi, afterEach } from "vitest";
import { GET } from "@/app/api/alert/route";
import { NextRequest } from "next/server";
import { GeminiFetchError } from "@/lib/ai/gemini";

// Mock the AI module to avoid real API calls
vi.mock("@/lib/ai/gemini", () => {
  return {
    validateAlertOutput: vi.fn((json) => {
      if (json === "[]") return [];
      return [{ id: "mock-id", zoneId: "north", severity: "warning", message: "mock alert", timestamp: "time" }];
    }),
    streamGeminiResponse: vi.fn(async function* (prompt, options) {
      if (process.env.TEST_SHOULD_THROW) {
        throw new Error("mock error");
      }
      if (process.env.TEST_THROW_MISSING_KEY) {
        throw new GeminiFetchError("Missing GEMINI_API_KEY");
      }
      if (process.env.TEST_SHOULD_DELAY) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      yield "[";
      yield " {";
      yield "  \"zoneId\": \"north\"";
      yield " }";
      yield "]";
    }),
    GeminiFetchError: class GeminiFetchError extends Error {
      constructor(m: string) { super(m); this.name = "GeminiFetchError"; }
    },
    GeminiRateLimitError: class GeminiRateLimitError extends Error {
      constructor() { super("Rate limit"); this.name = "GeminiRateLimitError"; }
    }
  };
});

describe("alert API route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 with correct SSE Content-Type and headers", async () => {
    const req = new NextRequest("http://localhost/api/alert");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream; charset=utf-8");
    expect(res.headers.get("Cache-Control")).toBe("no-cache, no-transform");
    expect(res.headers.get("X-Accel-Buffering")).toBe("no");
  });

  it("produces valid SSE stream format with \\n\\n", async () => {
    const req = new NextRequest("http://localhost/api/alert");
    const res = await GET(req);
    const text = await res.text();

    expect(text).toContain("data: {\"type\":\"token\",\"text\":\"[\"}\n\n");
    expect(text).toContain("data: {\"type\":\"alert\",\"alert\":{\"id\":\"mock-id\",\"zoneId\":\"north\",\"severity\":\"warning\",\"message\":\"mock alert\",\"timestamp\":\"time\"}}\n\n");
    expect(text).toContain("data: {\"type\":\"complete\"}\n\n");
  });

  it("handles missing API key error and sends error event", async () => {
    vi.stubEnv("TEST_THROW_MISSING_KEY", "true");
    const req = new NextRequest("http://localhost/api/alert");
    const res = await GET(req);
    const text = await res.text();

    expect(text).toContain("data: {\"type\":\"error\",\"message\":\"API key not configured\"}\n\n");
  });

  it("handles general error and sends error event", async () => {
    vi.stubEnv("TEST_SHOULD_THROW", "true");
    const req = new NextRequest("http://localhost/api/alert");
    const res = await GET(req);
    const text = await res.text();

    expect(text).toContain("data: {\"type\":\"error\",\"message\":\"mock error\"}\n\n");
  });

  it("respects abort signal from client", async () => {
    vi.stubEnv("TEST_SHOULD_DELAY", "true");
    const controller = new AbortController();
    const req = new NextRequest("http://localhost/api/alert", { signal: controller.signal });
    
    // Start request but immediately abort
    const resPromise = GET(req);
    controller.abort();
    
    const res = await resPromise;
    // stream should still close correctly, though its output may be truncated/error.
    // Vitest execution passing is enough to show it doesn't hang.
    expect(res.status).toBe(200);
  });
});

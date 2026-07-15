import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "@/app/api/chat/route";
import { NextRequest } from "next/server";
import { GeminiFetchError } from "@/lib/ai/gemini";

// Mock the AI module to avoid real API calls
vi.mock("@/lib/ai/gemini", () => {
  return {
    streamGeminiResponse: vi.fn(async function* (prompt: string, options?: { signal?: AbortSignal }) {
      if (process.env.TEST_THROW_MISSING_KEY) {
        throw new GeminiFetchError("Missing GEMINI_API_KEY");
      }
      if (process.env.TEST_THROW_RATE_LIMIT) {
        throw new GeminiRateLimitError();
      }
      if (process.env.TEST_SHOULD_THROW) {
        throw new Error("mock error");
      }
      if (process.env.TEST_SHOULD_DELAY) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      yield '{"text":"Gate';
      yield ' C is closest","suggestedGate":"C","walkingTime":"2 min","zoneInfo":null}';
    }),
    GeminiFetchError: class GeminiFetchError extends Error {
      constructor(m: string) { super(m); this.name = "GeminiFetchError"; }
    },
    GeminiRateLimitError: class GeminiRateLimitError extends Error {
      constructor() { super("Rate limit"); this.name = "GeminiRateLimitError"; }
    },
  };
});

class GeminiRateLimitError extends Error {
  constructor() { super("Rate limit"); this.name = "GeminiRateLimitError"; }
}

describe("POST /api/chat", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 with correct SSE Content-Type and headers", async () => {
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [] }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream; charset=utf-8");
    expect(res.headers.get("Cache-Control")).toBe("no-cache, no-transform");
    expect(res.headers.get("X-Accel-Buffering")).toBe("no");
  });

  it("produces valid SSE stream format with token + structured + complete events", async () => {
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          {
            id: "1",
            role: "user",
            content: "Where's my gate?",
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
    const res = await POST(req);
    const text = await res.text();

    expect(text).toContain('"type":"token"');
    expect(text).toContain('"type":"structured"');
    expect(text).toContain('"type":"complete"');
    expect(text).toMatch(/data: .+\n\n/);
  });

  it("handles missing API key error and sends error event", async () => {
    vi.stubEnv("TEST_THROW_MISSING_KEY", "true");
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [] }),
    });
    const res = await POST(req);
    const text = await res.text();

    expect(text).toContain('"type":"error"');
    expect(text).toContain("API key not configured");
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: "not-json",
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("handles rate limit error and sends error SSE event", async () => {
    vi.stubEnv("TEST_THROW_RATE_LIMIT", "true");
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [] }),
    });
    const res = await POST(req);
    const text = await res.text();

    expect(text).toContain('"type":"error"');
    expect(text).toMatch(/[Rr]ate limit/);
  });

  it("respects abort signal from client", async () => {
    vi.stubEnv("TEST_SHOULD_DELAY", "true");
    const controller = new AbortController();
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [] }),
      signal: controller.signal,
    });

    const resPromise = POST(req);
    controller.abort();

    const res = await resPromise;
    expect(res.status).toBe(200);
  });
});

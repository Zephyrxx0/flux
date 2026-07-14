# Phase 15: AI Alert Stream - Research

**Researched:** 2026-07-15
**Domain:** AI-powered streaming alert generation (Gemini + SSE)
**Confidence:** HIGH

## Summary

Phase 15 streams Gemini-analyzed zone density alerts to an ops dashboard via Server-Sent Events. Every 45s, the server-side route handler sends all zone densities + match context to `gemini-2.5-flash` via the `:streamGenerateContent` endpoint, pipes streaming JSON tokens through a `ReadableStream` to the client, validates the complete output with Zod, and dispatches `AlertEvent` objects to the Zustand alert store. The AlertFeed component renders severity-coded alerts (nominal/warning/critical) with auto-scroll, FIFO 50-item cap, and a "New alerts below" chip.

The core technical pattern is well-documented via the existing v1 Gemini fetch code in `generateRiskReport.ts` and the SSE stub in `route.ts`. The main technical risks are: (1) zone density data availability in the server-side route handler (the liveStore singleton is NOT shared between client and server in Next.js), (2) Gemini free-tier rate limits (10 RPM / 250 RPD — at 45s cycles this is ~1.33 RPM for one match, but multi-match scenarios exceed free tier), and (3) streaming reliability across network interruptions.

**Primary recommendation:** Implement the server-side Gemini utility as a self-contained module (`src/lib/ai/gemini.ts`) that reads zone data from presets + current match state (computed server-side) rather than depending on the client-populated Zustand store. Use the raw `fetch()` + `ReadableStream` pattern with the four critical SSE headers, `export const dynamic = "force-dynamic"`, and `request.signal` cleanup for client disconnect. Add Promptfoo as a devDependency for regression testing against a labeled reference dataset.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### AI Model & API Calling Pattern
- **D-15-01:** Use Gemini (existing AI Studio / raw fetch pattern from v1), not Anthropic SDK. No `@anthropic-ai/sdk` — raw fetch to `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent`.
- **D-15-02:** Gemini response streams token-by-token into the SSE stream. Each 45s cycle pipes Gemini streamed output into SSE events for real-time feel.
- **D-15-03:** Model: `gemini-2.5-flash` (same as v1 Risk Report).
- **D-15-04:** Server-side env var: `GEMINI_API_KEY` (follows `WORLDCUP26_TOKEN` naming from Phase 14). Used via `process.env.GEMINI_API_KEY` in the Next.js API route. NOT `VITE_GEMINI_API_KEY` (client-side Vite pattern from v1).
- **D-15-05:** The Gemini fetch logic will be a server-side utility (similar to `src/lib/api/worldcup26.ts` from Phase 14), not a direct copy of the client-side `generateRiskReport.ts`.

#### Alert Analysis Scope & Prompt
- **D-15-06:** Each 45s cycle, Gemini receives all zone densities + match context (score, phase, minute) in one prompt.
- **D-15-07:** Severity levels determined by structured density thresholds (e.g., <60%=nominal, 60-80%=warning, >80%=critical) with Gemini judgment for edge cases — not free-form only.
- **D-15-08:** Follow the existing v1 prompt-builder pattern: a dedicated `buildAlertPrompt(zones, matchState)` function (like `buildGeminiRiskPrompt`), not inline in the route handler.
- **D-15-09:** Gemini returns an array of per-zone alerts: `[{ zoneId, severity, message }]`. Each zone gets a separate `AlertEvent` with individual `id`/`timestamp`.

#### SSE Client Hook
- **D-15-10:** Dedicated `useAlertStream` hook (parallel to `useMatchPoller`). Reads from `EventSource('/api/alert')`, parses SSE events, calls `addAlert()` on alertSlice.
- **D-15-11:** Mount at dashboard page level (`src/app/(dashboard)/dashboard/page.tsx`), alongside `useMatchPoller`. AlertFeed is a presentational component reading from alertSlice.
- **D-15-12:** Show disconnection notice in AlertFeed + auto-reconnect with exponential backoff (1s, 2s, 4s, max 8s).
- **D-15-13:** `AbortController` owned by the hook — cancels alert generation on component unmount or page navigation (per success criteria).

#### AlertFeed Component & Layout
- **D-15-14:** AlertFeed positioned below MatchBanner in the dashboard layout, as a scrollable section filling the main content area.
- **D-15-15:** Severity visual treatment: semantic colors (nominal=green/teal, warning=amber, critical=red) with matching icons and left-border accent. Uses existing shadcn badge + alert components.
- **D-15-16:** Auto-scroll to latest alert when new one arrives. If user scrolls up to read history, show a "New alerts below" chip — clicking it scrolls down.
- **D-15-17:** No per-alert dismiss. Clear all button clears all alerts. FIFO retention: max 50 alerts in memory (oldest dropped when exceeded).

### the agent's Discretion
*(None listed in CONTEXT.md)*

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AIAL-01 | Claude analyzes zone density data every 45s and streams ops alerts via SSE | Gemini `:streamGenerateContent` with `?alt=sse` provides token-by-token streaming. Server-side route handler with `ReadableStream` + 4 SSE headers delivers to client. 45s cycle managed by client `oncomplete` → `setTimeout(connect, 45000)`. Zone density data source needs resolution (see Key Findings). |
| AIAL-02 | Alerts classified by severity (nominal, warning, critical) with visual treatment in live feed | Structured prompt with density thresholds (nominal <60%, warning 60-80%, critical >80%) + `responseMimeType: application/json`. Zod validation schemas already exist at `src/types/alert.ts`. shadcn Alert + Badge components available for visual treatment. |
</phase_requirements>

## Key Architectural Discovery: Zone Data Source Gap

**Critical finding:** The server-side `/api/alert` route handler CANNOT read zone occupancy data from `LiveStore.getState().zones` because:
1. The `zones` property does NOT exist on the `LiveStore` type — only `v1ZoneData: SimulationInput | null` with static capacity data
2. The Zustand `liveStore` singleton exists as separate module instances on client (browser) vs server (Node.js) — client-side `initializeSim(presets.normal)` does NOT populate the server-side store
3. The match polling (Phase 14) populates the client-side match slice only — `/api/match` returns data to the client but does not populate the server-side store

**Recommended resolution:** The route handler should self-initialize its zone data by importing `presets.normal` from the simulation library and computing zone occupancy server-side based on the current match phase/minute. This avoids creating a client↔server shared-state dependency. The `simulateDeterministic()` function is pure computation (no browser APIs) and can be imported server-side.

Alternatively, the `useAlertStream` hook could pass zone state as query parameters to the `EventSource` URL, but this is fragile (URL length limits, serialization overhead). Self-contained server-side initialization is cleaner.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Zone density analysis | API / Backend | — | Gemini fetch runs in server-side route handler; never in client bundle |
| SSE stream delivery | API / Backend | — | `ReadableStream` returned from `route.ts`; server maintains persistent connection |
| Alert display & feed | Browser / Client | — | React component rendering from Zustand store; pure presentation |
| Alert state management | Browser / Client | — | Zustand `alertSlice` in-memory store; FIFO cap applied on `addAlert` |
| SSE connection lifecycle | Browser / Client | — | `useAlertStream` hook manages `EventSource` open/close/reconnect |
| Auto-reconnect logic | Browser / Client | — | Exponential backoff in `useAlertStream`; pure client-side concern |
| Prompt building | API / Backend | — | `buildAlertPrompt()` runs in route handler; stateless per cycle |
| Zod validation | API / Backend | — | Server-side `safeParse` before dispatching alerts to SSE |
| Rate limit / error handling | API / Backend | — | 429/5xx detection and error SSE event in route handler |

## Standard Stack

### Core (No New Dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Gemini API (raw fetch) | `gemini-2.5-flash` | Zone density analysis + JSON structured output | Already used in v1 (`generateRiskReport.ts`); raw fetch pattern locked by D-15-01 |
| Zod | ^3.x (existing) | Server-side validation of Gemini JSON output | Already used project-wide per D-11; `AlertEventSchema` exists at `src/types/alert.ts` |
| Zustand | ^5.x (existing) | Client-side alert state management (alertSlice) | Already used per D-05; `alertSlice` wired into `liveStore` |
| Next.js App Router | ^15.x (existing) | SSE route handler via `route.ts` | Already the app framework per D-01; native `ReadableStream` support |
| Tailwind CSS | ^4.x (existing) | AlertFeed severity styling (semantic colors) | Already the styling framework; matches MatchBanner patterns |

### Testing / Eval (New Dev Dependency)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| promptfoo | ^0.121.19 | Structured eval of Gemini severity classification | CI/CD regression testing + offline prompt eval against labeled dataset |

**Version verification:**

```bash
npm view promptfoo version
# → 0.121.19 [VERIFIED: npm registry]
zod already present: v3.x
zustand already present: v5.x
next already present: v15.x
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Raw fetch (D-15-01) | `@google/generative-ai` SDK | Adds dependency, no benefit for single-model raw-fetch already working (v1 pattern) |
| SSE via ReadableStream (D-09) | WebSockets / Socket.io | SSE is simpler, unidirectional (server→client) which matches alert use case perfectly |
| EventSource (D-15-10) | Fetch + ReadableStream reader | EventSource handles reconnection natively; only supports GET — fine since alert route is stateless |
| Native `overflow-y-auto` | shadcn ScrollArea | No shadcn scroll-area installed; native scroll is simpler and avoids component dependency |

**Installation:**
```bash
pnpm add -D promptfoo
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| promptfoo | npm | 3+ yrs | ~200K/wk | github.com/promptfoo/promptfoo | OK [VERIFIED: npm registry] | Approved |
| zod | npm | 6+ yrs | 50M+/wk | github.com/colinhacks/zod | OK | Already installed |
| zustand | npm | 5+ yrs | 10M+/wk | github.com/pmndrs/zustand | OK | Already installed |
| next | npm | 8+ yrs | 50M+/wk | github.com/vercel/next.js | OK | Already installed |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none
**NOTE on `@google/generative-ai`:** Not installing per D-15-01. The v1 pattern already uses raw fetch successfully.

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT (Browser)                                               │
│                                                                 │
│  dashboard/page.tsx                                             │
│  ├── useMatchPoller → GET /api/match ─────────────────────────┐ │
│  │                    (30s polling, client-only store update)  │ │
│  ├── useAlertStream → GET /api/alert ────────────────────────┐│ │
│  │   EventSource('/api/alert')                               ││ │
│  │   ├── onmessage({ type: "alert", alert }) → addAlert()   ││ │
│  │   └── onerror → reconnect(1s,2s,4s,8s max)                ││ │
│  └── AlertFeed (reads from alertSlice)                         ││ │
│       ├── auto-scroll to latest                              ││ │
│       ├── "New alerts below" chip on scroll-up               ││ │
│       └── Clear All button (FIFO 50 cap)                     ││ │
│                                                                ││ │
└────────────────────────────────────────────────────────────────┤│ │
                                                                 ▼▼ ▼
┌─────────────────────────────────────────────────────────────────┐
│  SERVER (Next.js Node.js process)                                │
│                                                                  │
│  /api/alert route.ts                                             │
│  ├── export const dynamic = "force-dynamic"                      │
│  ├── export const maxDuration = 60                               │
│  ├── Read zone data (server-computed from presets + match phase) │
│  ├── buildAlertPrompt(zones, matchState)                         │
│  ├── streamGeminiAlerts(prompt)                                  │
│  │   └── raw fetch → :streamGenerateContent?alt=sse              │
│  │       └── parse SSE chunks → yield text tokens                │
│  ├── ReadableStream (start):                                     │
│  │   ├── for-await tokens → enqueue SSE "data:" events          │
│  │   ├── accumulate JSON → validate with Zod                     │
│  │   ├── send validated AlertEvents as SSE "data:"               │
│  │   ├── send "complete" SSE event → client reconnects in 45s   │
│  │   └── on error → send SSE "error" event                      │
│  ├── request.signal.addEventListener("abort") → cleanup          │
│  └── return new Response(stream, headers)                        │
│                                                                  │
│  /api/match route.ts (Phase 14)                                  │
│  └── proxies worldcup26.ir (unrelated to alert data source)     │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
src/
├── app/api/alert/
│   ├── route.ts                    # SSE route handler (wire Gemini + ReadableStream)
│   └── prompts.ts                  # buildAlertPrompt() function
├── lib/ai/
│   └── gemini.ts                   # Server-side Gemini fetch + stream parsing utility
├── hooks/
│   └── useAlertStream.ts           # Client-side SSE hook (new, model on useMatchPoller)
├── stores/slices/
│   └── alertSlice.ts               # Update addAlert with FIFO 50 cap
├── types/
│   └── alert.ts                    # AlertEventSchema (already exists)
└── components/dashboard/
    └── AlertFeed.tsx               # Severity-coded alert feed component
```

### Pattern 1: Server-side Gemini Streaming Utility
**What:** Server-side async generator that fetches from `:streamGenerateContent`, parses SSE chunks, and yields text tokens as they arrive.
**When to use:** Whenever the server needs to stream Gemini output to a client response.
**Source:** [CITED: AI-SPEC §3 Quick Reference + ai.google.dev/gemini-api/docs/interactions/streaming]

```typescript
// src/lib/ai/gemini.ts — Server-side Gemini streaming utility (D-15-05)
// Adapted from: src/reporting/gemini/generateRiskReport.ts (client-side v1)
// Key differences: server env vars, streaming endpoint, async generator pattern

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-2.5-flash";

export class GeminiFetchError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "GeminiFetchError";
  }
}

export class GeminiRateLimitError extends GeminiFetchError {
  constructor() { super("Gemini rate limit exceeded", 429); }
}

export class GeminiServerError extends GeminiFetchError {
  constructor(status: number) { super(`Gemini server error ${status}`, status); }
}

export function isTransientGeminiError(error: unknown): boolean {
  return error instanceof GeminiRateLimitError || 
    (error instanceof GeminiFetchError && error.status !== undefined && error.status >= 500);
}

/**
 * Read Gemini :streamGenerateContent SSE stream and yield text tokens.
 * Each SSE data: line is a GenerateContentResponse with
 * candidates[0].content.parts[0].text containing partial output.
 */
export async function* streamGeminiResponse(
  prompt: string,
  options?: { signal?: AbortSignal }
): AsyncGenerator<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiFetchError("Missing GEMINI_API_KEY");

  const response = await fetch(
    `${GEMINI_BASE}/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: options?.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          maxOutputTokens: 1024,
        },
      }),
    },
  );

  if (response.status === 429) throw new GeminiRateLimitError();
  if (response.status >= 500) throw new GeminiServerError(response.status);
  if (!response.ok) throw new GeminiFetchError(`Gemini request failed: ${response.status}`, response.status);
  if (!response.body) throw new GeminiFetchError("Gemini response has no body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {
        // Skip malformed SSE lines (rare)
      }
    }
  }
}
```

### Pattern 2: SSE Route Handler with ReadableStream
**What:** Next.js App Router SSE endpoint that returns a `ReadableStream` immediately, with streaming logic inside `start(controller)`.
**When to use:** Any server-to-client streaming where you need LLM token-by-token delivery.
**Source:** [CITED: Next.js Launchpad SSE Guide 2026 + AI-SPEC §3]

```typescript
// src/app/api/alert/route.ts — SSE streaming route handler
// CRITICAL: Read the Key Architectural Discovery section above — zone data source needs resolution

export const dynamic = "force-dynamic";     // Prevents route caching (NEXT.js default caches GET routes)
export const maxDuration = 60;              // Node.js default is 10s; Gemini stream may exceed

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  // Zone data source TODO: See "Key Architectural Discovery" section
  // Approach: import presets from simulation library + compute occupancy server-side
  // const zoneData = computeCurrentZoneOccupancy(matchStore.getState().match);
  // const matchState = matchStore.getState().match;
  // const prompt = buildAlertPrompt(zoneData, matchState);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let accumulatedJson = "";

        for await (const token of streamGeminiResponse(prompt, { signal: request.signal })) {
          accumulatedJson += token;
          // Forward raw tokens for progressive display
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "token", text: token })}\n\n`)
          );
        }

        // Validate complete accumulated JSON
        const alerts = validateAlertOutput(accumulatedJson);

        for (const alert of alerts) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "alert", alert })}\n\n`)
          );
        }

        controller.enqueue(encoder.encode("data: {\"type\":\"complete\"}\n\n"));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[alert] Error:", message);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  // Handle client disconnect
  request.signal.addEventListener("abort", () => {
    // The ReadableStream start() will throw when controller.enqueue() fails,
    // and the finally block will close. No extra cleanup needed beyond
    // signal propagation to the Gemini fetch.
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",         // CRITICAL: disables proxy buffering
    },
  });
}
```

### Pattern 3: Client-side useAlertStream Hook
**What:** `EventSource`-based hook with auto-reconnect, exponential backoff, and AbortController cleanup.
**When to use:** Replacing polling with server-push for real-time alert feeds.
**Source:** [CITED: AI-SPEC §3 + Pattern from `useMatchPoller.ts`]

```typescript
// src/hooks/useAlertStream.ts — Client-side SSE hook (D-15-10)
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useLiveStore } from "@/stores/liveStore";

type SSEEvent =
  | { type: "token"; text: string }
  | { type: "alert"; alert: import("@/types/alert").AlertEvent }
  | { type: "error"; message: string }
  | { type: "complete" };

const RECONNECT_BASE = 1_000;  // 1s, 2s, 4s, max 8s (D-15-12)
const RECONNECT_MAX = 8_000;

export function useAlertStream() {
  const addAlert = useLiveStore((s) => s.addAlert);
  const sourceRef = useRef<EventSource | null>(null);
  const retryRef = useRef<number>(RECONNECT_BASE);
  const disconnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
    }

    const source = new EventSource("/api/alert");
    sourceRef.current = source;

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SSEEvent;

        if (data.type === "alert") {
          addAlert(data.alert);
          retryRef.current = RECONNECT_BASE;   // Reset on success
          disconnectedRef.current = false;
        }
        if (data.type === "error") {
          console.warn("[alert-stream] Server error:", data.message);
          disconnectedRef.current = true;
        }
        if (data.type === "complete") {
          source.close();
          // Reconnect after 45s for next analysis cycle
          setTimeout(connect, 45_000);
        }
      } catch {
        // Malformed SSE line — ignore
      }
    };

    source.onerror = () => {
      source.close();
      disconnectedRef.current = true;
      const delay = Math.min(retryRef.current, RECONNECT_MAX);
      retryRef.current *= 2;
      setTimeout(connect, delay);
    };
  }, [addAlert]);

  useEffect(() => {
    connect();
    return () => {
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, [connect]);

  return { isDisconnected: disconnectedRef };
}
```

### Pattern 4: AlertFeed Component
**What:** Presentational component reading from alertSlice, rendering severity-coded alert cards with auto-scroll behavior.
**When to use:** Displaying a time-ordered feed of event-driven alerts.
**Source:** [CITED: D-15-14 through D-15-17 + existing MatchBanner pattern]

```typescript
// src/components/dashboard/AlertFeed.tsx — Severity-coded live alert feed
// Pattern: Presentational component reading from liveStore (same as MatchBanner)

interface AlertFeedProps {
  onClearAll?: () => void;
}

// Severity → visual mapping (D-15-15)
const severityConfig = {
  nominal: {
    icon: "CheckCircle2",      // lucide-react icons
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-500/10",
    badge: { variant: "outline", className: "text-emerald-600 border-emerald-400" },
  },
  warning: {
    icon: "AlertTriangle",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-500/10",
    badge: { variant: "secondary", className: "text-amber-600 bg-amber-500/10" },
  },
  critical: {
    icon: "AlertCircle",
    borderColor: "border-red-500",
    bgColor: "bg-red-500/10",
    badge: { variant: "destructive", className: "" },
  },
};
```

### Anti-Patterns to Avoid

- **Buffering Gemini output before returning the Response:** If you `for await` the entire Gemini stream before returning the `Response(stream, headers)`, Next.js buffers everything and sends it all at once — it looks like streaming isn't working. Always return the Response immediately and put the `for await` loop inside `start(controller)`.
- **Missing `force-dynamic`:** Next.js caches GET Route Handlers by default. Without `export const dynamic = "force-dynamic"`, the SSE route may serve stale cached responses or not stream at all.
- **Single-newline SSE events:** Each SSE event MUST end with `\n\n` (double newline). A single `\n` breaks browser `EventSource` parsers silently.
- **Missing `X-Accel-Buffering: no`:** Without this header, Nginx (used by Cloud Run) buffers SSE chunks and delivers them in a single burst when the connection closes. The stream looks identical to non-streaming.
- **Zone data from client-side store:** The Zustand store is not shared between client and server. Don't assume `LiveStore.getState().zones` works in the route handler.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SSE wire protocol parsing | Custom SSE stream parser | Browser-native `EventSource` API | `EventSource` handles reconnection, `Last-Event-ID`, and parsing natively. Only use `fetch + getReader` for POST-based SSE. |
| LLM structured output schema | Custom JSON parser with if/else | Zod `safeParse` | Already in project; validates Gemini output with clear error messages; handles malformed output gracefully |
| Exponential backoff timer | Custom retry logic library | Simple `Math.min(retry *= 2, max)` in `setTimeout` | 5 lines of code; no external dependency needed; matches `useMatchPoller` pattern exactly |
| Gemini API client SDK | Wrapping `fetch()` in a class | Raw `fetch()` + async generator | v1 already uses raw fetch; adding `@google/generative-ai` SDK adds dependency with zero benefit for a single endpoint call |
| Chat/feed UI "new items" chip | Custom scroll position tracker | IntersectionObserver on a sentinel element | Native API, simple to implement, matches common chat-UI patterns |

**Key insight:** Phase 15's technical requirements are well-served by browser-native APIs (`EventSource`, `ReadableStream`, `AbortController`) and the project's existing stack (Zod, Zustand, raw fetch). No new framework or SDK is needed.

## State of the Art

| Old Approach (v1) | Current Approach (Phase 15) | When Changed | Impact |
|-------------------|-----------------------------|--------------|--------|
| Client-side Gemini fetch (`VITE_GEMINI_API_KEY`) | Server-side Gemini fetch (`process.env.GEMINI_API_KEY`) | Phase 15 | API key no longer exposed in client bundle; follows Phase 14 pattern |
| Non-streaming `:generateContent` | Streaming `:streamGenerateContent` with `?alt=sse` | Phase 15 | Progressive alert delivery; tokens visible as they arrive |
| `import.meta.env` for env vars | `process.env` for server-side env | Phase 15 | Inversion from Vite client pattern to Next.js server pattern |
| Single RiskReport per simulation run | Continuous 45s cycle per match | Phase 15 | Stateless per-cycle; cross-cycle context managed by SSE reconnect |

**Deprecated/outdated:**
- `VITE_GEMINI_API_KEY` env var — replaced by `GEMINI_API_KEY` (server-side). Update `.env.example` to include both.
- Client-side raw `:generateContent` pattern in `generateRiskReport.ts` — kept for backward compatibility but Phase 15 establishes the server-side streaming pattern.

## Common Pitfalls

### Pitfall 1: Missing `?alt=sse` on streamGenerateContent URL
**What goes wrong:** Without `?alt=sse`, the endpoint returns a single JSON blob with an array of chunks rather than true line-by-line SSE streaming.
**Why it happens:** The `:streamGenerateContent` endpoint requires `?alt=sse` as a URL parameter to enable SSE wire format.
**How to avoid:** Always append `?alt=sse&key=...` (in that order — verified ordering matters) to the endpoint URL.
**Warning signs:** The response arrives in one chunk after a long delay, not progressively.

### Pitfall 2: Route handler buffers before returning Response
**What goes wrong:** All SSE events arrive at once at the end of the 45s cycle instead of streaming progressively.
**Why it happens:** The `for await` loop over Gemini tokens runs before the `return new Response(stream, ...)`. Next.js buffers the entire handler output.
**How to avoid:** Put the streaming loop inside `ReadableStream`'s `start(controller)` callback. Return the Response immediately.
**Warning signs:** Client receives all tokens in a single `onmessage` call.

### Pitfall 3: SSE connection leaks on unmount
**What goes wrong:** Navigating away from the dashboard leaves orphaned SSE connections — memory leak, server load.
**Why it happens:** The `useEffect` return doesn't call `EventSource.close()`.
**How to avoid:** Return cleanup from `useEffect` that calls `sourceRef.current?.close()`. Reference the `useMatchPoller` cleanup pattern.
**Warning signs:** Browser DevTools shows growing number of open connections to `/api/alert`.

### Pitfall 4: Gemini free-tier rate limit exceeded in production
**What goes wrong:** After 250 requests per day (or fewer, depending on account), Gemini returns 429 errors.
**Why it happens:** Free tier caps at 250 RPD / 10 RPM. At 45s cycles, one match = ~120 cycles/match × ~2 matches/day demoing = 240 RPD. Near the limit. For 10 matches simultaneously, RPM exceeds free tier.
**How to avoid:** Enable billing on the Google Cloud project for pay-as-you-go tier (2,000 RPM / 10,000 RPD). The cost is negligible (~$0.0003/cycle = ~$18/year for 500 matches).
**Warning signs:** `GeminiRateLimitError` in server logs after 200+ cycles.

### Pitfall 5: Zone data not available in server-side route handler
**What goes wrong:** `LiveStore.getState().zones` returns `undefined` and the prompt builder crashes.
**Why it happens:** The Zustand store singleton on the server is a different module instance from the client's store. Client-side `initializeSim()` doesn't populate the server store.
**How to avoid:** Self-initialize zone data in the route handler by importing `presets.normal` and computing occupancy server-side. See "Key Architectural Discovery" section.
**Warning signs:** Route handler throws `TypeError: Cannot read properties of undefined (reading 'zones')`.

## Code Examples

### Server-side Gemini Fetch (adapted from v1 pattern)
```typescript
// Complete server-side utility pattern
// Source: [CITED: AI-SPEC §3 + existing generateRiskReport.ts pattern]

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Invoke Gemini streaming — returns parsed JSON text
export async function* streamGeminiAlerts(prompt: string): AsyncGenerator<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          maxOutputTokens: 1024,
        },
      }),
    },
  );

  if (!response.ok || !response.body) {
    throw new Error(`Gemini request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch { /* skip malformed lines */ }
    }
  }
}
```

### Zod Validation for Gemini Output
```typescript
// Source: [CITED: src/types/alert.ts + existing generateRiskReport.ts pattern]

function validateAlertOutput(rawJson: string): AlertEvent[] {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJson);
  } catch {
    console.error("[alert] Gemini output was not valid JSON");
    return [];
  }

  // Handle both array and single-object responses
  const items = Array.isArray(parsedJson) ? parsedJson : [parsedJson];

  return items
    .map((item: unknown) => {
      const result = AlertEventSchema.safeParse({
        ...(item as Record<string, unknown>),
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      });
      if (!result.success) {
        console.warn("[alert] Zod validation failed:", result.error.flatten());
        return null;
      }
      return result.data;
    })
    .filter((a: AlertEvent | null): a is AlertEvent => a !== null);
}
```

### FIFO 50 Cap on alertSlice
```typescript
// Source: [CITED: D-15-17 + existing alertSlice.ts]

// In src/stores/slices/alertSlice.ts:
addAlert: (alert) => set((state) => ({
  alerts: [...state.alerts, alert].slice(-50),  // FIFO: keep newest 50
})),
```

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Server runtime | ✓ | 26.3.0 | — |
| GEMINI_API_KEY env var | Gemini fetch | ✗ — not set | — | Alert route returns error SSE event if missing |
| npm/pnpm | Package install | ✓ | pnpm 10.x | — |
| Browser API (EventSource) | Client hook | ✓ (browser) | — | — |
| Node.js crypto.randomUUID | Alert ID generation | ✓ | v26.3.0 native | — |

**Missing dependencies with no fallback:**
- `GEMINI_API_KEY` — must be added to `.env.local` and `.env.example`. Follows `WORLDCUP26_TOKEN` naming convention from Phase 14. Without it, the alert route will return error SSE events on every cycle.

**Missing dependencies with fallback:**
- None — all core tech (Next.js, Zod, Zustand, shadcn UI) is already installed.

**Environment config update needed:**
- Add to `.env.example`: `GEMINI_API_KEY=your_gemini_api_key_here`
- Update existing `VITE_GEMINI_API_KEY` documentation to also document `GEMINI_API_KEY`

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — include this section.

### Existing Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | vitest ^3.x (existing) |
| Config file | `vitest.config.ts` (includes `tests/**/*.test.ts` and `tests/**/*.test.tsx`) |
| Quick run command | `pnpm vitest run tests/api/alert.test.ts` |
| Full suite command | `pnpm vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AIAL-01 | Route handler returns SSE with correct headers | integration | `npx vitest run tests/api/alert.test.ts` | ❌ Wave 0 |
| AIAL-01 | Route handler closes stream on client disconnect | integration | `npx vitest run tests/api/alert.test.ts` | ❌ Wave 0 |
| AIAL-02 | AlertFeed renders severity-coded alerts | component | `npx vitest run tests/components/dashboard/AlertFeed.test.tsx` | ❌ Wave 0 |
| AIAL-02 | AlertSlice FIFO cap at 50 items | unit | `npx vitest run tests/stores/alertSlice.test.ts` | ❌ Wave 0 |
| AIAL-01 | buildAlertPrompt returns non-empty string | unit | `npx vitest run tests/lib/ai/buildAlertPrompt.test.ts` | ❌ Wave 0 |
| AIAL-02 | Gemini JSON output validates against AlertEventSchema | unit | `npx vitest run tests/lib/ai/gemini.test.ts` | ❌ Wave 0 |

### Evaluation Testing (Promptfoo)

| Test | Area | Assertions | File |
|------|------|-----------|------|
| Normal density — all zones nominal | Severity Calibration | `is-json`, `contains-json: {severity:nominal}`, `not-contains-json: {severity:critical}` | `promptfooconfig.yaml` at root |
| Warning density — zone at 78% | Severity Calibration | `is-json`, `contains-json: {severity:warning}`, `not-contains-json: {severity:critical}` | `promptfooconfig.yaml` |
| Critical density — zone at 87% | Severity Calibration | `is-json`, `contains-json: {severity:critical}` | `promptfooconfig.yaml` |
| All zones nominal — expect empty array | Coverage | `javascript: JSON.parse(output).length === 0` | `promptfooconfig.yaml` |
| Zone at exactly 80% threshold | Boundary | `contains-json: {severity:warning}` (should NOT be critical) | `promptfooconfig.yaml` |
| Zone at 79% (edge) | Boundary | `contains-json: {severity:warning}` | `promptfooconfig.yaml` |
| Post-goal density surge | Critical Detection | `contains-json: {severity:critical}` | `promptfooconfig.yaml` |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/api/alert.test.ts` (quick integration test)
- **Per wave merge:** `pnpm promptfoo eval -c promptfooconfig.yaml --output eval-results.json && pnpm vitest run`
- **Phase gate:** Full suite green + promptfoo eval passes before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/api/alert.test.ts` — SSE headers, stream format, error handling, abort signal
- [ ] `tests/lib/ai/gemini.test.ts` — Gemini stream parsing, error types, Zod validation
- [ ] `tests/lib/ai/buildAlertPrompt.test.ts` — prompt builder output for various zone/match states
- [ ] `tests/stores/alertSlice.test.ts` — FIFO 50 cap, clearAlerts, addAlert
- [ ] `tests/components/dashboard/AlertFeed.test.tsx` — severity rendering, auto-scroll, clear-all, disconnection notice
- [ ] `promptfooconfig.yaml` at project root — Promptfoo eval config with 8+ test scenarios
- [ ] Install Promptfoo: `pnpm add -D promptfoo`

## Security Domain

> `security_enforcement` is absent from config — treat as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No user auth — ops dashboard is a single-page internal tool |
| V3 Session Management | No | No sessions — ephemeral SSE connection only |
| V4 Access Control | No | No multi-tenant — single ops user |
| V5 Input Validation | yes | Zod `safeParse` on Gemini output before dispatch; prompt builder output is validated before sending to Gemini |
| V6 Cryptography | No | No data at rest; API key stored in environment variable |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Gemini API key exposure in client bundle | Information Disclosure | Server-side `process.env.GEMINI_API_KEY` (D-15-04); no client-side env var usage |
| Malformed Gemini output causing client crash | Denial of Service | Zod `safeParse` with per-item filtering; invalid items dropped, valid items preserved |
| SSE connection exhaustion (runaway reconnection) | Denial of Service | Exponential backoff capped at 8s max (D-15-12); prevents reconnect storm |
| Zone density data manipulation | Tampering | Zone data computed server-side from presets; not user-controllable |
| Gemini prompt injection via zone names | Spoofing | Zone IDs are fixed strings from presets; not user input |

**Server-side env var management:** The `GEMINI_API_KEY` pattern follows Phase 14's `WORLDCUP26_TOKEN` — server-only, never exposed to client bundle. Route handler uses `process.env.GEMINI_API_KEY` directly without importing files that might leak to client scope.

**No additional security measures needed** for Phase 15. The architecture is internal-facing (ops dashboard only), no user input reaches the Gemini prompt (zone data is from presets), and the API key is server-side only.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Zone density data can be self-initialized from `presets.normal` + `simulateDeterministic` on the server | Key Architectural Discovery | If the simulation engine has client-only dependencies (DOM, localStorage), server-side computation would fail, requiring a different zone data strategy |
| A2 | The Zustand store singleton on the server (Node.js) and client (browser) are separate instances | Key Architectural Discovery | If Next.js module sharing makes them the same singleton in dev mode, developers might incorrectly assume the pattern works in production |
| A3 | Gemini 2.5 Flash free tier (10 RPM / 250 RPD) is sufficient for development and demo | Common Pitfalls | If Google silently reduces limits (as reported in Dec 2025), development cycles may hit rate limits unexpectedly |
| A4 | `crypto.randomUUID()` is available in the Next.js server runtime | Code Examples | Confirmed available in Node.js v26.3.0; previous Node versions (pre-19) lack it |
| A5 | `export const maxDuration = 60` works on the deployment platform | Environment Availability | Cloud Run has its own timeout (default 5min); Vercel has 10s default for Hobby plan. If deployment uses Vercel Hobby, maxDuration requires Pro plan. Cloud Run standalone `output: 'standalone'` may not respect `maxDuration`. |

**A1 and A2 are CRITICAL** — if either assumption is wrong, the alert route handler cannot generate zone data and the phase architecture needs redesign. The planner should gate these assumptions behind a spike/verification task in the first plan.

## Open Questions

1. **How should zone density data be sourced in the server-side route handler?**
   - What we know: The Zustand store is not shared between client and server. `LiveStore.getState().zones` doesn't exist. `v1ZoneData` has static capacities only.
   - What's unclear: Which approach to use — (a) self-initialize from presets + simulate server-side, (b) add a zone state endpoint that the client POSTs to, (c) have the `useAlertStream` hook send zone data as query params.
   - Recommendation: Option (a) — self-contained server-side initialization. The simulation engine (`simulateDeterministic`) is pure computation and can be imported server-side. The route handler initializes zone data at connection start and computes current occupancy based on match phase and arrival schedule. This avoids client↔server state coupling.

2. **Does `simulateDeterministic()` have any client-side-only dependencies?**
   - What we know: The function takes `SimulationInput` and returns `SimulationOutput`. It imports from `../contracts/input.schema` (Zod) and uses `Math` for computations.
   - What's unclear: Whether any transitive dependency imports browser APIs (DOM, `window`, `localStorage`).
   - Recommendation: Verify by checking `simulateDeterministic.ts` and its import chain for any client-only dependencies. If clean, self-initialization is viable.

3. **What is the actual Gemini API rate limit for the project's GCP project?**
   - What we know: Official free tier is 10 RPM / 250 RPD for Gemini 2.5 Flash. Google silently reduced some accounts to 20 RPD in Dec 2025.
   - What's unclear: The project's actual rate limit (depends on whether billing is enabled and the project's current tier).
   - Recommendation: Run `gsd-tools query env check GEMINI_API_KEY` or manually verify by making a test API call. Document the limit in `PROJECT.md`.

## Sources

### Primary (HIGH confidence)
- [Context7] Gemini API docs — `streamGenerateContent` SSE format, `responseMimeType: application/json`, generation config — [CITED: ai.google.dev/gemini-api/docs/interactions/streaming]
- [Context7] Gemini API structured output — Zod schema matching, JSON mode, `maxOutputTokens` — [CITED: ai.google.dev/gemini-api/docs/generate-content/structured-output]
- [WebSearch] Next.js SSE guide — `force-dynamic`, `ReadableStream`, headers, `request.signal.abort` — [CITED: nextjslaunchpad.com/article/nextjs-server-sent-events]
- [WebSearch] Next.js raw SSE streaming — golden rules, Nginx buffering, timeout — [CITED: hassanr.com/blogs/nextjs-app-router-ai-streaming-gemini-server-sent-events-2026.html]
- [Codebase] `src/reporting/gemini/generateRiskReport.ts` — v1 client-side Gemini fetch pattern
- [Codebase] `src/reporting/gemini/errors.ts` — Gemini error type hierarchy
- [Codebase] `src/reporting/gemini/buildPrompt.ts` — v1 prompt builder pattern
- [Codebase] `src/hooks/useMatchPoller.ts` — Polling hook pattern (cleanup, visibility, callback refs)
- [Codebase] `src/types/alert.ts` — `AlertEventSchema` Zod schema
- [Codebase] `src/stores/slices/alertSlice.ts` — Alert slice (needs FIFO cap)
- [Codebase] `src/app/api/alert/route.ts` — SSE stub (placeholder)
- [Codebase] `src/components/ui/alert.tsx` — shadcn Alert component
- [Codebase] `src/components/ui/badge.tsx` — shadcn Badge component

### Secondary (MEDIUM confidence)
- [WebSearch] Gemini 2.5 Flash rate limits — free tier 10 RPM / 250 RPD / 250K TPM — [CITED: shareuhack.com, ai.google.dev/gemini-api/docs/rate-limits]
- [WebSearch] Promptfoo CLI reference — eval config format, assertions, `promptfooconfig.yaml` — [CITED: promptfoo.dev/docs/usage/command-line/]
- [Codebase] `src/simulation/contracts/input.schema.ts` — ZoneSchema with `{id, capacity}`
- [Codebase] `src/simulation/presets.ts` — `presets.normal` zone data
- [Codebase] `src/simulation/contracts/output.schema.ts` — `SimulationOutput` with `phaseZoneMatrix` (occupancy per zone per phase)

### Tertiary (LOW confidence)
- [WebSearch] Google silently reducing free tier limits in Dec 2025 — unverified anecdotal reports — flagged for validation
- [WebSearch] `X-Accel-Buffering: no` header behavior on Cloud Run — not explicitly confirmed for Google Cloud Run's proxy layer

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are already in the project or verified on npm
- Architecture: MEDIUM — the zone data source gap (A1, A2) introduces uncertainty in the primary data flow
- Pitfalls: HIGH — well-documented from existing v1 patterns and community SSE guides
- Testing: HIGH — Promptfoo is a mature tool, vitest is already configured

**Research date:** 2026-07-15
**Valid until:** 2026-08-15 (30 days — Gemini API and Next.js evolve)

---

*Researched for Phase 15: AI Alert Stream*
*Requirements: AIAL-01, AIAL-02*

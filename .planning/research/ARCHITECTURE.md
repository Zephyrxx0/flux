# Architecture Research: Smart Stadium Operations — Live Data Integration

**Domain:** Smart Stadium Operations / Real-time Crowd Simulation
**Researched:** 2026-07-13
**Confidence:** HIGH

## Executive Summary

The v2.0 upgrade transforms a pre-event planning tool (static Vite + Nginx) into a live stadium operations system requiring server-side API routes, SSE streaming, and real-time state management. The critical architectural insight: **the existing Vite static build cannot support the v2.0 API routes** — a server runtime must be introduced. Next.js App Router is the natural choice since it is already in `package.json` and the `src/app/` directory structure exists. The new `simulationStore` (Zustand) becomes the central single source of truth for live state, consumed by both ops dashboard components and the dual-mode AI system, while the existing `useScenarioStore` continues to manage configuration and persisted scenarios unchanged.

---

## Existing Architecture (v1.0 — Shipped)

```
┌──────────────────────────────────────────────────────────────────┐
│                    Nginx (Cloud Run)                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Static Assets (dist/)                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │  │
│  │  │  Vite     │  │  React   │  │  Zustand │  │    D3     │  │  │
│  │  │  Bundler  │  │  Runtime │  │  Stores  │  │  Charts   │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │              StadiumSim Engine                        │  │  │
│  │  │  (Pure deterministic, client-side only)               │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │    Gemini API (called from browser via API key)       │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### What stays unchanged from v1.0

| Component | Status | Why |
|-----------|--------|-----|
| `StadiumSim` engine | **Unchanged** | Pure deterministic function, still runs client-side for pre-event config |
| `useScenarioStore` | **Unchanged** | Persisted config + preset loading, separate concern from live state |
| `useComparisonStore` | **Unchanged** | Historical run comparison, orthogonal to live features |
| `useRiskReportStore` | **Unchanged** | Gemini report generation on sim run, still works as before |
| D3 visualization | **Unchanged** | Charts render from `SimulationOutput` which still flows from the engine |
| `VisualizationWorkspace` | **Unchanged** | Still renders scenario results on the "simulate" tab |

---

## Target Architecture (v2.0)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    Next.js Server (Cloud Run, node:22)                        │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │                        Server Routes (API)                              │   │
│  │                                                                         │   │
│  │  /api/match            worldcup26.ir proxy (25s cache)                  │   │
│  │       GET ──► fetch worldcup26.ir ──► cache ──► JSON response            │   │
│  │                                                                         │   │
│  │  /api/weather          OpenWeatherMap proxy (10min cache)               │   │
│  │       GET ──► fetch OWM ──► cache ──► JSON response                     │   │
│  │                                                                         │   │
│  │  /api/ai-alerts        Claude ops alert stream (SSE via POST)           │   │
│  │       POST zoneData ──► fetch Claude ──► stream SSE ──► client          │   │
│  │                                                                         │   │
│  │  /api/fan-chat         Claude fan chatbot stream (SSE via POST)         │   │
│  │       POST question+ctx ──► fetch Claude ──► stream SSE ──► client      │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │                  React Client (Server-rendered shell)                   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │   │
│  │  │  NEW Live Hooks          │  │  NEW Live Components               │  │   │
│  │  │  ┌─────────────────────┐ │  │  ┌────────────┐ ┌───────────────┐ │  │   │
│  │  │  │ useMatchPoller      │ │  │  │MatchBanner │ │ WeatherCard   │ │  │   │
│  │  │  │  (30s interval)     │ │  │  └────────────┘ └───────────────┘ │  │   │
│  │  │  ├─────────────────────┤ │  │  ┌────────────┐ ┌───────────────┐ │  │   │
│  │  │  │ useAlertStream      │ │  │  │ AlertFeed  │ │ FanChat       │ │  │   │
│  │  │  │  (45s SSE)          │ │  │  └────────────┘ └───────────────┘ │  │   │
│  │  │  ├─────────────────────┤ │  │  ┌────────────────┐             │  │   │
│  │  │  │ useWeather          │ │  │  │StadiumSelector │             │  │   │
│  │  │  │  (10min interval)   │ │  │  └────────────────┘             │  │   │
│  │  │  └─────────────────────┘ │  └─────────────────────────────────────┘  │   │
│  │  └─────────────────────────┘                                           │   │
│  │                                                                         │   │
│  │  ┌────────────────────────────────────────────────────────────────┐     │   │
│  │  │                    Zustand Stores                               │     │   │
│  │  │  ┌──────────────────────────────────────────────────────────┐   │     │   │
│  │  │  │  simulationStore  ★ NEW — Single Source of Truth for Live │   │     │   │
│  │  │  │  ┌──────────┐ ┌───────────┐ ┌────────────┐              │   │     │   │
│  │  │  │  │  zones   │ │matchState │ │weatherState│              │   │     │   │
│  │  │  │  ├──────────┤ ├───────────┤ ├────────────┤              │   │     │   │
│  │  │  │  │ alerts[] │ │  phase    │ │ impactNote │              │   │     │   │
│  │  │  │  └──────────┘ └───────────┘ └────────────┘              │   │     │   │
│  │  │  │  Actions: applyMatchEventDelta, updateWeather, addAlert  │   │     │   │
│  │  │  └──────────────────────────────────────────────────────────┘   │     │   │
│  │  │                                                                 │     │   │
│  │  │  ┌──────────────────────┐  ┌──────────────────────┐           │     │   │
│  │  │  │  useScenarioStore    │  │  useRiskReportStore  │           │     │   │
│  │  │  │  (existing,         │  │  (existing,          │           │     │   │
│  │  │  │   unchanged)        │  │   unchanged)         │           │     │   │
│  │  │  └──────────────────────┘  └──────────────────────┘           │     │   │
│  │  └────────────────────────────────────────────────────────────────┘     │   │
│  │                                                                         │   │
│  │  ┌────────────────────────────────────────────────────────────────┐     │   │
│  │  │              Existing Components (unchanged)                    │     │   │
│  │  │  VisualizationWorkspace, ScenarioSidebar, ComparisonPanel,     │     │   │
│  │  │  RiskReportPanel, CinematicHero, MagneticDock, ThreeStadium    │     │   │
│  │  └────────────────────────────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │              External Services                                          │   │
│  │                                                                         │   │
│  │  worldcup26.ir  ◄─── /api/match (server proxied, never client)          │   │
│  │  OpenWeatherMap ◄─── /api/weather (server proxied, never client)        │   │
│  │  Claude (Anthropic) ◄─── /api/ai-alerts, /api/fan-chat (server)         │   │
│  │  Gemini (Google) ◄─── browser directly (existing, unchanged)            │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Architectural Shift: Static Nginx → Next.js App Router Server

### Why This Change Is Mandatory

| Requirement | Static Nginx | Next.js Server |
|-------------|-------------|----------------|
| `/api/match` proxy | ❌ No server to proxy | ✅ Route handler |
| `/api/weather` proxy | ❌ No server to proxy | ✅ Route handler |
| `/api/ai-alerts` SSE streaming | ❌ No server to stream | ✅ Route handler + ReadableStream |
| `/api/fan-chat` SSE streaming | ❌ No server to stream | ✅ Route handler + ReadableStream |
| API key secrecy (ANTHROPIC_KEY) | ❌ Forced to client | ✅ Server-side env var |

### How The Switch Works

Next.js is **already installed** (`package.json` has `"next": "^16.0.0"`), the `tsconfig.json` already includes the `"next"` plugin, and the `src/app/` directory structure already exists with `layout.tsx` and `page.tsx`. The switch requires:

1. **Dockerfile**: `vite build` + Nginx → `next build` + `next start`
2. **No code changes to components**: The existing React components work identically under Next.js since it's a React framework
3. **`.env` changes**: `VITE_GEMINI_API_KEY` continues to work for browser-side Gemini; add `ANTHROPIC_API_KEY` and `OWM_API_KEY` as server-side secrets

### Dockerfile Changes

```
# BEFORE (v1.0) — Static Nginx
FROM node:22-alpine AS builder
RUN npm ci && npm run build       # vite build → dist/
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist ./

# AFTER (v2.0) — Next.js Server
FROM node:22-alpine AS builder
RUN npm ci && npm run build:next   # next build
FROM node:22-alpine AS runtime
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
EXPOSE 8080
CMD ["node_modules/.bin/next", "start", "-p", "8080"]
```

---

## Simulation State Architecture

### simulationStore — The Live SSOT

A NEW Zustand store, separate from the existing stores. It holds **ephemeral live state only** — no persistence. It is the central hub that both ops and fan components read from.

```typescript
// src/hooks/useSimulationStore.ts — NEW

interface ZoneDensity {
  zoneId: string
  capacity: number
  currentOccupancy: number
  occupancyRatio: number
  severity: "green" | "amber" | "red" | "critical"
}

interface MatchState {
  status: "pre-match" | "first-half" | "half-time" | "second-half" | "full-time"
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  minute: number
  lastEvent: MatchEvent | null
  lastUpdated: string
}

interface WeatherState {
  stadiumId: string
  condition: string
  temperature: number
  windSpeed: number
  humidity: number
  densityImpact: "none" | "moderate" | "heavy"  // affects zone processing
  lastUpdated: string
}

interface Alert {
  id: string
  severity: "nominal" | "warning" | "critical"
  zoneId: string | null
  title: string
  message: string
  timestamp: string
  read: boolean
}
```

### Data Flow: Pre-Event vs Live Mode

The app operates in two modes, sharing the same component tree:

**Pre-event mode (existing):**
1. User configures scenario → `useScenarioStore.currentInput`
2. User clicks Run → `StadiumSim.run(input)` → `SimulationOutput`
3. `setLatestSimulationOutput()` → triggers `useRiskReportStore` + `useComparisonStore`
4. D3 charts render from `SimulationOutput.phaseZoneMatrix`

**Live mode (new):**
1. User selects stadium → `useStadiumSelector` sets stadium ID
2. `useMatchPoller` starts polling `/api/match` every 30s
3. `useWeather` fetches `/api/weather` every 10min
4. On match phase transition: `simulationStore.applyMatchEventDelta()` mutates zone densities
5. `useAlertStream` reads zone densities + match state from store, POSTs to `/api/ai-alerts` every 45s
6. AlertFeed reads `simulationStore.alerts[]`
7. FanChat reads `simulationStore.zones[]` + `matchState` for context
8. MatchBanner reads `simulationStore.matchState`

### applyMatchEventDelta — How Match Events Affect Zone Densities

New pure function that maps match events to zone density adjustments. This is the bridge between the live feed and the simulation engine.

```typescript
// src/simulation/live/applyMatchEventDelta.ts — NEW

export interface MatchEvent {
  type: "goal" | "half-time-start" | "half-time-end" | "full-time" | "red-card" | "injury"
  minute: number
  team?: string
}

export interface ZoneAdjustment {
  zoneId: string
  deltaOccupancy: number  // positive = more fans arrive, negative = fans leave
  reason: string
}

export function applyMatchEventDelta(
  zones: ZoneDensity[],
  event: MatchEvent
): ZoneAdjustment[] {
  // Mapping: event types → zone density adjustments
  // - goal: surge in entry zones (+5-10%), fans celebrate
  // - half-time: shift from seating to concessions (north/south → east/west)
  // - full-time: mass exodus, all zones decrease, entry zones get carry-out
  // - red-card: potential tension spike in affected section
  // - injury: medical zone activation
}
```

This function does NOT re-run the full deterministic simulation. It applies deltas to the current zone densities, similar to how a Kalman filter updates state without recomputing from scratch.

---

## SSE Streaming Architecture

### Why SSE Not WebSockets

| Criterion | SSE | WebSocket |
|-----------|-----|-----------|
| Direction | Server → Client only | Bidirectional |
| Connection model | HTTP long-lived connection | Persistent TCP socket |
| Reconnection | Built-in (EventSource auto-reconnect) | Manual reconnection logic |
| POST support | EventSource = GET only; fetch+ReadableStream = any method | N/A (full duplex) |
| Firewall traversal | Standard HTTP | May be blocked |
| Server complexity | Simple route handler | WebSocket upgrade + state management |
| Use case fit | AI streaming = server → client only after client POSTs data | Overkill — we don't need push from client |

**Decision rationale**: We need the client to POST zone data to the server, then receive a streaming response. Standard `EventSource` only does GET. The pattern is `fetch('/api/ai-alerts', { method: 'POST', body: zoneData })` → read the response body as a `ReadableStream`. This is simpler than WebSocket because:
- No upgrade handshake
- No heartbeat management
- Standard HTTP caching on the request
- Works through all proxies

### Client-Side SSE Pattern (useAlertStream)

```typescript
// src/hooks/useAlertStream.ts — NEW

async function fetchAlertStream(zoneData: ZoneDensity[], matchState: MatchState) {
  const response = await fetch('/api/ai-alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zones: zoneData, match: matchState }),
  })

  if (!response.ok || !response.body) {
    throw new Error('Alert stream unavailable')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const payload = line.slice(6).trim()
        if (payload === '[DONE]') return

        const alert = parseAlertChunk(payload)
        if (alert) {
          useSimulationStore.getState().addAlert(alert)
        }
      }
    }
  }
}
```

### Server-Side SSE Pattern (Next.js Route Handler)

```typescript
// src/app/api/ai-alerts/route.ts — NEW

export async function POST(request: Request) {
  const { zones, match } = await request.json()

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            stream: true,
            system: buildAlertSystemPrompt(),
            messages: [{ role: 'user', content: buildAlertUserPrompt(zones, match) }],
          }),
        })

        if (!response.body) throw new Error('No Claude response body')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          // Parse Claude SSE events, extract text deltas
          const text = extractClaudeTextDelta(chunk)
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Alert generation failed' })}\n\n`)
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

---

## Dual-Mode AI Architecture

The same Claude model powers both operations and fan-facing features, differentiated only by system prompts and the data they receive.

| Aspect | Ops Alerts (`/api/ai-alerts`) | Fan Chat (`/api/fan-chat`) |
|--------|-------------------------------|----------------------------|
| **System prompt persona** | "Stadium safety analyst" | "Friendly stadium assistant" |
| **Input data** | Zone densities, match state, weather | Zone densities, match state, weather + user question |
| **Output structure** | Structured alerts with severity | Conversational natural language |
| **Invocation frequency** | Every 45s (automated) | Per user message (on demand) |
| **Client component** | `useAlertStream` (invisible to user) | `FanChat` (user-facing chat UI) |
| **Stream destination** | `simulationStore.alerts[]` → `AlertFeed` | Local component state → chat bubble render |

**Why the same model**: Claude handles both structured output (alerts) and conversational responses well. Using one model eliminates managing separate API keys, authentication, and rate limits for different AI providers.

**Critical constraint**: Both routes must **never** expose the Anthropic API key to the client. All Claude calls happen server-side in Next.js route handlers.

---

## Component Hierarchy

```
<html>
  └── <body>
       └── ThemeProvider
            └── App
                 ├── TooltipProvider
                 │    └── AppLayout
                 │         ├── MagneticDock
                 │         │    ├── [existing] Overview | Simulate | Compare | Report
                 │         │    └── [NEW]     LiveOps | Fan View
                 │         │
                 │         ├── [existing] CinematicHero (activeTab === "overview")
                 │         │
                 │         └── [existing main content — activeTab !== "overview"]
                 │              │
                 │              ├── [NEW activeTab === "live-ops"]
                 │              │    ├── OpsDashboard (NEW wrapper)
                 │              │    │    ├── MatchBanner (NEW)
                 │              │    │    │    ├── score + phase + minute
                 │              │    │    │    └── phase transition indicator
                 │              │    │    ├── StadiumSelector (NEW)
                 │              │    │    │    └── dropdown over featured venues
                 │              │    │    ├── WeatherCard (NEW)
                 │              │    │    │    ├── current conditions
                 │              │    │    │    ├── density impact note
                 │              │    │    │    └── auto-refresh every 10min
                 │              │    │    ├── AlertFeed (NEW)
                 │              │    │    │    ├── scrollable alert list
                 │              │    │    │    ├── severity coloring (green/amber/red)
                 │              │    │    │    └── auto-scroll to new alerts
                 │              │    │    └── VisualizationWorkspace (existing)
                 │              │    │         └── [reads from simulationStore for live data]
                 │              │    └── [SSR route: /live-ops]
                 │              │
                 │              └── [NEW activeTab === "fan-view" — route: /fan]
                 │                   ├── FanChat (NEW)
                 │                   │    ├── chat message list
                 │                   │    ├── quick question chips
                 │                   │    ├── streaming response display
                 │                   │    └── zone context indicator
                 │                   └── [compact stadium map/status]
                 │
                 └── [NEW — exists as separate Next.js route: /fan]
```

**Key design decision**: The `/fan` route is implemented as a Next.js App Router page (`src/app/fan/page.tsx`) with a layout focused on the fan experience. This allows a clean URL separation while sharing the same `simulationStore` and server routes. The ops dashboard stays at the root `/`.

---

## New vs Modified Files

### New Files to Create

```
src/
├── app/
│   ├── api/
│   │   ├── match/
│   │   │   └── route.ts           # GET: proxy worldcup26.ir with 25s cache
│   │   ├── weather/
│   │   │   └── route.ts           # GET: proxy OpenWeatherMap with 10min cache
│   │   ├── ai-alerts/
│   │   │   └── route.ts           # POST: Claude ops alert streaming (SSE)
│   │   └── fan-chat/
│   │       └── route.ts           # POST: Claude fan chat streaming (SSE)
│   ├── fan/
│   │   ├── layout.tsx             # Fan-specific layout (minimal nav, no dock)
│   │   └── page.tsx               # Fan chat UI page
│   └── live-ops/
│       └── page.tsx               # (optional) dedicated ops route
├── hooks/
│   ├── useSimulationStore.ts      # NEW Zustand store — live SSOT
│   ├── useMatchPoller.ts          # Polls /api/match every 30s
│   ├── useAlertStream.ts          # POST zone data → SSE → alerts
│   └── useWeather.ts              # Fetch weather every 10min
├── simulation/
│   └── live/
│       ├── applyMatchEventDelta.ts # Match event → zone density adjustments
│       ├── buildAlertSystemPrompt.ts  # Ops persona system prompt
│       ├── buildAlertUserPrompt.ts    # Zone data as context for Claude
│       └── cache.ts               # Server-side cache helpers
├── components/
│   └── live/
│       ├── OpsDashboard.tsx        # Live ops layout wrapper
│       ├── MatchBanner.tsx         # Score + phase display
│       ├── StadiumSelector.tsx     # Stadium dropdown
│       ├── WeatherCard.tsx         # Weather conditions + impact
│       ├── AlertFeed.tsx           # Scrolling alert list
│       └── FanChat.tsx             # Chat UI with quick questions
└── types/
    └── live.ts                    # Shared types: MatchState, WeatherState, Alert, ZoneDensity
```

### Existing Files to Modify

| File | Change | Reason |
|------|--------|--------|
| `Dockerfile` | Replace Vite+Nginx with `next build`+`next start` | Server runtime needed for API routes |
| `.env.example` | Add `ANTHROPIC_API_KEY`, `OWM_API_KEY`, `NEXT_PUBLIC_*` | New server-side secrets |
| `nginx.conf` | Remove or keep as fallback | No longer the primary entrypoint |
| `next.config.mjs` | Add env var passthrough config | Ensure server-side vars reach route handlers |
| `src/components/layout/MagneticDock.tsx` | Add "Live Ops" and "Fan View" tabs | Navigation to new features |
| `src/App.tsx` or `src/app/layout.tsx` | Add live hooks initialization | Start polling when entering live mode |
| `package.json` | Scripts — keep both `build` (Vite) and `build:next` | Vite build still useful for v1.0 compat |

### Intentionally Unchanged

| File | Why |
|------|-----|
| `src/simulation/core/*` | Simulation engine is pure and correct — no changes needed |
| `src/simulation/contracts/*` | Input/output schemas are stable |
| `src/reporting/*` | Gemini risk reporting is a separate workflow |
| `src/comparison/*` | Comparison workflow is orthogonal to live features |
| `src/visualization/*` | D3 charts render from the same `SimulationOutput` format |
| `src/components/config/*` | Scenario configuration is unchanged |

---

## Data Flow: Complete Request Walkthroughs

### Flow 1: Match Polling → Zone Density Update

```
[Browser]                          [Next.js Server]               [worldcup26.ir]
    │                                    │                             │
    │  GET /api/match?stadium=venue1     │                             │
    ├───────────────────────────────────►│                             │
    │                                    │  Check cache (25s TTL)     │
    │                                    │  ├── HIT → return cached   │
    │                                    │  └── MISS →                │
    │                                    │       GET /api/v1/match     │
    │                                    ├───────────────────────────►│
    │                                    │◄───────────────────────────┤
    │                                    │       JSON response         │
    │  { homeScore, awayScore, phase,    │                             │
    │    minute, events[] }              │                             │
    │◄───────────────────────────────────┤                             │
    │                                    │                             │
    │  useMatchPoller detects phase      │                             │
    │  transition via diff from last     │                             │
    │  poll result                       │                             │
    │       │                            │                             │
    │       ▼                            │                             │
    │  simulationStore.applyMatchEventDelta(event)                      │
    │       │                            │                             │
    │       ▼                            │                             │
    │  Zone densities updated             │                             │
    │  MatchBanner re-renders            │                             │
```

### Flow 2: AI Alert Generation (Every 45s)

```
[Browser]                          [Next.js Server]               [Claude API]
    │                                    │                             │
    │  useAlertStream reads              │                             │
    │  simulationStore.zones +           │                             │
    │  simulationStore.matchState        │                             │
    │       │                            │                             │
    │       ▼                            │                             │
    │  POST /api/ai-alerts               │                             │
    │  { zones: [...], match: {...},     │                             │
    │    weather: {...} }                │                             │
    ├───────────────────────────────────►│                             │
    │                                    │  Build system prompt        │
    │                                    │  (ops analyst persona)      │
    │                                    │                             │
    │                                    │  POST Claude API (stream)   │
    │                                    ├───────────────────────────►│
    │                                    │◄── SSE text delta stream──┤
    │◄── SSE: data: {"text":"..."} ──────┤                             │
    │◄── SSE: data: {"text":"..."} ──────┤                             │
    │◄── SSE: data: [DONE] ──────────────┤                             │
    │       │                            │                             │
    │       ▼                            │                             │
    │  UseAlertStream accumulates text   │                             │
    │       │                            │                             │
    │       ▼                            │                             │
    │  Parses complete alert JSON        │                             │
    │       │                            │                             │
    │       ▼                            │                             │
    │  simulationStore.addAlert(alert)   │                             │
    │       │                            │                             │
    │       ▼                            │                             │
    │  AlertFeed re-renders              │                             │
    │  with new alert + severity color   │                             │
```

### Flow 3: Fan Chat Question

```
[Browser]                          [Next.js Server]               [Claude API]
    │                                    │                             │
    │  User types: "Where's the best     │                             │
    │  gate to leave section North?"     │                             │
    │       │                            │                             │
    │       ▼                            │                             │
    │  FanChat reads                     │                             │
    │  simulationStore.zones +           │                             │
    │  simulationStore.matchState        │                             │
    │       │                            │                             │
    │       ▼                            │                             │
    │  POST /api/fan-chat                │                             │
    │  { question: "...",                │                             │
    │    zones: [...],                   │                             │
    │    match: {...} }                  │                             │
    ├───────────────────────────────────►│                             │
    │                                    │  Build system prompt        │
    │                                    │  (fan assistant persona)    │
    │                                    │  + zone context grounding   │
    │                                    │                             │
    │                                    │  POST Claude API (stream)   │
    │                                    ├───────────────────────────►│
    │                                    │◄── SSE text delta stream──┤
    │◄── SSE: data: {"text":"..."} ──────┤                             │
    │◄── SSE: data: {"text":"..."} ──────┤                             │
    │◄── SSE: data: [DONE] ──────────────┤                             │
    │       │                            │                             │
    │       ▼                            │                             │
    │  FanChat appends to message list   │                             │
    │  with typing animation             │                             │
```

---

## Server Caching Strategy

| Route | Cache Duration | Strategy | Why |
|-------|---------------|----------|-----|
| `/api/match` | 25s | In-memory `Map<stadiumId, {data, timestamp}>` | Match data changes at most every 30s (our own poll interval). Prevents hammering worldcup26.ir |
| `/api/weather` | 10min | Same pattern | Weather changes slowly. OpenWeatherMap free tier has strict rate limits (60/min) |
| `/api/ai-alerts` | None | No cache | Each alert is unique — zone data changes each interval |
| `/api/fan-chat` | None | No cache | Each question is unique |

### Server Cache Implementation (lightweight, no Redis needed)

```typescript
// src/simulation/live/cache.ts — NEW

const cache = new Map<string, { data: unknown; expiresAt: number }>()

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCache(key: string, data: unknown, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
  // Auto-evict old entries if cache grows large
  if (cache.size > 100) {
    const now = Date.now()
    for (const [k, v] of cache) {
      if (now > v.expiresAt) cache.delete(k)
    }
  }
}
```

---

## Build Order (Dependency-Aware)

The phase ordering should respect these dependencies:

```
[DEP 1] Server runtime switch
  (Next.js App Router running, Dockerfile updated, env vars configured)
     │
     ▼
[DEP 2] simulationStore
  (Store exists with empty state. All hooks and components depend on it)
     │
     ├──────────────────────────┐
     ▼                          ▼
[DEP 3a] /api/match route      [DEP 3b] /api/weather route
  + useMatchPoller hook           + useWeather hook
  + MatchBanner component         + WeatherCard component
     │
     ▼
[DEP 4] applyMatchEventDelta
  (Match events → zone density mutations.
   Requires match polling to be working first)
     │
     ▼
[DEP 5] /api/ai-alerts route
  + useAlertStream hook
  + AlertFeed component
  (Requires zone data flowing from step 4)
     │
     ▼
[DEP 6] /api/fan-chat route
  + FanChat component
  + /fan page route
  (Requires zone data + match state, no alert dependency)
     │
     ▼
[DEP 7] OpsDashboard layout
  + StadiumSelector
  + Wiring all components into MagneticDock
  + Integration testing
     │
     ▼
[DEP 8] Demo mode + polish
  (Canned match sequence, error states, loading skeletons,
   deployment config)
```

### Build Order Rationale

1. **Switch to Next.js server first** — Everything depends on server routes existing. This is the foundation. Without it, nothing works.
2. **simulationStore second** — All hooks and components depend on the store shape. It's empty initially but the contract must exist.
3. **Match and weather in parallel** — These are independent of each other. Both are simple GET-proxy-cache patterns. MatchBanner and WeatherCard can be built alongside their routes.
4. **Match deltas fourth** — `applyMatchEventDelta` transforms polled match events into zone mutations, which is the core "live" feature. Must have working match data to test.
5. **AI alerts fifth** — Needs zone data flowing from match deltas. The alert system reads current zone state. Testing without live zone data is pointless.
6. **Fan chat sixth** — Needs zone data + match state but doesn't need alerts. Parallelizable with step 5 if resources allow.
7. **Integration wiring seventh** — Connect tabs, navigation, wire everything together. Pure integration work.
8. **Demo polish last** — Canned match sequences, error handling, loading states. Only makes sense once the actual features work.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **1-10 stadiums** (hackathon) | In-memory server cache is fine. Single Next.js instance handles all. Claude API calls are the bottleneck at ~3s each. |
| **10-100 concurrent ops users** | Move cache to Redis (Upstash). Consider deduplicating match/weather fetches per stadium. SSE connections scale well (each is just a kept-alive HTTP response). |
| **1000+ concurrent fan users** | Fan chat becomes the bottleneck (each message → Claude call). Add rate limiting per IP/user. Consider caching common fan questions. May need fan-icon per route. |
| **Production 100k+ fans** | Split ops and fan into separate deployments. Ops: low-volume, high-stakes, low latency. Fan: high-volume, latency-tolerant, needs aggressive caching. Fan chat could use a cheaper/faster model for simple questions. |

### First Bottleneck: Claude API Rate Limits
- Claude has tiered rate limits. The 45s alert interval for 10 stadiums means one Claude call every 4.5s.
- Mitigation: Queue alerts per stadium, stagger intervals, implement circuit breaker when hitting 429s.

### Second Bottleneck: SSE Connection Count
- Each ops dashboard keeps an SSE connection open per active alert stream.
- Next.js can handle thousands of concurrent connections, but each holds memory for the stream buffer.
- Mitigation: Close stale connections, implement connection health checks.

---

## Anti-Patterns

### Anti-Pattern 1: Polling match data from the browser directly
**What people do:** `fetch('https://worldcup26.ir/api/match')` from the React component.
**Why it's wrong:** CORS issues, API key exposure, no caching control, browser tab visibility means wasted requests when user isn't looking.
**Do this instead:** Server-side proxy route with caching. The browser never talks to worldcup26.ir directly.

### Anti-Pattern 2: Re-running the full simulation engine on every match event
**What people do:** Call `StadiumSim.run(input)` every time a goal is scored to get new zone densities.
**Why it's wrong:** The simulation engine is designed for pre-event planning — it processes all phases from scratch. Running it on every match event is O(n*m) per event and ignores current occupancy state.
**Do this instead:** Use `applyMatchEventDelta` to incrementally adjust zone densities. This is O(k) where k is the number of zones affected by the event.

### Anti-Pattern 3: Mixing persisted config state with ephemeral live state in one store
**What people do:** Adding `matchState`, `weatherState`, and `alerts` to the existing `useScenarioStore`.
**Why it's wrong:** `useScenarioStore` is persisted to localStorage. Live match state should never be persisted (it's stale by the time you read it back). The store also serves a different purpose (scenario configuration).
**Do this instead:** Keep `simulationStore` as a separate, non-persisted store. It initializes from `useScenarioStore`'s zone definitions on mount but manages all live state independently.

### Anti-Pattern 4: Using EventSource for POST-initiated streaming
**What people do:** Trying to use `new EventSource('/api/ai-alerts')` to receive alerts.
**Why it's wrong:** EventSource only supports GET. The AI alerts endpoint needs to POST zone data to the server first. You can't send a request body with EventSource.
**Do this instead:** Use `fetch()` + response body `ReadableStream` reader. Parse the text/event-stream format manually. The server returns an SSE-formatted response even though the request was POST.

### Anti-Pattern 5: Tightly coupling the simulated zone model to live match events
**What people do:** Making the simulation engine stateful and having it listen for match events.
**Why it's wrong:** The engine is a pure function (`input → output`). Making it stateful breaks its deterministic guarantees and makes testing harder.
**Do this instead:** Keep `StadiumSim` stateless. The `simulationStore` holds mutable live state. `applyMatchEventDelta` is a pure function that transforms current state given an event — it lives alongside but separate from the engine.

---

## Integration Points

### External Services

| Service | Integration Pattern | Route | Auth Method | Notes |
|---------|---------------------|-------|-------------|-------|
| worldcup26.ir | GET + server cache (25s TTL) | `/api/match` | None (public API) | No API key needed. Cache prevents rate limiting. |
| OpenWeatherMap | GET + server cache (10min TTL) | `/api/weather` | API key in `OWM_API_KEY` | Free tier: 60 calls/min. 10min cache keeps us well under. |
| Claude (Anthropic) | POST + SSE streaming | `/api/ai-alerts`, `/api/fan-chat` | API key in `ANTHROPIC_API_KEY` | Streaming reduces perceived latency. Cost: ~$0.015 per alert, ~$0.003 per chat message. |
| Gemini (existing) | POST + JSON response | Browser direct | VITE_GEMINI_API_KEY | Unchanged from v1.0. Used for risk report generation only. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `useMatchPoller` ↔ `simulationStore` | `applyMatchEventDelta(action)` | Hook calls store action, store handles state mutation |
| `useAlertStream` ↔ `simulationStore` | `getState().zones + addAlert()` | Hook reads zones, writes alerts. Store is the hub. |
| `FanChat` ↔ `simulationStore` | `getState().zones + getState().matchState` | Read-only from component. Store is the context provider. |
| `simulationStore` ↔ `useScenarioStore` | Initialize from `currentInput` on first mount | One-time read at live mode entry. No ongoing sync. |
| `useWeather` ↔ `simulationStore` | `updateWeather(action)` | Hook calls store action |
| `/api/ai-alerts` handler ↔ `simulationStore` | None (server-side) | Route handler receives zone data in request body — no direct store access needed |

---

## Project Structure (v2.0)

```
src/
├── app/                                    # Next.js App Router
│   ├── globals.css
│   ├── layout.tsx                          # Root layout (shared shell)
│   ├── page.tsx                            # Existing hero page (or ops dashboard root)
│   ├── live-ops/
│   │   └── page.tsx                        # Ops dashboard page (NEW)
│   ├── fan/
│   │   ├── layout.tsx                      # Fan-specific layout (NEW)
│   │   └── page.tsx                        # Fan chat page (NEW)
│   └── api/
│       ├── match/
│       │   └── route.ts                    # worldcup26.ir proxy (NEW)
│       ├── weather/
│       │   └── route.ts                    # OWM proxy (NEW)
│       ├── ai-alerts/
│       │   └── route.ts                    # Claude ops SSE stream (NEW)
│       └── fan-chat/
│           └── route.ts                    # Claude fan SSE stream (NEW)
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx                   # Modified: add live-ops/fan tabs
│   │   ├── CinematicHero.tsx               # Unchanged
│   │   └── MagneticDock.tsx                # Modified: add new tabs
│   ├── live/                               # NEW: Live ops components
│   │   ├── OpsDashboard.tsx
│   │   ├── MatchBanner.tsx
│   │   ├── StadiumSelector.tsx
│   │   ├── WeatherCard.tsx
│   │   ├── AlertFeed.tsx
│   │   └── FanChat.tsx
│   ├── ...existing component folders
│
├── hooks/
│   ├── useSimulationStore.ts               # NEW: Live SSOT Zustand store
│   ├── useMatchPoller.ts                    # NEW: Match polling + delta
│   ├── useAlertStream.ts                    # NEW: SSE alert streaming
│   ├── useWeather.ts                        # NEW: Weather polling
│   └── ...existing stores unchanged
│
├── simulation/
│   ├── core/                                # Unchanged
│   │   ├── simulateDeterministic.ts
│   │   ├── enginePhases.ts
│   │   ├── invariants.ts
│   │   ├── throughput.ts
│   │   └── severity.ts
│   ├── adapters/
│   │   └── StadiumSim.ts                   # Unchanged
│   ├── contracts/
│   │   ├── input.schema.ts                 # Unchanged
│   │   └── output.schema.ts                # Unchanged
│   ├── presets.ts                          # Unchanged
│   └── live/                                # NEW: Live simulation logic
│       ├── applyMatchEventDelta.ts
│       ├── buildAlertSystemPrompt.ts
│       ├── buildAlertUserPrompt.ts
│       └── cache.ts
│
├── types/
│   └── live.ts                              # NEW: Shared live types
│
└── ...unchanged (reporting, comparison, visualization, config, ui)
```

### Structure Rationale

- **`app/` routes**: Next.js App Router convention. File-system routing means `/fan` routes automatically become `/fan` URL. API routes follow the same pattern.
- **`components/live/`**: Collocation of all new live-ops components. Single import source for the ops dashboard. Separates concerns from existing pre-event components.
- **`hooks/`**: All Zustand stores and data-fetching hooks in one place. `useSimulationStore` is the new central hub. Existing stores unchanged.
- **`simulation/live/`**: New live-mode logic separate from the pure deterministic engine. Prevents cross-contamination between pre-event and live concerns. `applyMatchEventDelta` is the bridge.
- **`types/live.ts`**: Shared TypeScript types for `MatchState`, `WeatherState`, `Alert`, `ZoneDensity`. Used by hooks, store, components, and routes.

---

## Architectural Patterns

### Pattern 1: Store-as-SSOT with Selective Subscriptions

**What:** Zustand store holds all live state. Components subscribe to only the slices they need. Hooks call store actions to mutate state.

```typescript
// simulationStore — central hub
export const useSimulationStore = create<SimulationState>()((set, get) => ({
  // State slices
  zones: [],
  matchState: null,
  weatherState: null,
  alerts: [],

  // Actions — called by hooks
  applyMatchEventDelta: (event: MatchEvent) => {
    const adjustments = computeMatchDeltas(get().zones, event)
    set((state) => ({
      zones: applyAdjustments(state.zones, adjustments),
      matchState: {
        ...state.matchState,
        ...deriveMatchStateFromEvent(state.matchState, event),
      },
    }))
  },

  addAlert: (alert: Alert) =>
    set((state) => ({ alerts: [...state.alerts, alert] })),

  updateWeather: (weather: WeatherState) =>
    set({ weatherState: weather }),

  updateMatch: (match: Partial<MatchState>) =>
    set((state) => ({
      matchState: state.matchState
        ? { ...state.matchState, ...match }
        : match as MatchState,
    })),
}))

// Component subscribes to only its slice
function MatchBanner() {
  const matchState = useSimulationStore((s) => s.matchState)
  // Re-renders only when matchState changes
}

function AlertFeed() {
  const alerts = useSimulationStore((s) => s.alerts)
  // Re-renders only when alerts array changes
}
```

**Trade-offs:** + Fine-grained re-renders, + Single mutation path, - Store can become large. Mitigated by keeping only live state (not config) in this store.

### Pattern 2: Server-Side Proxy with Decorator Cache

**What:** Next.js route handlers proxy third-party APIs. A lightweight in-memory cache decorates the fetch to enforce TTL without external infrastructure.

```typescript
// src/app/api/match/route.ts
import { getCached, setCache } from '@/simulation/live/cache'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stadium = searchParams.get('stadium') ?? 'default'

  const cached = getCached<MatchResponse>(`match:${stadium}`)
  if (cached) {
    return Response.json(cached)
  }

  const response = await fetch(`https://worldcup26.ir/api/v1/match/${stadium}`)
  if (!response.ok) {
    return Response.json({ error: 'Match feed unavailable' }, { status: 502 })
  }

  const data = await response.json()
  setCache(`match:${stadium}`, data, 25_000) // 25s TTL
  return Response.json(data)
}
```

**Trade-offs:** + Simple, no Redis dependency, + Works for hackathon scale, - Cache lost on server restart (acceptable for single-instance deployment).

### Pattern 3: Fetch-Based SSE Consumer (No EventSource)

**What:** Since we POST data then receive SSE, we can't use `EventSource`. Instead, use `fetch()` with the response body's `ReadableStream` and manually parse SSE framing (`data: ...\n\n`).

```typescript
async function consumeSSE<T>(
  url: string,
  body: unknown,
  onChunk: (data: T) => void,
  onDone: () => void,
  onError: (err: Error) => void,
): Promise<AbortController> {
  const controller = new AbortController()

  ;(async () => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        onError(new Error(`SSE error: ${response.status}`))
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const messages = buffer.split('\n\n')
        buffer = messages.pop() ?? ''

        for (const msg of messages) {
          for (const line of msg.split('\n')) {
            if (line.startsWith('data: ')) {
              const payload = line.slice(6).trim()
              if (payload === '[DONE]') { onDone(); return }
              try { onChunk(JSON.parse(payload)) }
              catch { /* skip malformed chunk */ }
            }
          }
        }
      }
      onDone()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      onError(err instanceof Error ? err : new Error(String(err)))
    }
  })()

  return controller // caller can abort
}
```

**Trade-offs:** + Works with POST, + Full control over parsing, + AbortController for cancellation, - More boilerplate than EventSource (but EventSource wouldn't work here).

---

## Pattern: Dual-Persona AI via System Prompt

The same Claude instance serves both ops alerts and fan chat. The only differences are the system prompt and the input schema.

```typescript
// simulation/live/buildAlertSystemPrompt.ts
export function buildAlertSystemPrompt(): string {
  return `You are a stadium safety analyst for FIFA World Cup 2026.
Your job is to analyze real-time zone density data and match context,
then output structured safety alerts.

RULES:
- Output alerts as individual JSON objects, one per line
- Each alert MUST have: severity (nominal|warning|critical), zoneId or null, title, message
- CRITICAL alerts mean density > 90% — immediate action required
- WARNING alerts mean density 70-90% — monitor closely
- NOMINAL alerts mean density < 70% — routine observation
- Consider match phase: goals cause surges, halftime causes cross-flow, full-time causes exodus
- Consider weather: rain reduces throughput, heat increases medical risk
- Never make up zone IDs — only reference zones in the provided data`
}

// simulation/live/buildFanPrompt.ts
export function buildFanSystemPrompt(): string {
  return `You are a friendly stadium assistant for FIFA World Cup 2026.
Your job is to answer fan questions about stadium navigation, using
the current zone density data and match state.

RULES:
- Answer conversationally and helpfully
- Use zone density data to suggest less crowded routes
- Never make up zone IDs — only reference provided zones
- Keep responses concise (2-3 sentences preferred)
- If you don't know, say you don't know — don't guess`
}
```

---

## Sources

- **Next.js App Router route handlers**: `context7` — `/vercel/next.js` — Route Handlers documentation
- **Zustand v5**: Official docs at `https://zustand.docs.pmnd.rs/` — `create`, `subscribe`, `getState()`
- **SSE with ReadableStream**: MDN `ReadableStream`, `TextDecoder`, stream parsing patterns
- **Claude API streaming**: Anthropic API docs — `stream: true` parameter, SSE event format
- **World Cup 2026 API**: `worldcup26.ir` — public match data endpoint
- **OpenWeatherMap**: API docs — free tier (60 calls/min, 5 day forecast)
- **Existing v1.0 codebase analysis**: Source code inspection of `src/simulation/`, `src/hooks/`, `src/app/`, `Dockerfile`, `nginx.conf`

---

*Architecture research for: Smart Stadium Operations v2.0 — Live Data Integration*
*Researched: 2026-07-13*

# Stack Research — v2.0 Smart Stadium Additions

**Domain:** Live match coupling, AI alert SSE, fan chatbot, weather integration
**Researched:** 2026-07-13
**Confidence:** HIGH

> **Scope:** Additions to the existing React + Vite + Tailwind + D3 + Gemini + Cloud Run stack. All existing technologies remain; this document covers only **new dependencies and architectural changes** needed for real-time match polling, Claude SSE streaming, fan chat, and weather integration.

## Recommended Stack — Additions for v2.0

### Server Runtime (New — replaces Nginx)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Express** | ^4.21.2 | Minimal HTTP server for static file serving + API proxy layer | Replaces Nginx to serve SPA assets AND expose Claude SSE proxy from one process. Zero-config static serving via `express.static`, straightforward SSE via `res.write`. Cloud Run proven. |
| **Node.js** | >=20 LTS | Runtime for Express server on Cloud Run | Required by `@anthropic-ai/sdk` (Node.js 20 LTS+). Cloud Run supports 20+ natively. |

### Core APIs

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **@anthropic-ai/sdk** | ^0.111.0 | Claude API client for ops alerts + fan chat | Official Anthropic SDK. Supports `messages.stream()` returning `MessageStream` with `on('text')`, `on('message')`, `on('error')` events. Auto-retry, proper typing. Web-streams based (no Node-specific deps). **Server-side only.** |
| **react-router-dom** | ^7.18.1 | Client-side routing for `/` (ops) and `/fan` routes | React 19 compatible. Library mode with `createBrowserRouter` and `RouterProvider` is ideal for Vite SPA. Lazy route components for code-splitting ops vs fan views. |
| **Zustand** | ^5.0.12 | Central simulation state store | Already installed. New store slices needed for match state, alerts, weather. No upgrade needed. Use `subscribe` for polling side-effects. |

### Data Access Patterns (No New Libraries — Native APIs)

| Component | Approach | Why |
|-----------|----------|-----|
| **SSE consumption** | Native `EventSource` API | Browsers have built-in SSE client. Reconnect behavior, `onmessage`, `onerror` — all native. No polyfill needed (Chrome, Firefox, Safari all support). |
| **SSE server push** | `res.writeHead(200, { 'Content-Type': 'text/event-stream' })` | Express `res.write()` is sufficient for `data:` frames. No SSE library needed on the server either. |
| **Match polling** | Native `fetch` + `setInterval` in React hook | 30s interval is trivial. Custom `useMatchPoller` hook manages lifecycle. No TanStack Query overhead. |
| **Weather fetch** | Native `fetch` | Single endpoint call. Abstraction is a 3-line wrapper. No OWM client lib needed. |
| **Streaming to SSE** | `ReadableStream` piping | Anthropic SDK returns Web `ReadableStream`. Pipe chunks into SSE frames. |

### Environment Variables (New)

| Variable | Purpose | Where Set |
|----------|---------|-----------|
| `ANTHROPIC_API_KEY` | Claude API authentication | Cloud Run env vars, CI secrets, `.env` (dev) |
| `OWM_API_KEY` | OpenWeatherMap free tier auth | Cloud Run env vars, `.env` (dev) |
| `VITE_OWM_KEY` | OWM key injected into client build | Build-time env var (same pattern as existing Gemini key) |

### Deployment Change

| Aspect | v1.0 (Existing) | v2.0 (New) |
|--------|-----------------|------------|
| **Container base** | `nginx:alpine` | `node:20-slim` (or `gcr.io/distroless/nodejs20`) |
| **Entrypoint** | Nginx serves `/usr/share/nginx/html` | `node server.js` serves static files + proxies `/api/*` |
| **Cloud Run port** | 80 (Nginx default) | `process.env.PORT` (Cloud Run injects this) |
| **Startup command** | Nginx auto | `CMD ["node", "server.js"]` |
| **Dev proxy** | None needed | Vite `server.proxy` config: `"/api" → "http://localhost:3001"` |

## Installation

```bash
# New dependencies
npm install @anthropic-ai/sdk@^0.111.0
npm install express@^4.21.2
npm install react-router-dom@^7.18.1

# Dev dependencies (for types)
npm install -D @types/express@^5.0.0
npm install -D @types/node@^22.0.0

# Zustand is already installed at ^5.0.12 — no upgrade needed
# Verify:
npm ls zustand
```

### Dockerfile Change

```dockerfile
# v2.0 — Replace nginx:alpine with Node.js server
FROM node:20-slim AS runner
WORKDIR /app

COPY server.js package.json ./
RUN npm install --production

COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
```

## Architecture Overview

```
Browser                         Express (Cloud Run)              External APIs
──────                          ───────────────────              ─────────────
                                                                    ┌──────────────┐
[SPA static assets] ◄─── serve ──── express.static('./dist')        │ worldcup26.ir │
                                    (no proxy needed — no key)  ──► │  /get/games   │
                                                                    └──────────────┘
[useMatchPoller]      ─── fetch ──► /api/proxy/games ──── proxy ──► (CORS-free)
  (30s interval)       ◄── JSON ────                                  (no key needed)

[useAlertStream]      ─── GET ────► /api/claude/stream ────────────► Anthropic API
  (EventSource)        ◄── SSE ────  • res.write('data: ...\n\n')    messages.stream()
                                       • Pipe ReadableStream chunks    on('text') → frame
                                       • AbortController cleanup       on('error') → close

[useWeather]          ─── GET ────► /api/proxy/weather ── proxy ──► OpenWeatherMap
  (onMount, 5min)     ◄── JSON ────  • Append appid from env           /data/2.5/weather
                                       • Strip to relevant fields

[FanChat]            ─── POST ───► /api/claude/chat ───────────────► Anthropic API
  (useEffect)         ◄── SSE ────  • session context + zone data      messages.stream()
                                       • System prompt for fan role
```

## Key Integration Points

### SSE Proxy Pattern (Core Architecture)

The most critical new component is the Claude SSE proxy. The Anthropic SDK **must run server-side** — `dangerouslyAllowBrowser` exists but exposing `ANTHROPIC_API_KEY` in client JS is unacceptable even for hackathons.

```typescript
// server.js — Simplified proxy
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get('/api/claude/stream', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: req.query.system_prompt || opsAlertSystemPrompt,
      messages: [{
        role: 'user',
        content: req.query.message || 'Analyze current zone densities',
      }],
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ type: 'text', delta: text })}\n\n`);
    });
    stream.on('message', (msg) => {
      res.write(`data: ${JSON.stringify({ type: 'done', content: msg.content })}\n\n`);
      res.end();
    });
    stream.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
      res.end();
    });

    req.on('close', () => stream.controller.abort());
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Proxy failure' })}\n\n`);
    res.end();
  }
});
```

### Client SSE Hook

```typescript
// useAlertStream.ts — No library needed, EventSource is built-in
import { useEffect, useRef } from 'react';
import { useSimulationStore } from './useSimulationStore';

export function useAlertStream() {
  const addAlert = useSimulationStore((s) => s.addAlert);
  const zoneData = useSimulationStore((s) => s.zoneDensities);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = `/api/claude/stream?message=${encodeURIComponent(
      JSON.stringify({ zones: zoneData })
    )}`;
    
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'text') { /* accumulate */ }
      if (data.type === 'done') {
        addAlert(data.content);
        es.close();
      }
      if (data.type === 'error') {
        console.error('Alert stream error:', data.error);
        es.close();
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects, but we log and potentially close
      if (es.readyState === EventSource.CLOSED) {
        console.warn('Alert stream closed');
      }
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [zoneData]);
}
```

### Zustand Store for Live State

```typescript
// useSimulationStore.ts — New store slice for live features
interface SimulationStore {
  // Existing fields (not re-documented here)
  ...existingState
  
  // New v2.0 fields
  matchState: MatchState | null;
  alerts: Alert[];
  weather: WeatherData | null;
  isLive: boolean;
  
  // New v2.0 actions
  setMatchState: (match: MatchState) => void;
  addAlert: (alert: Alert) => void;
  setWeather: (weather: WeatherData) => void;
  toggleLiveMode: () => void;
}
```

## What NOT to Add

| Avoid | Why Not | Instead Use |
|-------|---------|-------------|
| **Socket.IO** | SSE is sufficient for unidirectional server→client streaming (alerts). Socket.IO adds 20KB+ for bidirectional capability we don't need. EventSource is native, lighter, and auto-reconnects. | Native `EventSource` API |
| **TanStack React Query** | We have exactly 2 polling sources (match feed every 30s, weather every 5min) and 1 SSE stream. React Query's caching/mutation machinery is wasted. A custom hook with `setInterval` + `fetch` is ~15 lines and clearer. | Custom `useMatchPoller` + `useWeather` hooks |
| **Redux / Redux Toolkit** | Zustand is already chosen, installed, and working (3 stores exist). Adding Redux would duplicate state management for no benefit. The live state is a natural extension of the existing Zustand store. | Zustand (already in use) |
| **WebSocket** | Browsers don't need bidirectional persistent connections. SSE is simpler (HTTP-only, works through proxies, auto-reconnects) for the server→alert pattern. | Native `EventSource` |
| **OpenWeatherMap SDK/lib** | "OpenWeatherMap JS SDK" npm packages are community wrappers, often outdated, and add 0 value over `fetch`. The API is a single GET with query params. | Native `fetch` |
| **GraphQL** | Three independent data sources (match, weather, Claude) with no relational queries. REST endpoints for each are simpler and match the proxy architecture. | REST (`/api/proxy/*` + `/api/claude/*`) |
| **TanStack Query** | Duplicate. Already covered above but worth repeating — the polling/streaming pattern does not benefit from caching/invalidation machinery. | `useEffect` + `setInterval` |
| **Next.js App Router** | Existing app is a Vite SPA with React 19. Porting to Next.js would require rebuilding all visualization, simulation, and state code. The `/fan` route is easily handled by react-router-dom. Adding API routes (Next.js server) does not add value over Express proxy — we need a server anyway. | Vite SPA + Express proxy |
| **SSE polyfill** | `EventSource` is supported in all modern browsers (Chrome 6+, Firefox 6+, Safari 5+, Edge 79+). No polyfill needed for 2026 browsers. | Native `EventSource` |
| **Comlink / Web Workers for polling** | 30s `setInterval` with a simple JSON fetch is ~0.1ms CPU. Workers add complexity for zero benefit. The simulation engine is not running during polling. | Main thread `setInterval` |
| **Helmet / compression / body-parser (server)** | Express proxy needs: `express.static()` (built-in), `res.write()` for SSE, and `express.json()` (built-in in v4.16+). `compression` for the Vite-built static files is nice-to-have but not required for MVP. | Express built-in middleware |

## Server Setup — Minimum Viable

```javascript
// server.js — The entire backend for v2.0 (~80 lines)
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8080;

// Serve built SPA
app.use(express.static('dist'));

// Claude SSE endpoint
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
app.get('/api/claude/stream', /* SSE handler — see pattern above */);

// OWM proxy (optional — can be direct from client with injected key)
app.get('/api/proxy/weather', async (req, res) => {
  const { lat, lon } = req.query;
  const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OWM_API_KEY}&units=metric`;
  const owmRes = await fetch(owmUrl);
  const data = await owmRes.json();
  res.json({
    condition: data.weather[0].main,
    temp: data.main.temp,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    icon: data.weather[0].icon,
  });
});

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile('dist/index.html', { root: '.' });
});

app.listen(PORT, () => console.log(`Server on :${PORT}`));
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Express (static + proxy) | **Raw Node `http` + `fs`** | If you want zero dependencies beyond `@anthropic-ai/sdk`. Express saves ~20 lines of boilerplate for static serving, MIME types, error handling. |
| Server-side SDK (`@anthropic-ai/sdk`) | **Direct fetch to Anthropic REST API** | If you want to avoid the SDK dependency. You'd manually construct POST bodies and parse SSE from the API's raw response. SDK handles retries, auth headers, streaming parsing. |
| react-router-dom | **Client-side state-based tab switching** (current pattern) | If you only need ops view and don't build the `/fan` route. Tab-based switching doesn't support deep linking, browser back button, or separate route components. For a single-route app, react-router is overkill. |
| Express `static` | **Nginx + Node.js split deployment** | If you want to keep Nginx serving static files and run Node.js as a sidecar. More complex but allows independent scaling. Overkill for hackathon. |

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@anthropic-ai/sdk@^0.111.0` | Node.js >=20 LTS | Uses Web `ReadableStream` internally. Requires `fetch` global (available in Node 18+, built-in in Node 21+). Works on Cloud Run with Node 20. |
| `@anthropic-ai/sdk@^0.111.0` | Express `req`/`res` | SDK is fetch-based, not tied to Express. No Express integration issues. |
| `react-router-dom@^7.18.1` | React >=18 | Project already on React 19.2.5. Full compatibility. Use library mode (not framework mode). |
| `react-router-dom@^7.18.1` | Vite SPA | `createBrowserRouter` + `RouterProvider` works with Vite dev server. No SSR needed. |
| `zustand@^5.0.12` | React 19.2.5 | Already installed and working. v5 uses `useSyncExternalStore` internally. Compatible without wrappers. |
| `zustand@^5.0.12` | `immer` (optional) | Zustand v5 has optional immer middleware. Not needed unless deeply nested state updates. |
| Express v4.21.x | Cloud Run | Standard Cloud Run Node.js pattern. Use `process.env.PORT` for the listen port. |

## Open Questions

1. **worldcup26.ir CORS**: The API is publicly documented as open-access, but CORS headers were not verified during research. If CORS blocks browser requests, add a proxy pass-through on Express (`/api/proxy/games`). This adds ~5 lines and is non-blocking.
2. **Token requirements**: The API docs mention both "no key required for read access" AND "Bearer YOUR_JWT_TOKEN" in code examples. The free endpoints (`/get/games`, `/get/teams`, etc.) likely don't require auth for read, but verify during implementation.
3. **Claude model ID**: Use `claude-sonnet-4-20250514` (stable) for both ops alerts and fan chat during development. Switch to `claude-4-opus-20260514` for production if latency is acceptable. Verify current available models at release — Anthropic's model IDs change.

## Sources

- **Context7 `/anthropics/anthropic-sdk-typescript`** — SDK v0.111.0, `messages.stream()` API, `MessageStream` events, dangerouslyAllowBrowser warning, Node.js 20+ requirement
- **Context7 `/pmndrs/zustand`** — Zustand v5.0.14 (current), `subscribe` API for side-effects, async actions pattern
- **Context7 `/remix-run/react-router`** — v7.18.1, createBrowserRouter + RouterProvider, React 19 support, library vs framework mode
- **npm registry** — Version verification for all packages above
- **worldcup26.ir GitHub (rezarahiminia/worldcup2026)** — API endpoints: `/get/games`, `/get/teams`, `/get/groups`, `/get/stadiums`. Response format verified from live fetch.
- **APIScout (apiscout.dev/guides/openweathermap-free-tier-limits-2026)** — OpenWeatherMap free tier: 1,000 calls/day, 60/min limit, `/data/2.5/weather` endpoint
- **MDN EventSource API** — Native SSE consumption, auto-reconnect, event types, `close()` method
- **Existing codebase analysis** — Zustand stores (useScenarioStore.ts, useRiskReportStore.ts, useComparisonStore.ts) already installed and working. Vite SPA architecture confirmed.

---

*Stack research for: Crowd Dynamics v2.0 Smart Stadium Operations — New capabilities only*
*Researched: 2026-07-13*

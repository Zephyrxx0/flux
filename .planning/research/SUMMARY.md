# Project Research Summary

**Project:** Predictive Fan Flow Simulator → Smart Stadium Operations (v2.0)
**Domain:** Live GenAI-powered stadium operations — real-time match coupling, AI alert streaming, fan chatbot, weather integration
**Researched:** 2026-07-13
**Confidence:** HIGH

## Executive Summary

This upgrade transforms a pre-event crowd simulation planning tool (v1.0) into a live, dual-mode stadium operations system for FIFA World Cup 2026. The system polls worldcup26.ir for live match events, simulates crowd density deltas tied to game phases (goals, halftime, full-time), streams AI-generated safety alerts via SSE to ops operators, and simultaneously powers a fan-facing chatbot — all from a single simulation state. The core architectural bet is a **server-side proxy layer** that keeps all third-party API keys (Anthropic, OpenWeatherMap) out of the browser while enabling SSE streaming, and a **Zustand simulation store** as the single source of truth consumed by both ops and fan AI personas.

**The critical unresolved tension:** STACK.md recommends Express as a lightweight server alongside the existing Vite SPA, while ARCHITECTURE.md argues for Next.js App Router (already in `package.json`). Both enable server-side API routes and SSE; the trade-off is Express = minimal migration cost vs. Next.js = long-term architectural coherence. This must be resolved as a Phase 0 decision before any implementation begins.

**Key risks to mitigate:** (1) SSE streaming silently failing on Cloud Run due to proxy buffering/timeouts, (2) Claude API cost explosion from unbounded alert cycles and fan chat history, (3) Zustand store becoming a stale-closure/race-condition bottleneck as multiple hooks write to shared state, (4) worldcup26.ir API schema changing without notice. All four have well-documented mitigations from the pitfalls research.

## Key Findings

### Recommended Stack

The stack research (STACK.md) recommends a minimal server addition: **Express 4 + Node.js 20+** as a static file server + API proxy layer, replacing the Nginx-only deployment. Key new dependencies: `@anthropic-ai/sdk@^0.111.0` (Claude streaming), `react-router-dom@^7.18.1` (`/fan` route), and no new state library (Zustand v5 already installed, extend with new slices). The design philosophy is: use **native browser APIs** (EventSource, fetch) rather than new libraries — no Socket.IO, no TanStack Query, no OWM SDK.

**ARCHITECTURE.md disagrees** — it argues the existing codebase already has Next.js 16 in `package.json` and `src/app/` structure, making App Router the natural server choice with zero-config `/api/*` route handlers and no separate Express process. This is a first-class tension the roadmap must resolve.

**Core technologies:**
- **Express ^4.21.2** or **Next.js 16** (TBD): Server runtime for API proxy + SSE — replaces Nginx
- **@anthropic-ai/sdk ^0.111.0**: Claude API client for ops alerts + fan chat — server-side only, `messages.stream()` for SSE
- **react-router-dom ^7.18.1** (Express path) or **Next.js App Router** (Next.js path): `/fan` route separation
- **Zustand ^5.0.12** (already installed): New `simulationStore` slice for match/alerts/weather state
- **Native EventSource + fetch + ReadableStream**: Zero-dependency SSE pattern — no libraries needed
- **Node.js >=20 LTS**: Cloud Run runtime, required by Anthropic SDK

### Expected Features

Research covers 12 MVP features across 5 categories (LIVE, AIAL, FAN, WTHR, DEMO, INT) plus dual-mode AI considerations and a well-researched demo sequence.

**Must have (table stakes):**
- **LIVE-01**: 30s match polling from worldcup26.ir — required for everything downstream
- **LIVE-02**: Match phase → density deltas (goal +8%, halftime +40% concourse) — grounded in published crowd behavior research (FlowState, Camp Nou, UMiami concession studies)
- **LIVE-03**: Match banner (score, phase, minute) on ops dashboard — simplest live signal
- **AIAL-01**: Claude 45s zone analysis → SSE alert stream — the GenAI centerpiece
- **AIAL-02**: 3-tier severity classification (nominal/warning/critical) — industry standard
- **FAN-01**: `/fan` route with chatbot — fan-facing mode
- **FAN-02**: Chatbot grounded in live zone context — grounded, not generic
- **WTHR-01**: OpenWeatherMap integration — density adjustment model
- **WTHR-02**: Weather card on ops dashboard + density impact notes
- **DEMO-01**: Canned match event sequence — reliable demo path when live APIs fail

**Should have (competitive):**
- **AI alert trend direction + recommended actions** ("Zone A trending up 8%/min — recommend opening Gate D") — shifts from detection to decision support. Requires 2+ density snapshots for trend calculation. Defer to v2.1 unless prompt engineering proves straightforward.
- **Unified ops dashboard** combining match/weather/alerts/density — "single pane of glass"
- **Fan multi-turn conversation context** — session-level memory. Defer to v2.1.
- **Demo mode speed controls** (1x/2x/5x) — useful for presentations, defer to v2.1

**Defer (v3.0+):**
- CCTV/video analytics integration — contradicts no-backend architecture
- Multi-provider AI fallback (Claude→Gemini) — rule-based fallback is sufficient
- Full digital twin with particle physics — not needed for safety decisions
- Fan authentication/profiles — splits demo time from core features
- Push notifications — requires service worker/PWA infrastructure

### Architecture Approach

The target architecture introduces a **server runtime** (Express or Next.js) into what was a static Vite SPA. The server proxies 4 API routes: `/api/match` (worldcup26.ir, 25s cache), `/api/weather` (OpenWeatherMap, 10min cache), `/api/ai-alerts` (Claude ops SSE stream), `/api/fan-chat` (Claude fan SSE stream). Client-side, a new **simulationStore** (Zustand) becomes the live single source of truth for zone densities, match state, weather, and alerts. Three new hooks (`useMatchPoller`, `useAlertStream`, `useWeather`) feed data into the store. The existing v1 stores (useScenarioStore, useRiskReportStore, useComparisonStore) remain unchanged.

**Major components:**
1. **Live hooks** (`useMatchPoller`, `useAlertStream`, `useWeather`) — Data fetching, polling, SSE consumption. Each hook owns its lifecycle and writes to simulationStore.
2. **simulationStore** — Zustand store holding ephemeral live state (zones, matchState, alerts, weather). Separate from persisted v1 stores. Central hub consumed by both ops and fan components.
3. **API Route Handlers** — `/api/match` (cache-proxy), `/api/weather` (cache-proxy), `/api/ai-alerts` (Claude POST→SSE), `/api/fan-chat` (Claude POST→SSE). All server-side, never expose API keys to browser.
4. **applyMatchEventDelta** — Pure function mapping match events (goal, halftime, full-time) to calibrated zone density adjustments. Bridge between the live feed and the simulation. Does NOT re-run full simulation.
5. **Live components** — MatchBanner, WeatherCard, AlertFeed, FanChat, OpsDashboard, StadiumSelector. New components under `components/live/`.
6. **Server cache** — In-memory `Map<string, {data, timestamp}>` with TTL. No Redis. Simple, sufficient for hackathon scale.

### Critical Pitfalls

Top 5 from PITFALLS.md (all HIGH confidence, all sourced from real project post-mortems and official docs):

1. **SSE streaming dies silently on Cloud Run** — Next.js Route Handler timeouts (10-60s on serverless), nginx proxy buffering, and Node/Edge runtime mismatch all silently kill SSE. **Prevention:** Set `proxy_buffering off`, `proxy_read_timeout 600s` in nginx.conf; use Edge Runtime or explicit `force-dynamic`; send keep-alive pings every 15s. Test SSE on the deployed Cloud Run URL, not just localhost.
2. **API failures cascade to dead UI** — worldcup26.ir failure → match poller empty → no zone deltas → AI has stale data → alerts meaningless. **Prevention:** Decouple polling from rendering; stagger alert cycle (don't queue retries); implement circuit breaker (3 failures → 60s backoff + degraded banner); each external call wrapped in try/catch that writes error state instead of throwing.
3. **Claude API cost explosion** — 45s alert cycle + unbounded fan chat history = $15-30+ in a 30-minute demo. Aborted streams still bill. **Prevention:** Hard cap alert cycles (6 max in demo mode); truncate fan chat history to 10 messages; wire AbortController to `req.signal` so server stops generating on client disconnect; use pre-paid API key with $20 budget.
4. **Zustand store as single failure point** — Stale closures in polling hooks, race conditions between match/weather writes, full-store subscriptions causing all-component re-renders. **Prevention:** Split into sub-stores (sim/match/weather/alert/chat); use atomic selectors (never `useStore()` without selecting); use `getState()` for polling callbacks; immer middleware for immutable updates; timestamp every state write.
5. **Dual-mode AI context leaking** — Fan chatbot accidentally receiving ops system prompt or revealing internal data. **Prevention:** Separate API keys, separate Route Handlers, separate system prompt files; fan receives zone *summary* only (name + "busy" label), never raw density JSON or severity thresholds; add prompt injection input filter.

## Implications for Roadmap

Based on the dependency-aware build order from ARCHITECTURE.md, filtered through the critical pitfalls from PITFALLS.md and the phased delivery from FEATURES.md:

### Proposed Phase Structure

#### Phase 0: Foundation & Research Decision
**Rationale:** The Express vs. Next.js decision cannot be skipped — it determines the entire Phase 1 implementation. Must be resolved before any code is written. Also the right time to define store architecture before hooks are built.

**Delivers:** An architecture decision record (ADR) choosing Express vs Next.js. Zustand store splitting strategy (sub-stores for sim/match/weather/alert/chat vs. one store with slices). Type definitions in `src/types/live.ts`.

**Addresses:** Foundation for all features. Store architecture design pre-empts Pitfall 4 (store bloat/race conditions).

**Avoids:** Pitfall 4 (Zustand stale closures + bloat) — split stores before hooks exist.

**Activities:**
1. Audit actual codebase state — does `src/app/` use Next.js features or is it dead config? Are there existing route handlers? Test `npx next build` viability.
2. If Vite SPA+static build is real: choose Express (minimal migration) or commit to Next.js port (2-3 day migration cost).
3. Define store slicing strategy: `useSimulationStore` (zones), `useMatchStore`, `useWeatherStore`, `useAlertStore`, `useChatStore`.
4. Audit existing Dockerfile + start porting path for whichever server is chosen.
5. Create `src/types/live.ts` with shared interfaces.

**Research flag:** Needs deeper research — the Express vs Next.js decision requires reading the actual `src/app/` contents and `next.config.mjs` to determine how much migration work exists. The "Stack Decision" is a research-phase candidate (`/gsd-plan-phase --research-phase 0`).

---

#### Phase 1: Server Runtime + Match Polling
**Rationale:** The server must exist before any other feature works. Match polling is the simplest server route and the foundation for all downstream features (density deltas → alerts → fan context).

**Delivers:** Dockerfile updated to run server instead of static Nginx. Environment variables configured. `/api/match` route proxying worldcup26.ir with 25s cache. `useMatchPoller` hook with 30s interval. `simulationStore` initialized (empty). MatchBanner component rendering score/phase/minute. Zod schema validation of worldcup26.ir response.

**Addresses:** LIVE-01, LIVE-03, INT-01 (partial), INT-02, DEP-04
**Stack:** Server runtime (Express or Next.js), Zustand extension, react-router-dom or App Router
**Architecture:** API Route Handler, in-memory cache, store-as-SSOT

**Avoids:** Pitfall 2 (API failures cascade) — build error isolation FIRST. Pitfall 10 (undocumented API changes) — Zod validation at proxy layer. Pitfall 7 (GET caching) — use POST or `force-dynamic`.

**Activities:**
1. Implement server runtime (Dockerfile, entry point, static file serving)
2. `/api/match` route: fetch → validate Zod → cache → respond
3. `useSimulationStore` with zone state + match slice
4. `useMatchPoller` with 30s interval, lifecycle management, error isolation
5. MatchBanner component
6. Wire into MagneticDock / navigation

**Research flag:** Standard patterns. Match polling is a well-known design pattern (fetch + interval + cache). No deep research needed.

---

#### Phase 2: AI Alert Stream (Claude SSE)
**Rationale:** The GenAI centerpiece. Requires match polling to be delivering phase transitions (goals, halftime) so the alert stream has meaningful zone data to analyze. This is the highest-risk/complexity feature.

**Delivers:** `/api/ai-alerts` POST→SSE route handler (Claude). `useAlertStream` hook reading zone densities, POSTing to server, parsing SSE, writing alerts to store. `AlertFeed` component with severity coloring, auto-scroll. Severity classification thresholds configured. AbortController wired. System prompt for ops analyst persona.

**Addresses:** AIAL-01, AIAL-02
**Stack:** @anthropic-ai/sdk or direct fetch to Anthropic API
**Architecture:** SSE streaming pattern (fetch+ReadableStream, not EventSource), dual-mode AI separation

**Avoids:** Pitfall 1 (SSE dies on Cloud Run) — test on deployed URL, nginx config, keep-alive. Pitfall 3 (cost explosion) — cap alert cycles, AbortController. Pitfall 5 (context leaking) — separate route/API key from fan route.

**Critical dependency:** Must test SSE on Cloud Run before declaring this phase done. Curl the deployed SSE endpoint — verify incremental chunks arrive. If nginx config blocks it, fix before proceeding.

**Research flag:** Needs deeper research on exact nginx configuration for Cloud Run SSE streaming. Also verify current Claude model IDs (`claude-sonnet-4-20250514` may have been superseded). `/gsd-plan-phase --research-phase 2` recommended.

---

#### Phase 3: Fan Chatbot
**Rationale:** Independent of the alert stream but requires the same simulation store + match state. Lower risk than alerts since it's pull-based (fan asks) not push-based (SSE). Parallelizable with Phase 2 if resources allow.

**Delivers:** `/api/fan-chat` POST→SSE route handler with fan system prompt. FanChat component with chat UI, streaming response display, quick question chips. `/fan` route with fan-specific layout. Conversation history capped at 10 messages. Prompt injection input filter. Zone data sent as friendly summaries (section names, not density JSON).

**Addresses:** FAN-01, FAN-02
**Stack:** @anthropic-ai/sdk (or direct fetch), separate API key from ops alerts
**Architecture:** Dual-persona AI, fetch+ReadableStream SSE, route separation

**Avoids:** Pitfall 5 (context leaking) — separate API keys, separate routes, input filter. Pitfall 9 (partial token jank) — buffer 50ms/5 tokens before UI update, defer markdown rendering.

**Activities:**
1. Build fan system prompt (friendly assistant persona)
2. `/api/fan-chat` route handler
3. FanChat component with buffered streaming render
4. `/fan` route + layout
5. Conversation history limit + truncation
6. Prompt injection guard
7. Quick question chips (pre-written questions for demo)

**Research flag:** Standard patterns for chatbot UI. The streaming render buffering pattern is well-documented. No deep research needed on the chatbot itself, but the prompt injection guard pattern may need verification.

---

#### Phase 4: Weather Integration
**Rationale:** Lowest priority live feature. Adds realism and research-grounded density adjustments but is the most independent of the three live data sources. Reuses the same server-proxy-cache pattern as match polling.

**Delivers:** `/api/weather` route proxying OpenWeatherMap (Free Weather API, not One Call 3.0 — avoid card requirement). `useWeather` hook with 10min interval. WeatherCard component with conditions + density impact note. Weather→density adjustment factors (rain = egress +25%, heat >32°C = capacity -15%). Weather effects overlayed on planned density (not mutating base).

**Addresses:** WTHR-01, WTHR-02
**Stack:** OpenWeatherMap API (Free endpoint), fetch native
**Architecture:** Server proxy + cache pattern, weather as overlay modifier

**Avoids:** Pitfall 8 (Weather API card requirement) — use free `/data/2.5/weather` endpoint, verify with actual key before declaring done. Pitfall 7 (GET caching) — force-dynamic.

**Research flag:** Needs verification that the OpenWeatherMap Free API endpoint works with the team's API key. The `/data/2.5/weather` endpoint should not require a credit card, but verify this during Phase 4 execution. Low complexity.

---

#### Phase 5: Demo Mode + Integration Wiring
**Rationale:** Everything else must work before demo mode is meaningful. Canned events replay the same store mutations that live events trigger — requires the full pipeline.

**Delivers:** Canned match event sequence fixture (JSON, not code). Demo toggle UI with visual "DEMO MODE" indicator. `useDemoMode` hook that replays canned events on timer. Complete state reset on demo↔live toggle. OpsDashboard layout wiring all components into a single screen. Integration testing for the complete data flow (poll → store → AI → alert → render).

**Addresses:** DEMO-01, INT-01 (complete), LIVE-02, full ops dashboard
**Architecture:** All components wired through MagneticDock tabs, store as SSOT verified

**Avoids:** Pitfall 6 (demo/live state bleed) — `reset()` on toggle, separate store slices for demo data, visual indicator.

**Activities:**
1. Canned match sequence (JSON file with timed events covering full match lifecycle)
2. Demo mode hook + toggle UI
3. State reset on mode switch
4. OpsDashboard wrapper component
5. Integration wiring into MagneticDock
6. Integration smoke tests for each data flow
7. Cloud Run deployment config finalization

**Research flag:** Standard patterns for demo mode (JSON fixtures, timer-based replay, state reset). The demo sequence design from FEATURES.md is already well-researched (10 events, 3 severity levels, full lifecycle).

---

### Phase Ordering Rationale

- **Phase 0 first** because the Express vs. Next.js decision is a hard fork — getting it wrong means redoing Phase 1. Also the store architecture must be right before hooks are built.
- **Phase 1 before Phase 2-3** because the AI alert stream and fan chat both need the simulation store populated with zone data and match state. No match data = no AI analysis.
- **Phase 2 and Phase 3 are independent** of each other (both read from store, neither writes to the other). They could be parallelized with 2 developers, but the alert stream is higher risk (SSE on Cloud Run, cost management) and should get more time.
- **Phase 4 is lowest priority** because weather is the most independent feature and has the simplest integration. It can be deferred or even dropped if time is short without affecting the core story (match coupling + AI alerts + fan chat).
- **Phase 5 last** because demo mode replays the full pipeline — it only makes sense after all features work. Integration wiring is pure gluing.

### Research Flags

Phases needing deeper research during planning:
- **Phase 0:** Express vs. Next.js decision — must audit actual codebase state (`src/app/`, `next.config.mjs`, Vite config). The existing config may reveal Next.js is already fully configured (zero migration cost) or purely dead config (Express wins). This is a 30-minute audit, not a full research phase. Tag: `--research-phase 0`.
- **Phase 2:** SSE nginx configuration on Cloud Run — must verify `proxy_buffering off` and `proxy_read_timeout 600s` work with the deployment target. Also verify current Claude model ID. Tag: `--research-phase 2`.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Match polling is fetch + interval + cache. Well-documented pattern.
- **Phase 3:** Chatbot with SSE streaming. Standard pattern; the token buffering trick is well-documented.
- **Phase 4:** Weather API proxy. Single GET + cache. Trivial.
- **Phase 5:** Demo fixtures + wiring. Standard pattern.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Both Express and Next.js paths are well-supported with official docs. The tension is migration cost, not technical viability. Sources: Context7 for all libraries, npm registry, existing codebase. |
| Features | HIGH | Dual-mode AI validated by real systems (StadiumIQ uses 6 personas, St. Louis City SC Ace uses 20+ tools). Density multipliers grounded in published peer-reviewed research (FlowState, York University, Camp Nou studies). Demo sequence designed from successful hackathon patterns. |
| Architecture | HIGH | Store-as-SSOT pattern is proven (Zustand docs). SSE+fetch is standard (MDN, Cloude API docs). Server-proxy-cache is battle-tested. Build order is dependency-aware and covers all edge cases. |
| Pitfalls | HIGH | Every pitfall is sourced from either official documentation (Next.js, OpenWeatherMap, Claude API), real project post-mortems (SSE streaming failures, cost explosions), or published anti-pattern research (store bloat, prompt leakage). Recovery strategies documented for each. |

**Overall confidence:** HIGH

The research is comprehensive because it combines:
- **Official documentation** (Anthropic SDK, Zustand v5, Next.js Route Handlers, OpenWeatherMap, MDN SSE)
- **Real-world system analysis** (StadiumIQ, JARVIS, CrowdShield, CrowdCommand — all live GitHub repositories)
- **Peer-reviewed research** (York University evacuation studies, Camp Nou arrival modeling, stadium microclimate studies)
- **Hackathon-specific knowledge** (demo anti-patterns, cost management, SSE failure modes on serverless)

### Gaps to Address

- **Express vs. Next.js Decision:** The research couldn't determine which is right without reading the actual `src/app/` directory contents. The codebase may have Next.js already wired (zero migration cost) or only dead config files. This must be resolved in Phase 0.
- **Claude model ID currency:** Uses `claude-sonnet-4-20250514` based on research date (2026-07-13). Model IDs change. Verify at implementation time.
- **worldcup26.ir CORS and auth:** The API is documented as open-access but code examples show Bearer JWT tokens. The proxy approach handles both cases but the exact auth requirements should be verified during Phase 1.
- **OpenWeatherMap endpoint selection:** Research recommends the Free Weather API endpoint (`/data/2.5/weather`) to avoid card requirement, but the exact free tier behavior should be verified with the team's actual API key during Phase 4.
- **SSE configuration for Cloud Run:** The exact nginx config changes needed (proxy_buffering off, timeout settings) should be verified by reading the deployed Cloud Run documentation during Phase 2.

## Sources

### Primary (HIGH confidence)
- **Context7 `/anthropics/anthropic-sdk-typescript`** — SDK v0.111.0 streaming API, Node.js 20+ requirement, dangerouslyAllowBrowser warning
- **Context7 `/pmndrs/zustand`** — Store creation, subscribe API, async actions, immer middleware
- **Context7 `/remix-run/react-router`** — v7.18.1 createBrowserRouter, React 19 compatibility, library vs framework mode
- **Next.js docs** (via Context7 `/vercel/next.js`) — App Router Route Handlers, caching behavior, Edge vs Node runtime, fetch patterns
- **MDN EventSource API & ReadableStream** — Native SSE consumption, stream parsing patterns
- **OpenWeatherMap API docs** — Free tier limits, endpoint URLs, rate limits (verified via APIScout)
- **worldcup26.ir GitHub (rezarahiminia/worldcup2026)** — API endpoints and response format (live fetch verified)
- **Claude API streaming docs (Anthropic)** — Server-Sent Events format, streaming event types, prompt caching

### Secondary (MEDIUM confidence)
- **Stadium operations system audit** — 8 real systems (JARVIS, StadiumIQ, CrowdShield, CrowdCommand, etc.) analyzed from GitHub
- **St. Louis City SC "Ace"** — Agentic AI with 20+ specialized tools, validates dual-mode AI approach
- **StadiumIQ persona architecture** — 6 specialized personas from same backend state, validates store-as-SSOT
- **York University stadium evacuation research (2021)** — Rain accelerates egress 25%+, 33% higher peak exit density
- **Camp Nou arrival pattern modeling** — Social Force Model validation, arrival variance analysis
- **FIFA 2026 heat risk study** — 14 of 16 host locations exceed 28°C WBGT
- **Norway vs Brazil (World Cup 2026) infrastructure data** — 23% mobile data spike, seismic signals
- **SSE pitfalls with serverless (StackNotice guide)** — Cloud Run proxy buffering and timeout issues
- **OpenWeatherMap One Call 3.0 card requirement (GitHub issues)** — Verified via APIScout and community reports

### Tertiary (LOW confidence — needs validation)
- **worldcup26.ir Bearer JWT auth requirement** — Code examples show both "no key required" and "Bearer YOUR_JWT_TOKEN" — needs live verification
- **Claude model ID `claude-sonnet-4-20250514`** — Current at research date but changes frequently; verify at implementation time
- **Exact nginx config for Cloud Run SSE** — Standard `proxy_buffering off` works but specific Cloud Run proxy config should be verified from Cloud Run docs

---

*Research completed: 2026-07-13*
*Ready for roadmap: yes*

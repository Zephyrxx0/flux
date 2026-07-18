# Phase 19: Audit Remediation and Codebase Hardening - Context

**Gathered:** 2026-07-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix all issues identified in the deep audit (FLUX_AUDIT_REPORT.md) and thermo-nuclear code review (THERMO_NUCLEAR_REVIEW_1.md) across the entire codebase. Covers:
- Problem statement alignment (multilingual, sustainability AI, transport AI, navigation→heatmap wiring, volunteer portal dynamism, zone naming, weather config, metadata)
- Code quality (API key exposure, test files, dynamic imports, rate limiter docs, zone data cache, duplicated polling hooks, StadiumSim dead class, VisualizationWorkspace dead branches, cross-store coupling, localStorage validator duplication, phase transition maze, deep clone waste, type hole, misnamed field, inline SVG icons, redundant sync effects)
- Security (remove NEXT_PUBLIC_GEMINI_API_KEY)
- Testing (create smoke test files)
- Accessibility (dynamic html lang, aria-live assertive, skip-to-content link, focus trap, colour-only indicators)
</domain>

<decisions>
## Implementation Decisions

### Multilingual Scope
- **D-19-01:** 10 total languages — EN/ES/FR (existing) + AR/PT/DE/JA/KO/NL/IT (7 new). Covers all major FIFA 2026 participant languages.
- **D-19-02:** ~50+ translated keys per language covering every visible UI string — navigation, alerts, volunteer tasks, weather labels, dashboard titles, chat UI, scenario config, transport labels, tooltips, error messages, empty states, form labels, placeholder text, report sections, comparison UI.
- **D-19-03:** Translation content via AI generation (Gemini) with manual review/override for accuracy — especially AR, JA, KO.
- **D-19-04:** Language switcher uses native script labels (e.g., العربية, 日本語, 한국어, English, Español, Français, Português, Deutsch, Nederlands, Italiano).
- **D-19-05:** RTL layout for Arabic deferred — Arabic text displays in existing LTR layout. Note as deferred idea for future phase.
- **D-19-06:** LOCALE_NAMES map in `useChatStream.ts` to convert locale codes (`"en"`) to full language names (`"English"`) before passing to Gemini API. Fixes the chat greeting bug.

### Sustainability AI
- **D-19-07:** Dedicated `/api/sustainability` POST endpoint following D-08 pattern (one API route per service). Accepts simulation output, returns `{co2KgTotal, greenScore, recommendations[], transportTips[]}`.
- **D-19-08:** Full SustainabilityPanel on dashboard page showing: AI sustainability score, green transport recommendations, per-zone emissions heatmap, recommended transit changes.
- **D-19-09:** Refreshes when simulation re-runs (scenario change, weather change, phase transition).

### Transport AI Connection
- **D-19-10:** Full AI endpoint (`/api/transport` POST) — zone occupancy data posted to Gemini, returns structured `TransportRecommendation[]` with aiReason per route.
- **D-19-11:** Expand routes from 3 existing to ~5-6 stadium-specific routes (Metro, Bus Shuttle, Accessible Van, Park & Ride, Shuttle Express).
- **D-19-12:** Transport status re-evaluated on every simulation change — not on a timer.

### Navigation→Heatmap Wiring
- **D-19-13:** Chat→heatmap communication via zustand store — add `highlightedZone` field to a store slice. ChatInterface sets it, StadiumHeatmap subscribes.
- **D-19-14:** Highlight style: CSS keyframe pulse animation on the zone SVG polygon.
- **D-19-15:** Add 3 accessibility quick chips to QuickChips: "Is there a wheelchair-accessible route?", "Where is the accessible drop-off point?", "Which gate has the shortest wait time?"
- **D-19-16:** ChatMessage renders "View on map" button when Gemini returns `suggestedGate` or `zoneInfo`. Button scrolls to heatmap view and highlights the zone.
- **D-19-17:** Zone friendly name map in `zoneData.ts` — `ZONE_FRIENDLY_NAMES` maps IDs to readable names (e.g., `north` → "North Stand"). Used throughout dashboard, chatbot, volunteer portal, reports. Also drives the DynamicHtmlLang component.

### Volunteer Portal Dynamism
- **D-19-18:** Volunteer task derives from highest-severity alert in live store. If no critical alerts, show "All zones nominal — monitor crowd entry at assigned gate."
- **D-19-19:** Gate assignment and duty roster number derive from alert zone + session-generated value — not hardcoded.

### Zone Friendly Names
- **D-19-20:** Simple descriptive names: "North Stand", "South Stand", "East Concourse", "West Concourse", "Zone C — Gate Cluster". Applied in `zoneData.ts` via `ZONE_FRIENDLY_NAMES` map.

### Weather City Config
- **D-19-21:** Hardcoded stadium→city map in `/api/weather/route.ts`. Default to "New York,US" if stadium unknown.
- **D-19-22:** Include ~5-7 stadiums that the existing codebase references — not all 15+ FIFA host venues.

### Accessibility: Focus Trap
- **D-19-23:** Use native HTML `<dialog>` element for chat panel focus management instead of library or manual trapping.

### Other Code Quality Fixes
- **D-19-24:** (Finding 1 — useAlertStream bug) Move match data to a useRef, remove from useCallback dependency array. connect() reads matchRef.current. Prevents Gemini reconnect on every 30s match poll.
- **D-19-25:** (Finding 2 — usePoller) Extract generic `usePoller<T>` hook from duplicated `useMatchPoller` + `useWeather`. Minimal interface: `{fetchFn, intervalMs, enabled?, maxRetries?}`. Both hooks become thin wrappers.
- **D-19-26:** (Finding 3 — StadiumSim) Delete class + `src/simulation/adapters/` directory. Replace `StadiumSim.run(input)` with `simulateDeterministic(input)` at 3 call sites.
- **D-19-27:** (Finding 4 — VisualizationWorkspace) Remove `activeTab` prop and dead `compare`/`report` branches. Workspace renders only simulation visualizations.
- **D-19-28:** (Finding 5 — cross-store coupling) Move `useComparisonStore.getState().appendRun()` out of `useScenarioStore.setLatestSimulationOutput`. Call it explicitly in `ScenarioForm.tsx onValidInput`.
- **D-19-29:** (Finding 6 — makeValidatedStorage) Extract `src/lib/storage/makeValidatedStorage.ts` factory. Both `useScenarioStore` and `useComparisonStore` use it with their own Zod validator.
- **D-19-30:** (Finding 7 — phase transition) Extract `resolvePhaseEvent(from: string, to: string): string | null` pure function from the conditional maze in `usePhaseTransitionWatcher.ts`.
- **D-19-31:** (Finding 8 — deep clone) Replace `JSON.parse(JSON.stringify(...))` with spread `{...base, ...}` in `applyPhaseTransitionDeltas`. Type `eventType` as a union `TransitionEvent`.
- **D-19-32:** (Finding 9 — type hole) Change `structuredData: z.any()` to `ChatResponseSchema.nullable().optional()` in `ChatMessageSchema`.
- **D-19-33:** (Finding 10 — misnamed field) Rename `v1ZoneData` → `simConfig` in `simSlice.ts` and all callers (3 files).
- **D-19-34:** (Finding 11 — inline SVG) Replace inline SVG icons with `lucide-react` `Download` and `Printer` in `ExportActions.tsx`.
- **D-19-35:** (Finding 12 — redundant effect) Remove state→ref sync useEffect in `useDemoSequence`. Use `timelineRef` directly, remove intermediary `timeline` state.
- **D-19-36:** (Q1 — API key security) Move risk report generation to server-side `/api/report` route. Remove `NEXT_PUBLIC_GEMINI_API_KEY` from all env configs. Delete the client-side `invokeGeminiViaFetch` from `generateRiskReport.ts`.
- **D-19-37:** (Q3 — dynamic import) Replace `const { findNextUpcoming } = await import(...)` with static import in `/api/match/route.ts`.
- **D-19-38:** (Q4 — rate limiter) Add code comment to `rateLimit.ts`: "Note: this bucket resets on serverless cold start — per-process limit only."

### Testing
- **D-19-39:** Create missing test files referenced by `package.json` smoke test commands:
  - `tests/simulation/presets.test.ts` — all 3 presets produce valid output
  - `tests/simulation/deterministic.test.ts` — property-based tests using existing `fast-check` dep
  - `tests/ui/form.test.ts` — ScenarioForm renders, validates inputs
  - `tests/ui/alertFeed.test.ts` — AlertFeed empty/populated states
  - `tests/api/zoneData.test.ts` — getZoneData, \_resetZoneDataCache

### Accessibility (Beyond Focus Trap)
- **D-19-40:** DynamicHtmlLang client component updates `<html lang>` attribute when language changes in store.
- **D-19-41:** `AlertFeed` derives `aria-live` from highest-severity alert — `"assertive"` for critical, `"polite"` otherwise.
- **D-19-42:** Skip-to-content link in `layout.tsx` — visually hidden, appears on focus. `id="main-content"` on the content wrapper.
- **D-19-43:** Transport route status indicators add `aria-label` with text description (e.g., "Metro Line A: On Time") — not colour-only.

### App Metadata
- **D-19-44:** Update `app/layout.tsx` metadata.title and metadata.description to reference FIFA World Cup 2026, GenAI, and the 8 problem statement domains. Include relevant keywords.

### AI Endpoint Fixes
- **D-19-45:** Pass live simulation output (not cached normal preset) to `getZoneData()` in both `/api/alert` and `/api/chat` routes. Add optional `simOutput` parameter.

### the agent's Discretion
- Exact zone delta targets for goal events
- Demo event advance interval speed (5s default)
- DemoModeBanner styling details
- SportingEventSelector icon selection
- Specific implementation details for: pulse animation keyframes, focus-trap dialog markup, skip-to-content link styling, DynamicHtmlLang component structure, SustainabilityPanel layout within dashboard page, TransportWidget expanded routes, ChatMessage "View on map" button styling
- Stadium→city map entries (which ~5-7 stadiums)
- Weather→lucide-react icon mapping
- Quick chip text wording for accessibility entries
- Translation i18n key naming convention and file structure

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Source Audit Documents
- `.planning/../FLUX_AUDIT_REPORT.md` — Full deep audit with prioritized fixes, score breakdown (93.19 → target 97+), and explicit code for each fix
- `.planning/../THERMO_NUCLEAR_REVIEW_1.md` — Structural code quality review with 12 findings (4 blocker severity), explicit code for each fix

### Architecture & Requirements
- `.planning/ROADMAP.md` §19 — Phase definition (after adding Phase 19)
- `.planning/PROJECT.md` — Key Decisions (D-01 through D-12), architecture principles
- `.planning/REQUIREMENTS.md` — v2 requirements tracking
- `.planning/STATE.md` — Current position, prior phase completion status
- `.planning/phases/18-demo-mode-integration-wiring/18-CONTEXT.md` — Phase 18 decisions (demo mode, phase transitions, dashboard layout)
- `.planning/phases/17-weather-integration/17-CONTEXT.md` — Phase 17 decisions (weather adjustment model, WeatherCard, D-17-12 hardcode aspect)
- `.planning/phases/16-fan-chatbot/16-CONTEXT.md` — Phase 16 decisions (Gemini pattern, chatSlice FIFO, quick chips, fan route group)
- `.planning/phases/15-ai-alert-stream/15-CONTEXT.md` — Phase 15 decisions (SSE pattern, Gemini streaming, server-side data init)
- `.planning/phases/14-server-runtime-match-polling/14-CONTEXT.md` — Phase 14 decisions (API proxy pattern, useMatchPoller, dashboard layout, D-08)
- `.planning/phases/13-foundation-architecture-decision/13-CONTEXT.md` — Phase 13 decisions (store slices D-05, API routes D-08, SSE D-09, Zod schemas D-11, per-domain types D-12)

### Files to Modify (Problem Statement Alignment)

#### Multilingual
- `src/stores/slices/i18nSlice.ts` — Expand SupportedLocale to 10 languages, add 50+ keys per language
- `src/hooks/useChatStream.ts` — Add LOCALE_NAMES map for locale→language name conversion
- `src/components/fan/LanguageSwitcher.tsx` — Native script labels, 7 new language entries
- `src/app/layout.tsx` — Update metadata title/description for FIFA/GenAI

#### Sustainability
- `src/app/api/sustainability/route.ts` — NEW: POST endpoint, Gemini analysis, Zod validation
- `src/components/dashboard/SustainabilityPanel.tsx` — NEW: Full sustainability UI card

#### Transport
- `src/app/api/transport/route.ts` — NEW: POST endpoint for AI transport recommendations
- `src/components/dashboard/TransportWidget.tsx` — Dynamic status from sim + AI, expanded routes, accessible labels

#### Navigation→Heatmap
- `src/components/fan/StadiumHeatmap.tsx` — Subscribe to highlightedZone store, pulse animation
- `src/components/fan/ChatMessage.tsx` — "View on map" button conditional render
- `src/components/fan/QuickChips.tsx` — Add 3 accessibility quick chips

#### Volunteer Portal
- `src/app/(dashboard)/volunteer/page.tsx` — Derive task + gate + roster from live alerts

#### Zone Data + Weather
- `src/lib/api/zoneData.ts` — Add ZONE_FRIENDLY_NAMES map, accept optional simOutput param
- `src/app/api/weather/route.ts` — Replace hardcoded NY with stadium→city map

### Files to Modify (Code Quality — Structural Fixes)

#### Critical Fixes
- `src/reporting/gemini/generateRiskReport.ts` — Remove client-side Gemini call (moved to /api/report)
- `src/app/api/report/route.ts` — NEW: Server-side risk report endpoint
- `src/hooks/useAlertStream.ts` — Fix: move match to useRef, remove from useCallback deps
- `src/simulation/adapters/StadiumSim.ts` — DELETE class + adapter directory
- `src/visualization/components/VisualizationWorkspace.tsx` — Remove activeTab prop + dead branches
- `src/hooks/useScenarioStore.ts` — Remove cross-store side effect from setLatestSimulationOutput
- `src/hooks/useComparisonStore.ts` — Use makeValidatedStorage factory

#### Refactoring
- `src/hooks/useMatchPoller.ts` — Thin wrapper around usePoller<T>
- `src/hooks/useWeather.ts` — Thin wrapper around usePoller<T>
- `src/hooks/usePoller.ts` — NEW: Generic polling hook extracted from both
- `src/lib/storage/makeValidatedStorage.ts` — NEW: localStorage validator factory
- `src/hooks/usePhaseTransitionWatcher.ts` — Extract resolvePhaseEvent() pure function
- `src/lib/api/phaseTransitions.ts` — Replace deep clone with spread, add TransitionEvent union type
- `src/hooks/useDemoSequence.ts` — Remove redundant state→ref sync effect

#### Type Fixes
- `src/types/chat.ts` — Fix `ChatMessageSchema.structuredData` from `z.any()` to `ChatResponseSchema.nullable().optional()`
- `src/stores/slices/simSlice.ts` — Rename `v1ZoneData` to `simConfig`

#### Other
- `src/app/api/match/route.ts` — Replace dynamic import with static import
- `src/lib/api/rateLimit.ts` — Add serverless cold start comment
- `src/export/components/ExportActions.tsx` — Replace inline SVG with lucide-react icons
- `src/app/api/alert/route.ts` — Pass current simOutput to getZoneData
- `src/app/api/chat/route.ts` — Pass current simOutput to getZoneData

### Files to Modify (Accessibility)
- `src/app/layout.tsx` — Add DynamicHtmlLang, skip-to-content link, id="main-content"
- `src/components/dashboard/AlertFeed.tsx` — Dynamic aria-live based on critical alerts
- `src/components/fan/ChatPanel.tsx` — Native <dialog> focus management

### Files to Create
- `src/app/api/sustainability/route.ts` — Sustainability AI endpoint
- `src/app/api/transport/route.ts` — Transport AI endpoint  
- `src/app/api/report/route.ts` — Server-side risk report endpoint
- `src/hooks/usePoller.ts` — Generic polling hook
- `src/lib/storage/makeValidatedStorage.ts` — Storage validator factory
- `src/components/dashboard/SustainabilityPanel.tsx` — Sustainability UI card

### Test Files to Create
- `tests/simulation/presets.test.ts` — Smoke tests for all 3 presets
- `tests/simulation/deterministic.test.ts` — Property-based tests (fast-check)
- `tests/ui/form.test.ts` — ScenarioForm rendering + validation
- `tests/ui/alertFeed.test.ts` — AlertFeed empty/populated states
- `tests/api/zoneData.test.ts` — getZoneData cache + reset

### Existing Patterns to Reuse
- `src/app/api/match/route.ts` — API proxy pattern (D-08) for new `/api/sustainability`, `/api/transport`, `/api/report`
- `src/components/dashboard/MatchBanner.tsx` — Dashboard component pattern (Card, Badge, Skeleton, error/loading) for SustainabilityPanel
- `src/hooks/useMatchPoller.ts` — Polling hook pattern (callback refs, visibility API, retry) — source for usePoller extraction
- `src/stores/slices/weatherSlice.ts` — Impact type + adjustment pattern, direct model for zone friendly names integration
- `src/components/ui/card.tsx`, `badge.tsx`, `skeleton.tsx` — shadcn components for all new UI
- `src/lib/ai/gemini.ts` — `streamGeminiResponse()` for all new AI endpoints
- `src/lib/api/worldcup26.ts` — External API mapping pattern with Zod schemas
- `src/stores/liveStore.ts` — Slice composition pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/ai/gemini.ts` — `streamGeminiResponse()` ready for `/api/sustainability`, `/api/transport`, `/api/report`
- `src/hooks/useMatchPoller.ts` + `useWeather.ts` — Source code for usePoller<T> extraction
- `src/components/dashboard/MatchBanner.tsx`, `WeatherCard.tsx` — Dashboard component patterns (loading skeletons, error states, card layouts)
- `src/stores/slices/weatherSlice.ts` — Already has impact type + setWeather pattern; replicate for transport and sustainability slices
- `src/stores/liveStore.ts` — All 5 slices already composed; new slices follow same pattern
- `src/components/fan/StadiumHeatmap.tsx` — SVG zone map already exists, needs subscribe-to-store + pulse animation
- `src/components/dashboard/AlertFeed.tsx` — Dynamic aria-live, auto-scroll, severity colors

### Established Patterns
- **Server-side API proxy:** Next.js route handler → Gemini fetch → Zod validation → structured response (Phase 14/15/16 pattern)
- **Server-side data self-init:** Routes self-initialize zone data from presets + sim engine (Phase 15 pattern)
- **Zod schemas at API boundaries:** All type validation at route boundaries (Phase 13 D-11)
- **Ephemeral store:** No localStorage for transient state (Phase 13 D-07)
- **Polling hook pattern:** Callback refs, visibility API, exponential backoff (Phase 14 pattern)
- **Dashboard layout:** Route group with header (MatchBanner + WeatherCard) + page content (Phase 14 pattern)

### Integration Points
- `src/app/(dashboard)/dashboard/page.tsx` — Mount SustainabilityPanel in dashboard content
- `src/app/(dashboard)/layout.tsx` — DynamicHtmlLang, skip-to-content link
- `src/stores/liveStore.ts` — Add transport slice, add highlightedZone field
- `src/components/dashboard/TransportWidget.tsx` — Wire to live AI endpoint + zone data
- `src/visualization/components/VisualizationWorkspace.tsx` — Remove dead branches, simplify
- `src/app/(dashboard)/volunteer/page.tsx` — Wire task to alert feed
- `src/components/fan/StadiumHeatmap.tsx` — Subscribe to highlightedZone store state
- All files listed in the canonical_refs section point to modification points

### Testing Infrastructure
- `vitest.config.ts` — Already configured for .ts/.tsx tests
- `fast-check` — Already in devDependencies, unused
- `@testing-library/react` — Already available
- No test files exist yet — all must be created from scratch

</code_context>

<specifics>
## Specific Ideas

All 22 issues and their fixes are specified with explicit code examples in:
- `FLUX_AUDIT_REPORT.md` — Sections 1.1-1.8, 2.1-2.7, 3.1-3.5, 4.1, 5.1
- `THERMO_NUCLEAR_REVIEW_1.md` — Findings 1-12 with explicit before/after code

Downstream agents MUST read both source audit documents for exact implementation code. These contain inline TypeScript/TSX snippets that show precisely how each fix should be implemented.

No additional specific requirements — discussion captured all implementation decisions above.
</specifics>

<deferred>
## Deferred Ideas

- **Full Arabic RTL layout support** — When AR locale is active, flip layout direction (dir='rtl'), mirror alignment, adjust margins/paddings. Requires CSS framework changes and testing across all components. Future phase.

None beyond the above — discussion stayed within phase scope.
</deferred>

---

*Phase: 19-Audit Remediation and Codebase Hardening*
*Context gathered: 2026-07-18*

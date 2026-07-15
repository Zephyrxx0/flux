# Phase 17: Weather Integration - Context

**Gathered:** 2026-07-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Weather data from OpenWeatherMap adjusts zone densities (rain/heat/stadium effects) and a WeatherCard is displayed on the ops dashboard. Uses server-side API proxy to OWM, client-side hook for periodic refresh, and weather-adjusted simulation input.

</domain>

<decisions>
## Implementation Decisions

### Density Adjustment Model
- **D-17-01:** Weather modifies sim input directly — adjust zone capacities (for heat) and gate throughputs (for rain) on the SimulationInput before calling `simulateDeterministic()`. Weather feels baked into the simulation, not a post-process overlay.
- **D-17-02:** Rain → gate throughput reduced by 15%. Heat → zone capacity reduced by 15%. Storm → both at 25% reduction.
- **D-17-03:** Weather adjustment runs client-side in `useWeather` hook. Hook fetches from `/api/weather` proxy, applies adjustments to sim input locally, calls `simulateDeterministic()` with adjusted params, updates `weatherSlice` with both weather data and impact summary.
- **D-17-04:** Auto re-sim on weather condition change — when a fresh weather fetch shows different conditions (e.g., clear→rain), auto re-run sim with adjusted params so dashboard always reflects current weather impact.

### WeatherCard Design & Placement
- **D-17-05:** WeatherCard positioned below MatchBanner, above dashboard content in the dashboard layout (same level as MatchBanner, not in the page).
- **D-17-06:** Card displays: temperature, weather condition text + icon (lucide-react — Sun, Cloud, CloudRain, CloudSnow, CloudLightning), humidity, and an impact severity chip showing current effect (None / Rain / Heat / Storm).
- **D-17-07:** Impact note text on card: "Rain: Throughput -15%", "Heat: Capacity -15%", etc.
- **D-17-08:** Loading state: skeleton loader (matches MatchBanner). Error state: amber warning with "Weather data unavailable — retrying..." with retry countdown. Preserves last-known data on subsequent errors.

### Weather Update Mechanism
- **D-17-09:** `useWeather` hook parallel to `useMatchPoller` pattern — callback refs, cleanup on unmount, Page Visibility API pause/resume, exponential backoff on error.
- **D-17-10:** Poll interval: 10 minutes (matches success criteria).
- **D-17-11:** `/api/weather` returns OWM data mapped to `WeatherDataSchema` — temperature, conditions, humidity, windSpeed, impact. Zod-validated at the boundary. Same proxy pattern as `/api/match`.

### OpenWeatherMap Location
- **D-17-12:** Hardcode city: "New York, US" via OWM city name endpoint (`api.openweathermap.org/data/2.5/weather?q=New%20York,US`). No env var or geolocation — keeps demo predictable.
- **D-17-13:** OWM_API_KEY env var already scoped (DEP-04, completed in Phase 14). Used via `process.env.OWM_API_KEY` in `/api/weather` route.

### the agent's Discretion
- Weather→lucide-react icon mapping (e.g., "Rain"→CloudRain, "Clear"→Sun)
- Specific layout spacing for WeatherCard in the dashboard layout
- Impact severity color treatment (align with existing dashboard color tokens)
- Weather data mapping function in `src/lib/api/weather.ts`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Requirements
- `.planning/ROADMAP.md` §17 — Phase definition, success criteria, dependency chain
- `.planning/PROJECT.md` — Key Decisions (D-01 through D-12), architecture principles
- `.planning/REQUIREMENTS.md` — WTHR-01, WTHR-02 specs
- `.planning/STATE.md` — Current position, prior phase completion status
- `.planning/phases/16-fan-chatbot/16-CONTEXT.md` — Phase 16 decisions (Gemini pattern, env var conventions)
- `.planning/phases/15-ai-alert-stream/15-CONTEXT.md` — Phase 15 decisions (SSE pattern, server-side data init)
- `.planning/phases/14-server-runtime-match-polling/14-CONTEXT.md` — Phase 14 decisions (server-side proxy, polling pattern, dashboard layout)
- `.planning/phases/13-foundation-architecture-decision/13-CONTEXT.md` — Phase 13 decisions (D-05 store slices, D-08 API routes, D-11 Zod schemas)

### Existing Code Patterns to Reuse
- `src/app/api/match/route.ts` — Proxy route handler pattern for `/api/weather` (fetch external API, Zod-validate, return mapped data)
- `src/app/api/alert/route.ts` — Server-side data self-initialization pattern (presets + simulateDeterministic)
- `src/hooks/useMatchPoller.ts` — Polling hook pattern for `useWeather` (callback refs, visibility API, retry)
- `src/components/dashboard/MatchBanner.tsx` — Dashboard component pattern for WeatherCard (Card, Badge, Skeleton, error/loading states)
- `src/lib/api/worldcup26.ts` — API utility pattern with Zod schemas + mapping functions (replicate as `src/lib/api/weather.ts`)

### Existing Stubs & Slices
- `src/app/api/weather/route.ts` — Route stub (currently returns "not implemented")
- `src/stores/slices/weatherSlice.ts` — WeatherSlice with WeatherImpact type, setWeather, null initial state
- `src/types/weather.ts` — WeatherDataSchema with temperature, conditions, humidity, windSpeed, impact
- `src/stores/liveStore.ts` — weatherSlice already composed in

### Dashboard Integration Points
- `src/app/(dashboard)/layout.tsx` — Dashboard layout (add WeatherCard below MatchBanner)
- `src/app/(dashboard)/dashboard/page.tsx` — Dashboard page (mount useWeather, already has useMatchPoller + initializeSim)
- `src/simulation/presets.ts` — Preset definitions (zone data source for weather-adjusted sim)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/hooks/useMatchPoller.ts` — Complete polling hook with callback refs, visibility API, exponential backoff. Direct model for `useWeather`.
- `src/components/dashboard/MatchBanner.tsx` — Loading skeleton, error banner, card layout patterns to replicate for WeatherCard.
- `src/components/ui/card.tsx`, `badge.tsx`, `skeleton.tsx` — shadcn components for WeatherCard UI.
- `src/lib/api/worldcup26.ts` — External API mapping pattern (Zod schema for raw shape + mapping function to internal type).
- `src/stores/slices/weatherSlice.ts` — Already wired into liveStore with `weather` state and `setWeather`.

### Established Patterns
- **Server-side API proxy:** Next.js route handler → external API → Zod validation → mapped response (Phase 14 pattern)
- **Client polling hook:** useMatchPoller style — callback refs, cleanup, visibility pause/resume, exponential backoff (Phase 14 pattern)
- **Sim state management:** simulateDeterministic() with presets.normal, initialized lazily on dashboard mount (Phase 14 pattern)
- **Dashboard layout:** Route group `app/(dashboard)/` with dedicated layout.tsx (Phase 14 pattern)
- **Zod schemas at API boundaries:** All type validation at route boundaries (Phase 13 D-11)

### Integration Points
- `src/app/api/weather/route.ts` — Implement OWM proxy with Zod validation + data mapping
- `src/app/(dashboard)/layout.tsx` — Add WeatherCard below MatchBanner
- `src/hooks/useWeather.ts` — New file: weather polling hook (modeled on useMatchPoller)
- `src/components/dashboard/WeatherCard.tsx` — New file: weather display component
- `src/lib/api/weather.ts` — New file: OWM API mapping utility (modeled on worldcup26.ts)
- `src/stores/slices/weatherSlice.ts` — Add weather impact summary to slice state

### Assets Not Available
- No `useWeather` hook — needs creation (modeled on useMatchPoller)
- No WeatherCard component — needs creation
- No `src/lib/api/weather.ts` — needs creation

</code_context>

<specifics>
## Specific Ideas

- WeatherSlice already has `WeatherImpact` type (`"none" | "rain" | "heat" | "storm"`) — impact severity should drive the density adjustment percentages
- Match the layout pattern from MatchBanner (Card with CardContent, consistent max-width mx-auto)
- WeatherCard impact chip could reuse Badge with color-coded variants (blue=rain, orange=heat, red=storm)
- lucide-react icons: Sun for Clear, Cloud for Clouds, CloudRain for Rain/Drizzle, CloudSnow for Snow, CloudLightning for Thunderstorm, CloudFog for Mist/Fog

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 17-Weather Integration*
*Context gathered: 2026-07-15*

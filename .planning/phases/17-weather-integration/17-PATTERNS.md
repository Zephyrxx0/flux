# Phase 17: Weather Integration — Pattern Map

**Mapped:** 2026-07-15
**Files analyzed:** 7 (3 modify + 3 new + 1 slice extend)
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/app/api/weather/route.ts` | controller (route) | request-response | `src/app/api/match/route.ts` | exact (same proxy pattern) |
| `src/lib/api/weather.ts` | utility | transform | `src/lib/api/worldcup26.ts` | exact (API mapping + Zod schema) |
| `src/hooks/useWeather.ts` | hook | polling | `src/hooks/useMatchPoller.ts` | exact (same polling pattern) |
| `src/components/dashboard/WeatherCard.tsx` | component | display | `src/components/dashboard/MatchBanner.tsx` | role-match (same card layout, error/loading states) |
| `src/stores/slices/weatherSlice.ts` | store slice | state | self (extend existing) + `matchSlice.ts` | role-match (extend existing slice) |
| `src/app/(dashboard)/layout.tsx` | layout | composition | self (modify) | — |
| `src/app/(dashboard)/dashboard/page.tsx` | page | composition | self (modify) | — |

---

## Pattern Assignments

### `src/app/api/weather/route.ts` (controller, request-response) — MODIFY stub

**Analog:** `src/app/api/match/route.ts` (lines 1-67)
**Match type:** exact — both are Next.js route handlers that proxy an external API, Zod-validate response, and return mapped data.

**Imports pattern** (lines 1-7 of match/route.ts):
```typescript
import { type NextRequest } from "next/server";
import {
  WorldCup26GamesSchema,
  mapGameToMatchState,
  findLiveMatch,
} from "@/lib/api/worldcup26";
```

For weather, the equivalent imports will be:
- `NextRequest` from `"next/server"`
- `WeatherDataSchema` from `@/types/weather`
- `mapOwmResponse` (new) from `@/lib/api/weather`
- `OWMResponseSchema` (new) from `@/lib/api/weather`

**Env var pattern** (lines 10-16):
```typescript
export async function GET(_request: NextRequest) {
  const token = process.env.WORLDCUP26_TOKEN;
  if (!token) {
    return Response.json(
      { error: "WORLDCUP26_TOKEN not configured", status: "error" },
      { status: 500 }
    );
  }
```

For weather: use `process.env.OWM_API_KEY`, return 500 if missing.

**External fetch pattern** (lines 18-24):
```typescript
try {
  const response = await fetch("https://worldcup26.ir/get/games", {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });
```

For weather: fetch `https://api.openweathermap.org/data/2.5/weather?q=New%20York,US&appid=${apiKey}&units=metric`, no special auth header (API key is query param), timeout 10s.

**Zod-safeParse pattern** (lines 33-46):
```typescript
const raw = (await response.json()) as unknown;
const parsed = WorldCup26GamesSchema.safeParse(raw);
if (!parsed.success) {
  return Response.json(
    { error: "Invalid upstream data", status: "parse_error", issues: parsed.error.issues },
    { status: 502 }
  );
}
```

For weather: validate OWM JSON against `OWMResponseSchema`, return 502 on parse failure.

**Mapping + response pattern** (lines 47-60):
```typescript
const liveMatchGame = findLiveMatch(games);
const match = liveMatchGame ? mapGameToMatchState(liveMatchGame) : null;
return Response.json({ match, allGames });
```

For weather: call `mapOwmResponse(parsed.data)` to get `WeatherData`, return `Response.json({ weather: mapped })`.

**Error handling pattern** (lines 61-65):
```typescript
} catch (err: any) {
  return Response.json(
    { error: err.message || "Network failure", status: "fetch_error" },
    { status: 502 }
  );
}
```

---

### `src/lib/api/weather.ts` (utility, transform) — NEW file

**Analog:** `src/lib/api/worldcup26.ts` (lines 1-90)
**Match type:** exact — same external-API-to-internal-type mapping utility.

**Zod schema for raw OWM shape** (lines 1-28 of worldcup26.ts):
```typescript
import { z } from "zod";

export const WorldCup26GameSchema = z.object({
  _id: z.string(),
  id: z.string(),
  home_team_id: z.string(),
  // ... all raw API fields matched exactly
});
```

For weather: define `OWMResponseSchema` matching the OWM JSON shape:
```typescript
export const OWMResponseSchema = z.object({
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    humidity: z.number(),
  }),
  weather: z.array(z.object({
    main: z.string(),      // "Clear", "Rain", etc.
    description: z.string(),
    icon: z.string(),
  })).min(1),
  wind: z.object({
    speed: z.number(),
  }).optional(),
  name: z.string(),         // "New York"
});
```

**Mapping function pattern** (lines 66-75 of worldcup26.ts):
```typescript
export function mapGameToMatchState(game: WorldCup26Game): LiveMatch {
  const { phase, minute } = parseTimeElapsed(game.time_elapsed);
  return {
    score: `${game.home_score} - ${game.away_score}`,
    phase,
    minute,
    homeTeam: game.home_team_name_en,
    awayTeam: game.away_team_name_en,
  };
}
```

For weather: `mapOwmResponse(raw: OWMResponse) → WeatherData`:
```typescript
export function mapOwmResponse(raw: OWMResponse): WeatherData {
  const condition = raw.weather[0].main;
  return {
    temperature: Math.round(raw.main.temp),
    conditions: condition,
    humidity: raw.main.humidity,
    windSpeed: raw.wind ? Math.round(raw.wind.speed * 3.6) : undefined, // m/s→km/h
    impact: classifyWeatherImpact(condition),
  };
}
```

**Impact classification helper** — implement alongside mapping:
```typescript
export function classifyWeatherImpact(condition: string): WeatherImpact {
  switch (condition) {
    case "Rain":
    case "Drizzle":  return "rain";
    case "Clear":    return "heat";  // only if > certain temp, else "none"
    // ...
  }
}
```

---

### `src/hooks/useWeather.ts` (hook, polling) — NEW file

**Analog:** `src/hooks/useMatchPoller.ts` (lines 1-110)
**Match type:** exact — same polling mechanism, same visibility API pattern, same retry logic.

**Poller state interface** (lines 6-11):
```typescript
export interface PollerState {
  data: MatchState | null;
  error: string | null;
  isPolling: boolean;
  isRetrying: boolean;
}
```

For weather: extend to also carry the `WeatherImpact` for the impact summary:
```typescript
export interface WeatherPollerState {
  data: WeatherData | null;
  previousData: WeatherData | null;  // for detecting condition change
  error: string | null;
  isPolling: boolean;
  isRetrying: boolean;
  impact: WeatherImpact;
}
```

**Constants pattern** (lines 13-15):
```typescript
const POLL_INTERVAL = 30_000;
const MAX_RETRIES = 3;
const RETRY_BASE = 1_000;
```

For weather: `POLL_INTERVAL = 600_000` (10 min = 600_000ms), same retry params.

**Callback ref pattern** (lines 29-33):
```typescript
const fetchFnRef = useRef(fetchFn);
useEffect(() => { fetchFnRef.current = fetchFn; }, [fetchFn]);
```

Exact same for weather — generic pattern, copy verbatim.

**Visibility pause/resume pattern** (lines 78-88):
```typescript
const handleVisibilityChange = () => {
  isVisibleRef.current = !document.hidden;
  if (isVisibleRef.current) {
    setState((prev) => ({ ...prev, isPolling: true }));
    clearTimers();
    doFetch();
    intervalRef.current = setInterval(doFetch, POLL_INTERVAL);
  } else {
    setState((prev) => ({ ...prev, isPolling: false }));
    clearTimers();
  }
};
```

Copy verbatim — same visibility API pattern, only change interval to 600,000ms.

**Exponential backoff error handling** (lines 58-74):
```typescript
catch (err) {
  retryCountRef.current += 1;
  const currentRetry = retryCountRef.current;
  if (currentRetry <= MAX_RETRIES) {
    setState((prev) => ({ ...prev, isRetrying: true }));
    const delay = RETRY_BASE * Math.pow(2, currentRetry - 1);
    retryTimerRef.current = setTimeout(doFetch, delay);
  } else {
    setState((prev) => ({
      ...prev,
      error: "Weather data unavailable — retrying...",
      isRetrying: false,
    }));
    retryCountRef.current = 0;
  }
}
```

Copy verbatim — same retry/logic. Error message matches D-17-08 and UI-SPEC.

**🔑 Key difference from useMatchPoller — auto re-sim on condition change (D-17-04):**
After successful fetch, before setting state, compare `data.impact` with previous `impact`.
If impact changed (e.g., "none" → "rain"), invoke the weather adjustment callback:
```typescript
// Inside doFetch, after parsing result:
const prevImpact = stateRef.current?.data?.impact ?? "none";
if (result.impact !== prevImpact && onImpactChange) {
  onImpactChange(result.impact);
}
```
The hook should accept an `onImpactChange` callback that the page can use to trigger re-simulation.

---

### `src/components/dashboard/WeatherCard.tsx` (component, display) — NEW file

**Analog:** `src/components/dashboard/MatchBanner.tsx` (lines 1-114)
**Match type:** role-match — same card layout, same error/loading state patterns, same shadcn components.

**Loading state pattern** (lines 23-36 of MatchBanner.tsx):
```tsx
<Card className="w-full max-w-5xl mx-auto">
  <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
    <Skeleton className="h-6 w-32" />
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="h-12 w-24" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-6 w-32" />
  </CardContent>
</Card>
```

For weather: icon skeleton (h-12 w-12 rounded-lg) + two text skeletons (h-6 w-24, h-4 w-32) per UI-SPEC.

**Error state (no prior data) pattern** (lines 38-47):
```tsx
<Card className="w-full max-w-5xl mx-auto border-amber-500/50 bg-amber-500/10">
  <CardContent className="flex flex-row items-center justify-center gap-2 px-4 py-8">
    <TriangleAlert className="h-5 w-5 text-amber-500" />
    <p className="text-amber-600 dark:text-amber-400 font-medium">{error}</p>
  </CardContent>
</Card>
```

Copy verbatim — same amber warning pattern, different message per UI-SPEC.

**Error with prior data / Live data pattern** (lines 78-113):
```tsx
<Card className={cn(
  "w-full max-w-5xl mx-auto relative overflow-hidden",
  error ? "border-amber-500/50" : "ring-1 ring-primary/10"
)}>
  {error && (
    <div className="w-full bg-amber-500/10 px-4 py-2 flex items-center justify-center gap-2 border-b border-amber-500/20">
      <TriangleAlert className="h-4 w-4 text-amber-500" />
      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{error}</p>
    </div>
  )}
  <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
    {/* card content */}
  </CardContent>
</Card>
```

For weather: amber warning bar when error with prior data exists. Card content shows weather data.

**🔑 WeatherCard-specific: impact severity chip** — use Badge with variants:
```tsx
import { Badge } from "@/components/ui/badge";

const impactConfig = {
  none:  { label: "No Impact", variant: "secondary" as const, note: null },
  rain:  { label: "Rain", variant: "destructive" as const, note: "Rain: Gate throughput -15%" },
  heat:  { label: "Heat", variant: "destructive" as const, note: "Heat: Zone capacity -15%" },
  storm: { label: "Storm", variant: "destructive" as const, note: "Storm: Throughput & capacity -25%" },
};
```

**🔑 lucide-react icon mapping** — from OWM condition to icon component:
```tsx
const weatherIcons: Record<string, LucideIcon> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudRain,
  Snow: CloudSnow,
  Thunderstorm: CloudLightning,
  Mist: CloudFog,
  Fog: CloudFog,
  Haze: CloudFog,
};
```

---

### `src/stores/slices/weatherSlice.ts` (store slice, state) — MODIFY existing

**Analog:** self (extend existing) + `src/stores/slices/matchSlice.ts` (lines 1-13) for pattern reference
**Match type:** role-match — extending existing Zustand slice, following same conventions.

**Existing slice** (weatherSlice.ts lines 1-20):
```typescript
export interface WeatherSlice {
  weather: {
    temperature: number | null;
    conditions: string | null;
    humidity: number | null;
    windSpeed: number | null;
    impact: WeatherImpact;
  } | null;
  setWeather: (weather: WeatherSlice["weather"]) => void;
}
```

**Additions needed:**
- Add `impactSummary` field: `{ impact: WeatherImpact; adjustedCapacities: ZoneCapacity[]; adjustedThroughputs: GateThroughput[] } | null`
- Add `setImpactSummary` action — separate from `setWeather` to avoid coupling data fetch to sim state
- Optional: add `lastFetchTime: number | null` for retry countdown display

**Pattern from matchSlice.ts** for extension:
```typescript
// matchSlice pattern — simple setter
export interface MatchSlice {
  match: MatchState | null;
  setMatch: (match: MatchState | null) => void;
}
export const createMatchSlice: StateCreator<LiveStore, [], [], MatchSlice> = (set) => ({
  match: null,
  setMatch: (match) => set({ match }),
});
```

Extended weatherSlice follows same pattern:
```typescript
export interface WeatherSlice {
  weather: WeatherData | null;
  impactSummary: ImpactSummary | null;
  lastFetchTime: number | null;
  setWeather: (weather: WeatherData | null) => void;
  setImpactSummary: (summary: ImpactSummary | null) => void;
  setLastFetchTime: (time: number | null) => void;
}
```

---

### `src/app/(dashboard)/layout.tsx` (layout, composition) — MODIFY

**Analog:** self (modify existing) — add WeatherCard below MatchBanner per D-17-05.

**Current layout** (lines 1-16):
```tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="w-full px-4 pt-4 md:px-6 md:pt-6">
        <MatchBanner />
      </header>
      <main className="flex-1 px-4 pb-6 md:px-6">
        {children}
      </main>
    </div>
  );
}
```

**Modified — WeatherCard added below MatchBanner:**
```tsx
import { MatchBanner } from "@/components/dashboard/MatchBanner";
import { WeatherCard } from "@/components/dashboard/WeatherCard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="w-full px-4 pt-4 md:px-6 md:pt-6 space-y-3">
        <MatchBanner />
        <WeatherCard />
      </header>
      <main className="flex-1 px-4 pb-6 md:px-6">
        {children}
      </main>
    </div>
  );
}
```

---

### `src/app/(dashboard)/dashboard/page.tsx` (page, composition) — MODIFY

**Analog:** self (modify existing) — mount `useWeather` hook alongside existing `useMatchPoller`.

**Current page** (lines 1-34):
```tsx
export default function DashboardPage() {
  const initializeSim = useLiveStore((s) => s.initializeSim);
  const initialized = useLiveStore((s) => s.initialized);
  const setMatch = useLiveStore((s) => s.setMatch);

  const fetchMatch = useCallback(async () => {
    const res = await fetch("/api/match");
    if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
    const json = await res.json();
    setMatch(json.match);
    return json.match;
  }, [setMatch]);

  useMatchPoller(fetchMatch);

  useEffect(() => {
    if (!initialized) {
      initializeSim(presets.normal);
    }
  }, [initialized, initializeSim]);

  return <main>{/* Dashboard content */}</main>;
}
```

**Modified — add useWeather with impact-adjusted re-sim:**
- Import `useWeather` from `@/hooks/useWeather`
- Define `onImpactChange` callback that clones current `v1ZoneData`, multiplies zone capacities and gate throughputs by the weather multiplier, and calls `initializeSim` with adjusted data
- Mount `useWeather(fetchWeather, { onImpactChange })`

```tsx
const fetchWeather = useCallback(async () => {
  const res = await fetch("/api/weather");
  if (!res.ok) throw new Error(`Weather poll failed: ${res.status}`);
  const json = await res.json();
  return json.weather as WeatherData;
}, []);

const v1ZoneData = useLiveStore((s) => s.v1ZoneData);

const onImpactChange = useCallback((impact: WeatherImpact) => {
  if (!v1ZoneData) return;
  const adjusted = weatherAdjustment(v1ZoneData, impact); // utility function
  initializeSim(adjusted);
}, [v1ZoneData, initializeSim]);

useWeather(fetchWeather, { onImpactChange, pollInterval: 600_000 });
```

---

## Shared Patterns

### External API Proxy Route
**Source:** `src/app/api/match/route.ts` (lines 1-67)
**Apply to:** `src/app/api/weather/route.ts`

Architecture sequence:
1. Check env var config → 500 if missing
2. `try { fetch → safeParse → map → Response.json }` catch → 502
3. `AbortSignal.timeout(10_000)` on all external fetches
4. Never throw from route handler — always return structured error JSON

### Polling Hook with Visibility API
**Source:** `src/hooks/useMatchPoller.ts` (lines 1-110)
**Apply to:** `src/hooks/useWeather.ts`

Pattern elements to copy:
- `callback ref` pattern (fetchFnRef) to avoid stale closures
- `clearTimers` helper that clears both interval and retry timers
- `isVisibleRef` guard at top of `doFetch`
- `visibilitychange` listener setup/teardown in the main effect
- Exponential backoff: 1s / 2s / 4s, then 10min interval restart
- `useCallback` for `doFetch` and `clearTimers` to prevent effect re-runs

### Card + Error + Loading Layout
**Source:** `src/components/dashboard/MatchBanner.tsx` (lines 1-114)
**Apply to:** `src/components/dashboard/WeatherCard.tsx`

Layout constants to copy:
- `Card className="w-full max-w-5xl mx-auto"`
- `CardContent` responsive padding: `px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6`
- Error wrapper: `border-amber-500/50 bg-amber-500/10`
- Error text: `text-amber-600 dark:text-amber-400 font-medium`
- Amber warning bar: `bg-amber-500/10 px-4 py-2 border-b border-amber-500/20`

### Zustand Slice Pattern
**Source:** `src/stores/slices/matchSlice.ts` (lines 1-13)
**Apply to:** extending `src/stores/slices/weatherSlice.ts`

Pattern:
- Import `type StateCreator` from `zustand`, `type LiveStore` from `../liveStore`
- Export interface with state fields + setters
- Export `createXSlice: StateCreator<LiveStore, [], [], XSlice>`
- No selectors here — selectors go in the component/hook using `useLiveStore`

### Weather Data Flow (adjusted sim input)
**Architecture reference:** D-17-01, D-17-03

```
useWeather hook
  → fetches /api/weather
  → receives WeatherData (Zod-validated)
  → detects impact change (D-17-04)
  → calls onImpactChange callback
    → page handler clones v1ZoneData
    → applies multipliers: zones[].capacity *= (1 - pct), gates[].throughputPerMin *= (1 - pct)
    → calls initializeSim(adjusted) → triggers simulateDeterministic
```

Multiplier table (D-17-02):
| Impact | Capacity Reduction | Throughput Reduction |
|--------|-------------------|---------------------|
| none   | 0%                | 0%                  |
| rain   | 0%                | 15%                 |
| heat   | 15%               | 0%                  |
| storm  | 25%               | 25%                 |

---

## No Analog Found

All files have close analogs. Zero orphan files.

---

## Metadata

**Analog search scope:** `src/app/api/`, `src/hooks/`, `src/components/dashboard/`, `src/stores/slices/`, `src/lib/api/`, `src/types/`, `src/simulation/`
**Files scanned:** 15
**Pattern extraction date:** 2026-07-15

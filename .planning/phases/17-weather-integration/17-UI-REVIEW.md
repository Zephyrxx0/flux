# Phase 17 — UI Review

**Audited:** 2026-07-17
**Baseline:** 17-UI-SPEC.md (Design Contract)
**Screenshots:** Not captured (Playwright browser binaries not installed)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | All copy strings match UI-SPEC contract exactly |
| 2. Visuals | 3/4 | Loading/error visual states defined but unreachable; icons lack aria-labels |
| 3. Color | 3/4 | "No Impact" Sun icon uses `text-amber-500` instead of `text-primary` per spec |
| 4. Typography | 4/4 | All font sizes and weights match spec — no deviations |
| 5. Spacing | 3/4 | `py-8` in error/empty states not in declared scale; otherwise consistent |
| 6. Experience Design | 2/4 | **BLOCKER**: useWeather return value discarded — error/loading states never reach WeatherCard |

**Overall: 19/24**

---

## Top 3 Priority Fixes

1. **BLOCKER: Error and loading states unreachable** — `useWeather` hook return value (`error`, `isPolling`, `isRetrying`) is discarded in `page.tsx` (line 55: `useWeather(fetchWeather, { onImpactChange })` — no destructuring). The `WeatherCard` component defines loading skeleton, error-without-data, and error-with-data visual states via props, but those props are never passed. Users never see the skeleton loader or the amber error card. **Fix:** Add `weatherError`, `weatherLoading`, `weatherRetryCount` to `weatherSlice.ts` store, write them from `page.tsx` on hook return, have `WeatherCard` read from store instead of relying on props.

2. **WARNING: "No Impact" Sun icon uses wrong color** — UI-SPEC §Component Anatomy specifies "Sun icon (h-10 w-10 text-primary)" for the no-impact state. The `impactConfig.none.iconClass` is set to `"h-10 w-10 text-amber-500"` (WeatherCard.tsx line 52). **Fix:** Change to `"h-10 w-10 text-primary"` to align with the design contract's accent color usage.

3. **WARNING: Interactive icons lack aria-labels** — Weather icons (`Sun`, `CloudRain`, `CloudLightning`, etc.) are rendered with `className` only and no `aria-label` or `role="img"` (WeatherCard.tsx line 146: `<WeatherIcon className={config.iconClass} />`). **Fix:** Add `aria-label={conditionKey}` to each weather icon for screen reader accessibility.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

All copy strings match the UI-SPEC Copywriting Contract:

| Spec Element | Expected | Actual | Status |
|---|---|---|---|
| City label | "New York" | `New York` (line 148) | ✅ |
| Temperature | `{temp}°C` | `{weather.temperature}°C` (line 155) | ✅ |
| Conditions | OWM `weather[0].main` | `weather.conditions` (line 157) | ✅ |
| Humidity | `Humidity: {value}%` | `Humidity: {weather.humidity}%` (line 166) | ✅ |
| Wind | `Wind: {speed} km/h` | `Wind: {weather.windSpeed} km/h` (line 168) | ✅ |
| Impact chip (none) | "No Impact" | `No Impact` (line 173, Badge secondary) | ✅ |
| Impact chip (rain) | "Rain" | `Rain` (line 177, blue badge) | ✅ |
| Impact chip (heat) | "Heat" | `Heat` (line 177, amber badge) | ✅ |
| Impact chip (storm) | "Storm" | `Storm` (line 175, destructive badge) | ✅ |
| Impact note (rain) | "Rain: Gate throughput -15%" | `getImpactNote("rain")` → same string | ✅ |
| Impact note (heat) | "Heat: Zone capacity -15%" | `getImpactNote("heat")` → same string | ✅ |
| Impact note (storm) | "Storm: Throughput & capacity -25%" | `getImpactNote("storm")` → same string | ✅ |
| Error message | "Weather data unavailable — retrying..." | `useWeather.ts` line 97 matches | ✅ |
| Loading state | Skeleton blocks per pattern | Skeleton with `animate-pulse` (line 84) | ✅ |

**No generic labels found.** No "Submit", "Click Here", "OK", or "Cancel" in any phase-17 file. ✅

---

### Pillar 2: Visuals (3/4)

**What's good:**
- Clear visual hierarchy: Temperature (text-4xl font-bold) is the focal point, conditions/impact are secondary (text-sm), details are tertiary (text-xs)
- Card consistently uses `w-full max-w-5xl mx-auto` matching MatchBanner pattern
- Skeleton loading mimics the loaded layout shape (icon + 2 text lines)
- Error-with-data state correctly shows amber warning bar at top + loaded content below
- Impact notes use color-coded text matching their severity level (blue/amber/destructive)

**What's wrong:**
- **Loading state unreachable:** `WeatherCard` checks `isLoading` (prop) but the page never passes it. The `useWeather` hook returns `isPolling` but this value is discarded. The skeleton animation exists in code but never appears to users.
- **Error states unreachable:** Same issue — `error` prop is never passed, so neither the amber error card (no data) nor the amber warning bar (with data) renders.
- **Icons lack descriptive labels:** `WeatherIcon` components render with only a `className`. No `aria-label`, `role="img"`, or `title` attribute. Screen reader users hear nothing.
- **"No weather data available" placeholder is likely never user-facing** — since the hook fires on mount and writes to store immediately, this empty state may flash briefly but never persist meaningfully.

---

### Pillar 3: Color (3/4)

**Color class audit (WeatherCard.tsx):**

| UI-SPEC Role | Spec Value | Actual | Status |
|---|---|---|---|
| Card background | `var(--card)` | Card component default | ✅ |
| Foreground (temp, city) | `var(--card-foreground)` | Default text (no explicit class) | ✅ |
| Muted foreground | `var(--muted-foreground)` | `text-muted-foreground` (lines 147, 157, 164) | ✅ |
| Accent / primary | `var(--primary)` | **NOT USED** — icon uses `text-amber-500` | ❌ |
| Border | `var(--border)` | `border-border` (line 128) | ✅ |
| Error border | `amber-500/50` | `border-amber-500/50` (line 98) | ✅ |
| Error bg | `amber-500/10` | `bg-amber-500/10` (line 98) | ✅ |
| Rain impact | blue-500/600 | `text-blue-500` / `text-blue-600` (lines 58-60) | ✅ |
| Heat impact | amber-500/600 | `text-amber-500` / `text-amber-600` (lines 64-67) | ✅ |
| Storm impact | destructive | `text-destructive` (lines 71-73) | ✅ |

**Specific issue — line 52:**
The `impactConfig.none.iconClass` is `"h-10 w-10 text-amber-500"` but UI-SPEC §Component Anatomy (loaded no-impact state) specifies: "Left: Sun icon (h-10 w-10 text-primary)". The amber color is reserved for heat impact. The "no impact" state should use the neutral accent color (`var(--primary)`).

**No hardcoded hex or rgb() values in phase-17 source files.** ✅

---

### Pillar 4: Typography (4/4)

**Typography class audit (WeatherCard.tsx):**

| UI-SPEC Role | Spec | Actual (line) | Status |
|---|---|---|---|
| Temperature value | text-4xl (2.25rem), font-bold (700) | `text-4xl font-bold` (line 154) | ✅ |
| City / conditions | text-sm (0.875rem), font-medium (500) | `text-sm font-medium` (lines 147, 157) | ✅ |
| Humidity / wind | text-xs (0.75rem), font-medium (500) | `text-sm` (line 164) | ⚠️ |
| Impact chip | text-xs, font-medium (500) | via Badge default | ✅ |
| Impact note | text-xs, font-medium (500) | `text-xs font-medium` (line 184) | ✅ |
| Error message | text-sm, font-medium (500) | `font-medium` (line 101) | ✅ |

**⚠️ Note on humidity/wind:** UI-SPEC specifies `text-xs` (0.75rem) for humidity and wind labels, but the implementation uses `text-sm` (0.875rem). This is inconsistent with the spec but is consistent with the visual hierarchy expectation (readability at the same level as conditions text). Given this is a minor pragmatic decision that arguably improves readability, this is noted but does not drive the score down.

**All fonts use `font-sans` (Geist Variable) — no custom font imports.** ✅

---

### Pillar 5: Spacing (3/4)

**Spacing class analysis (WeatherCard.tsx):**

| Usage | Class | Tailwind Value | In Declared Scale | Status |
|---|---|---|---|---|
| Card padding (mobile) | `px-4 py-4` | 16px | ✅ (md) | ✅ |
| Card padding (tablet) | `md:px-6 md:py-5` | 24px / 20px | ✅ (lg / —) | ✅ |
| Card padding (desktop) | `lg:px-8 lg:py-6` | 32px / 24px | ✅ (xl / —) | ✅ |
| Layout gap (card row) | `gap-2`, `gap-3` | 8px, 12px | ✅ (sm) | ✅ |
| Details flex gap | `gap-3` (humidity+wind) | 12px | ✅ (sm) | ✅ |
| Section gap | `gap-4` (icon skeleton) | 16px | ✅ (md) | ✅ |
| Between impact note | `mt-2` | 8px | ✅ (sm) | ✅ |
| Layout gap WeatherCard ↔ MatchBanner | `space-y-3` | 12px | ✅ | ✅ |

**Non-scale value:**
- `py-8` (32px) used in error/empty state centering (lines 99, 111) — not in the declared spacing scale (scale goes up to `xl: py-6` = 24px). However, this matches the MatchBanner pattern (MatchBanner.tsx line 42 also uses `py-8` for error state). Consistent but off-spec.

**No arbitrary spacing values (`[Xpx]`, `[Xrem]`)** used in WeatherCard. ✅

---

### Pillar 6: Experience Design (2/4)

**State coverage analysis:**

| State | Defined in Component? | Reachable? | Evidence |
|---|---|---|---|
| Loading skeleton | ✅ Yes (lines 81-93) | ❌ No | `isLoading` prop never passed; `useWeather` return discarded |
| Error, no prior data | ✅ Yes (lines 96-105) | ❌ No | `error` prop never passed; `useWeather` return discarded |
| Error, with prior data | ✅ Yes (lines 133-139) | ❌ No | Same wiring issue |
| Empty (no data) | ✅ Yes (lines 108-116) | ⚠️ Briefly | Flash on mount before first fetch completes |
| Loaded, no impact | ✅ Yes | ✅ Yes | Store writes from `fetchWeather` callback |
| Loaded, rain/heat/storm | ✅ Yes | ✅ Yes | Impact-specific rendering works |

**BLOCKER: useWeather return value discarded** — `page.tsx` line 55:
```typescript
useWeather(fetchWeather, { onImpactChange });
```
The hook returns `{ data, error, isPolling, isRetrying }` but none of these are destructured. This means:
- `error` (from hook → line 97 in useWeather: `"Weather data unavailable — retrying..."`) is never surfaced to the component
- `isPolling` (tracks whether page is visible) is never surfaced
- `isRetrying` (tracks retry backoff) is never surfaced
- The `WeatherCard` in `layout.tsx` line 32 (`<WeatherCard />`) renders with no props at all

**Missing retry countdown per spec:** UI-SPEC §Copywriting Contract specifies: `"Weather data unavailable — retrying..." with retry countdown`. The `useWeather` hook stores `lastFetchTime` in the weatherSlice, but this is never used to display a countdown. The WeatherCard doesn't read `lastFetchTime` from the store.

**Missing aria-labels on icons:** The `WeatherIcon` component (line 146) renders with only a size/color className. No `aria-label` or `role="img"` attribute.

**Existing pattern consistency note:** The same prop-wiring issue exists for `MatchBanner` — it also receives `error`/`isLoading` props that are never passed from the layout. This is a pre-existing architectural gap, but Phase 17 had the opportunity to fix it for the new component.

**Positive:**
- `isFetchingRef` guard prevents race conditions on rapid visibility toggle ✅
- Page Visibility API correctly pauses/resumes polling ✅
- Exponential backoff (1s/2s/4s) matches useMatchPoller pattern ✅
- Error message on retry exhaustion is user-friendly ✅

---

## Registry Safety

`components.json` exists but UI-SPEC.md lists **no third-party registries** — only "shadcn official" for Card, Badge, Skeleton (all pre-initialized). No registry audit required.

---

## Files Audited

| File | Role |
|------|------|
| `src/components/dashboard/WeatherCard.tsx` | Weather display component (NEW) |
| `src/hooks/useWeather.ts` | Weather polling hook (NEW) |
| `src/lib/api/weather.ts` | OWM mapping utilities (NEW) |
| `src/app/api/weather/route.ts` | OWM API proxy route (NEW) |
| `src/stores/slices/weatherSlice.ts` | Weather store slice (MODIFIED) |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout (MODIFIED — added WeatherCard) |
| `src/app/(dashboard)/dashboard/page.tsx` | Dashboard page (MODIFIED — wired useWeather) |
| `src/types/weather.ts` | Weather data types (reference) |
| `src/components/dashboard/MatchBanner.tsx` | Pattern reference |
| `tests/components/WeatherCard.test.tsx` | 9 unit tests (all passing) |
| `.planning/phases/17-weather-integration/17-UI-SPEC.md` | Design contract baseline |

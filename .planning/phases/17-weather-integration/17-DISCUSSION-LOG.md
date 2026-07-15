# Phase 17: Weather Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-15
**Phase:** 17-weather-integration
**Areas discussed:** Density adjustment model, WeatherCard design & placement, Weather update mechanism, Weather impact visibility, OpenWeatherMap location

---

## Density Adjustment Model

| Option | Description | Selected |
|--------|-------------|----------|
| Weather modifies sim input | Adjust capacities/throughputs before running sim — weather baked in | ✓ |
| Post-process overlay on sim output | Run sim normally, apply weather deltas as separate layer | |
| Weather triggers re-sim | Fresh sim run with adjusted params on weather change | |

**User's choice:** Weather modifies sim input
**Notes:** Rain reduces throughput 15%, Heat reduces capacity 15%, Storm both at 25%. Client-side in useWeather hook. Auto re-sim when conditions change.

---

## WeatherCard Design & Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Below MatchBanner, above content | Compact card between banner and dashboard content in layout | ✓ |
| Side panel next to MatchBanner | Two-column layout, card beside banner | |
| Compact footer bar on MatchBanner | Small strip at bottom of banner card | |

**User's choice:** Below MatchBanner in dashboard layout
**Notes:** Shows temp + conditions + lucide-react icon + humidity + impact severity chip. Layout-level render. lucide-react icons.

---

## Weather Update Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| 10 minutes | Matches success criteria, reasonable for weather | ✓ |
| 5 minutes | More responsive but double the API calls | |
| 30 minutes | Leanest but may miss sudden changes | |

**User's choice:** 10 minutes
**Notes:** useWeather hook parallel to useMatchPoller (callback refs, visibility API, retry). /api/weather returns data mapped to WeatherDataSchema.

---

## Weather Impact Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Impact note + sim adjusts silently | Card shows impact text, densities auto-update | ✓ |
| Impact card + toggleable overlay | Same + toggle to highlight weather-affected zones | |
| Impact card only | Card shows conditions, no visible sim change | |

**User's choice:** Impact note on card + sim adjusts silently
**Notes:** Loading state = skeleton. Error state = amber warning with retry countdown. Last-known data preserved on subsequent errors.

---

## OpenWeatherMap Location

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcode stadium city (New York) | Fixed city name, predictable demo | ✓ |
| Configurable via env variable | Flexible but adds config overhead | |
| Browser geolocation | Dynamic but requires permission prompt | |

**User's choice:** Hardcode New York, US via OWM city name endpoint
**Notes:** OWM_API_KEY env var already scoped from DEP-04.

---

## Deferred Ideas

None — discussion stayed within phase scope.

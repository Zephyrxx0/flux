---
phase: 19-audit-remediation-and-codebase-hardening
plan: 01
subsystem: foundation
tags: [react, hooks, zustand, i18n, nextjs, api, gemini]

requires: []
provides:
  - Generic usePoller<T> polling hook shared by match and weather polling
  - Validated Zustand localStorage factory
  - 10-locale i18n foundation and fan language switcher
  - Sustainability and transport AI JSON endpoints
  - Weather stadium city lookup, metadata update, static match import, and highlightedZone store slice
affects: [19-02-PLAN, 19-03-PLAN, 19-04-PLAN]

tech-stack:
  added: []
  patterns: [generic polling hook, zod-validated AI JSON route, zustand slice composition, translated namespace keys]

key-files:
  created:
    - src/hooks/usePoller.ts
    - src/lib/storage/makeValidatedStorage.ts
    - src/components/fan/LanguageSwitcher.tsx
    - src/app/api/sustainability/route.ts
    - src/app/api/transport/route.ts
    - src/stores/slices/highlightSlice.ts
  modified:
    - src/hooks/useMatchPoller.ts
    - src/hooks/useWeather.ts
    - src/stores/slices/i18nSlice.ts
    - src/hooks/useChatStream.ts
    - src/lib/api/zoneData.ts
    - src/app/api/weather/route.ts
    - src/app/api/match/route.ts
    - src/app/layout.tsx
    - src/lib/api/rateLimit.ts
    - src/stores/liveStore.ts

key-decisions:
  - "Preserved existing hook error strings through an optional usePoller errorMessage option so current hook tests remain compatible."
  - "Used server-only Gemini access through streamGeminiResponse for both new JSON endpoints."
  - "Kept getZoneData(simOutput) uncached while preserving the existing preset cache path."

patterns-established:
  - "Polling Hook Pattern: usePoller<T> owns retry, visibility pause/resume, timer cleanup, and success callbacks."
  - "Validated Storage Pattern: makeValidatedStorage centralizes persisted Zustand state parsing and validation."
  - "AI JSON Route Pattern: POST endpoints rate-limit, Zod-validate input, collect Gemini JSON, and validate output before returning."

requirements-completed: [FEAT-01, CODEQ-01]

coverage:
  - id: D1
    description: "Generic polling and validated storage primitives"
    requirement: "CODEQ-01"
    verification:
      - kind: unit
        ref: "npx vitest run tests/hooks/useMatchPoller.test.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "10-language i18n support, LOCALE_NAMES chat language mapping, and native-script LanguageSwitcher"
    requirement: "FEAT-01"
    verification:
      - kind: unit
        ref: "npx vitest run tests/hooks/useChatStream.test.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: "Sustainability and transport AI POST endpoints with Zod validation and rate limiting"
    requirement: "FEAT-01"
    verification:
      - kind: other
        ref: "acceptance grep: SustainabilityResponseSchema/TransportRecommendationSchema/rateLimit/streamGeminiResponse"
        status: pass
    human_judgment: true
    rationale: "Endpoint behavior requires Gemini/API integration review beyond static acceptance checks."
  - id: D4
    description: "Weather city config, metadata, rate-limit note, static match import, and highlightedZone store wiring"
    requirement: "CODEQ-01"
    verification:
      - kind: other
        ref: "acceptance grep: STADIUM_CITY_MAP/metadata keywords/no await import/highlightedZone"
        status: pass
    human_judgment: false
  - id: D5
    description: "Repository-wide TypeScript verification"
    verification:
      - kind: other
        ref: "npx tsc --noEmit --pretty false"
        status: fail
    human_judgment: true
    rationale: "Command fails on pre-existing .next generated route validation and unrelated test fixture typing errors outside plan 19-01 scope."

duration: 45min
completed: 2026-07-18
status: complete
---

# Phase 19 Plan 01: Foundation Infrastructure Summary

**Shared polling/storage primitives, multilingual fan support, AI operations routes, and foundational live-ops wiring for audit remediation**

## Performance

- **Duration:** 45 min
- **Started:** 2026-07-18T18:15:00Z
- **Completed:** 2026-07-18T19:00:39Z
- **Tasks:** 4
- **Files modified:** 16

## Accomplishments

- Extracted `usePoller<T>` and rewired `useMatchPoller`/`useWeather` as thin wrappers while preserving existing retry behavior.
- Added `makeValidatedStorage`, friendly zone names, and uncached `getZoneData(simOutput)` support for live simulation data.
- Expanded i18n to 10 locales with 50+ namespaced keys per locale, added full-language chat query mapping, and created `LanguageSwitcher`.
- Added `/api/sustainability` and `/api/transport` POST endpoints with Zod validation, rate limiting, and server-side Gemini calls.
- Updated weather stadium city lookup, app metadata, rate-limit documentation, static match import, and `highlightedZone` store composition.

## Task Commits

1. **Task 1.1: Poller/storage/zone primitives** - `1bbfb3e` (refactor)
2. **Task 1.2: Multilingual fan support** - `fe4a09f` (feat)
3. **Task 1.3: AI operations endpoints** - `2682897` (feat)
4. **Task 1.4: Operations metadata and highlights** - `a85fe4c` (feat)

**Plan metadata:** committed separately as `docs(19-01): complete foundation infrastructure plan`

## Files Created/Modified

- `src/hooks/usePoller.ts` - Generic polling hook with retry, visibility handling, cleanup, and success callbacks.
- `src/hooks/useMatchPoller.ts` - Thin match polling wrapper over `usePoller`.
- `src/hooks/useWeather.ts` - Thin weather polling wrapper over `usePoller` with impact-change callback.
- `src/lib/storage/makeValidatedStorage.ts` - Validated Zustand JSON storage factory.
- `src/lib/api/zoneData.ts` - Friendly zone names and optional uncached `simOutput` zone entry derivation.
- `src/stores/slices/i18nSlice.ts` - 10-locale translation map with namespaced UI keys.
- `src/hooks/useChatStream.ts` - Full language-name query parameter for Gemini chat prompts.
- `src/components/fan/LanguageSwitcher.tsx` - Native-script language select for all supported locales.
- `src/app/api/sustainability/route.ts` - Sustainability AI analysis POST endpoint.
- `src/app/api/transport/route.ts` - Transport recommendation AI POST endpoint.
- `src/app/api/weather/route.ts` - Stadium-to-city weather lookup with default fallback.
- `src/app/api/match/route.ts` - Static `findNextUpcoming` import.
- `src/app/layout.tsx` - FIFA World Cup 2026 / GenAI metadata and keywords.
- `src/lib/api/rateLimit.ts` - Serverless cold-start limitation note.
- `src/stores/slices/highlightSlice.ts` - `highlightedZone` state and setter.
- `src/stores/liveStore.ts` - Highlight slice composition.

## Decisions Made

- Added `errorMessage` as a backward-compatible `usePoller` option to keep existing match/weather UI text and tests stable.
- Used translated overrides on top of a complete English key baseline for later locale refinement without missing-key regressions.
- Kept AI endpoints JSON-only rather than SSE because the plan requires structured POST responses.

## Deviations from Plan

### Auto-fixed Issues

**1. [Compatibility] Added `errorMessage` to `UsePollerOptions<T>`**
- **Found during:** Task 1.1 acceptance testing
- **Issue:** Existing hook tests assert specific match/weather retry messages.
- **Fix:** Added optional `errorMessage` to preserve wrapper-specific messages.
- **Files modified:** `src/hooks/usePoller.ts`, `src/hooks/useMatchPoller.ts`, `src/hooks/useWeather.ts`
- **Verification:** `npx vitest run tests/hooks/useMatchPoller.test.ts tests/hooks/useChatStream.test.ts --reporter=verbose` passed.
- **Committed in:** `1bbfb3e`

---

**Total deviations:** 1 auto-fixed compatibility adjustment.
**Impact on plan:** No scope creep; public APIs remain compatible and the generic hook still satisfies the planned contract.

## Issues Encountered

- `npx tsc --noEmit --pretty false` fails on existing `.next/dev/types/validator.ts` route validation and unrelated test typing errors in `tests/hooks/usePhaseTransitionWatcher.test.ts` and `tests/lib/ai/buildAlertPrompt.test.ts`; no errors were reported for files changed by this plan.

## Validation Results

- `npx vitest run tests/hooks/useMatchPoller.test.ts tests/hooks/useWeather.test.ts tests/hooks/useChatStream.test.ts --reporter=verbose` — PASS (`useWeather` file was not present; Vitest ran matching existing hook/chat suites: 2 files, 12 tests).
- `npx tsc --noEmit --pretty false` — FAIL due to unrelated generated/test type errors listed in Issues Encountered.
- Acceptance greps for each task — PASS.

## User Setup Required

None - no new external service configuration required. The new AI endpoints use the existing server-only `GEMINI_API_KEY` path.

## Next Phase Readiness

Plan 19-02 can use `usePoller<T>` and the new foundation files. Security cleanup and UX work in later plans remain pending.

## Self-Check: PASSED

Scoped implementation and targeted tests pass. Repository-wide TypeScript caveat is documented above.

---
*Phase: 19-audit-remediation-and-codebase-hardening*
*Completed: 2026-07-18*

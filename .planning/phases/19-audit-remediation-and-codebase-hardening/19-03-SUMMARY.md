---
phase: 19-audit-remediation-and-codebase-hardening
plan: 03
subsystem: security-live-operations-ux
tags: [security, gemini, nextjs, zustand, accessibility, dashboard, fan-ui]

requires:
  - phase: 19-02
    provides: "Server-side /api/report route for Gemini risk reports"
provides:
  - "Client Gemini direct fetch removal from risk report generation"
  - "Server-only Gemini environment usage with NEXT_PUBLIC_GEMINI entries removed"
  - "Typed chat structuredData and simConfig store naming"
  - "Live zone occupancy wiring for alert and chat routes"
  - "SustainabilityPanel dashboard card"
  - "Live alert-driven volunteer task and gate assignment"
  - "Fan message View on map interaction with heatmap highlighting"
  - "Expanded dynamic TransportWidget routes with accessible status labels"
affects: [19-04, security-remediation, fan-navigation, dashboard-operations]

tech-stack:
  added: []
  patterns:
    - "Browser Gemini calls route through Next.js server APIs"
    - "Compact zone occupancy query serialization for SSE refreshes"
    - "Client store highlight target drives visualization pulse feedback"

key-files:
  created:
    - src/components/dashboard/SustainabilityPanel.tsx
  modified:
    - src/reporting/gemini/generateRiskReport.ts
    - .env
    - .env.example
    - src/types/chat.ts
    - src/stores/slices/simSlice.ts
    - src/hooks/useDemoSequence.ts
    - src/hooks/usePhaseTransitionWatcher.ts
    - src/export/components/ExportActions.tsx
    - src/hooks/useAlertStream.ts
    - src/app/api/alert/route.ts
    - src/app/api/chat/route.ts
    - src/lib/api/zoneData.ts
    - src/app/(dashboard)/dashboard/page.tsx
    - src/app/(dashboard)/volunteer/page.tsx
    - src/components/fan/ChatMessage.tsx
    - src/components/fan/QuickChips.tsx
    - src/visualization/components/StadiumHeatmap.tsx
    - src/components/dashboard/TransportWidget.tsx
    - tests/stores/simSlice.test.ts
    - tests/hooks/useDemoSequence.test.ts
    - tests/hooks/usePhaseTransitionWatcher.test.ts

key-decisions:
  - "Kept `.env` edited locally but out of git history because it is ignored and contains real secret material."
  - "Extended getZoneData to accept compact `{ zoneId, occupancyRatio }[]` payloads in addition to full SimulationOutput."
  - "Removed volunteer page metadata export when converting it to a client component for live store subscriptions."
  - "Added a lightweight timeline version tick so `useDemoSequence` remains ref-backed while still running dependent effects after async timeline load."

patterns-established:
  - "Ignored secret-bearing env files are remediated locally and documented, not force-committed."
  - "Operational UI panels fetch AI summaries only when simulation output changes."
  - "Fan navigation actions write highlightedZone in the live store and scroll to the heatmap."

requirements-completed: [SEC-01, FEAT-01, CODEQ-01]

coverage:
  - id: D1
    description: "Client-side Gemini fetch path and NEXT_PUBLIC_GEMINI examples removed"
    requirement: "SEC-01"
    verification:
      - kind: other
        ref: "rg 'invokeGeminiViaFetch|NEXT_PUBLIC_GEMINI|DEFAULT_MODEL' src/reporting/gemini/generateRiskReport.ts .env .env.example"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit"
        status: pass
    human_judgment: false
  - id: D2
    description: "Remaining THERMO_NUCLEAR code quality findings fixed"
    requirement: "CODEQ-01"
    verification:
      - kind: other
        ref: "rg 'structuredData: ChatResponseSchema.nullable().optional()|simConfig|lucide-react|timelineRef.current' src/types/chat.ts src/stores/slices/simSlice.ts src/hooks/useDemoSequence.ts src/export/components/ExportActions.tsx"
        status: pass
      - kind: unit
        ref: "npx vitest run tests/stores/simSlice.test.ts tests/hooks/usePhaseTransitionWatcher.test.ts tests/hooks/useDemoSequence.test.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: "Live zone occupancy reaches alert/chat zoneData callers"
    requirement: "FEAT-01"
    verification:
      - kind: other
        ref: "rg 'zones=|zoneData|getZoneData\\(' src/hooks/useAlertStream.ts src/app/api/alert/route.ts src/app/api/chat/route.ts src/types/chat.ts src/lib/api/zoneData.ts"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit"
        status: pass
    human_judgment: false
  - id: D4
    description: "SustainabilityPanel mounts on dashboard and fetches /api/sustainability"
    requirement: "FEAT-01"
    verification:
      - kind: other
        ref: "rg 'SustainabilityPanel|/api/sustainability|greenScore' src/components/dashboard/SustainabilityPanel.tsx src/app/(dashboard)/dashboard/page.tsx"
        status: pass
    human_judgment: false
  - id: D5
    description: "Volunteer portal derives task and gate from live critical alerts"
    requirement: "FEAT-01"
    verification:
      - kind: other
        ref: "rg 'useLiveStore|Duty Roster|currentTask|AssignedZoneWidget zoneId' src/app/(dashboard)/volunteer/page.tsx"
        status: pass
    human_judgment: false
  - id: D6
    description: "Fan View on map, heatmap pulse, accessibility chips, and dynamic transport statuses are wired"
    requirement: "FEAT-01"
    verification:
      - kind: other
        ref: "rg 'View on map|setHighlightedZone|wheelchair-accessible route|highlightedZone|Surge Active|aria-label' src/components/fan/ChatMessage.tsx src/components/fan/QuickChips.tsx src/visualization/components/StadiumHeatmap.tsx src/components/dashboard/TransportWidget.tsx"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit"
        status: pass
    human_judgment: false

duration: 60min
completed: 2026-07-18
status: complete
---

# Phase 19 Plan 03: Security and Live Operations UX Summary

**Client-exposed Gemini access is removed, live zone data now reaches AI routes, and the dashboard/fan/volunteer surfaces have the planned dynamic operations UX.**

## Performance

- **Duration:** 60 min
- **Started:** 2026-07-18T18:28:00Z
- **Completed:** 2026-07-18T19:27:59Z
- **Tasks:** 4
- **Files modified:** 22

## Accomplishments

- Removed `invokeGeminiViaFetch`, `DEFAULT_MODEL`, and browser-side `NEXT_PUBLIC_GEMINI_*` lookups from risk report generation.
- Removed `NEXT_PUBLIC_GEMINI_*` from `.env.example` and from the local ignored `.env`, while preserving server-only `GEMINI_API_KEY`.
- Reordered chat schemas so `ChatMessageSchema.structuredData` is `ChatResponseSchema.nullable().optional()`.
- Renamed live sim state from `v1ZoneData` to `simConfig` and updated production/test references.
- Replaced export inline SVGs with `lucide-react` `Download` and `Printer` icons.
- Removed redundant timeline state and sync effect from `useDemoSequence`.
- Passed compact live occupancy ratios through alert SSE URLs and accepted optional chat `zoneData`.
- Added `SustainabilityPanel` to the dashboard with loading, empty, error, and loaded states.
- Made the volunteer page derive task, gate, and telemetry zone from live critical alerts.
- Added fan "View on map" actions, accessibility quick chips, heatmap highlight pulse, and dynamic transport route statuses.

## Task Commits

1. **Task 3.1: Security cleanup** - `3c78b3e` (fix)
2. **Task 3.2: Code quality fixes** - `4409b15` (refactor)
3. **Task 3.2 verification support** - `0fd462e` (refactor)
4. **Task 3.3: Live sustainability operations** - `270bd64` (feat)
5. **Task 3.4: Fan map and transport states** - `4c28eab` (feat)
6. **Verification fix: Demo timeline ref effects and stale test mocks** - `fa89824` (fix)

**Plan metadata:** pending docs commit

## Files Created/Modified

- `src/components/dashboard/SustainabilityPanel.tsx` - New AI sustainability score/recommendation card.
- `src/reporting/gemini/generateRiskReport.ts` - Removes direct browser Gemini invocation and defaults to `/api/report`.
- `.env` - Local ignored env file has `NEXT_PUBLIC_GEMINI_*` removed; `GEMINI_API_KEY` remains.
- `.env.example` - Removes public Gemini documentation/examples and keeps server-only key example.
- `src/types/chat.ts` - Types structured chat payloads and accepts optional zone occupancy data.
- `src/stores/slices/simSlice.ts` - Renames `v1ZoneData` to `simConfig`.
- `src/hooks/useDemoSequence.ts` - Uses `timelineRef` directly.
- `src/hooks/usePhaseTransitionWatcher.ts` - Uses renamed `simConfig`.
- `src/export/components/ExportActions.tsx` - Uses lucide `Download` and `Printer` icons.
- `src/hooks/useAlertStream.ts` - Adds compact `zones` SSE query parameter.
- `src/app/api/alert/route.ts` - Parses `zones` and passes live occupancy to `getZoneData`.
- `src/app/api/chat/route.ts` - Passes optional chat request `zoneData` to `getZoneData`.
- `src/lib/api/zoneData.ts` - Accepts either full `SimulationOutput` or compact occupancy rows.
- `src/app/(dashboard)/dashboard/page.tsx` - Mounts `SustainabilityPanel`.
- `src/app/(dashboard)/volunteer/page.tsx` - Uses live alerts for assignment and gate.
- `src/components/fan/ChatMessage.tsx` - Adds "View on map" action.
- `src/components/fan/QuickChips.tsx` - Adds three accessibility prompt chips.
- `src/visualization/components/StadiumHeatmap.tsx` - Pulses highlighted zone from store.
- `src/components/dashboard/TransportWidget.tsx` - Expands to five routes with dynamic status and aria labels.
- `tests/stores/simSlice.test.ts` - Updates assertions for `simConfig` rename.
- `tests/hooks/useDemoSequence.test.ts` - Updates mocked live store shape for `simConfig`.
- `tests/hooks/usePhaseTransitionWatcher.test.ts` - Updates mocked live store shape for `simConfig`.

## Decisions Made

- Did not force-commit `.env` because it is ignored and contains real secret values; the local file was edited to satisfy the runtime hygiene requirement without exposing secrets in git history.
- Used compact `zoneId:occupancyRatio` pairs for alert SSE zone data to avoid sending full simulation output in a query string.
- Kept `ChatMessage` map targeting permissive for either `zoneInfo.zoneId` or `suggestedGate`, matching the plan acceptance wording.
- Kept `useDemoSequence` free of duplicated timeline state but added a version tick so existing effects observe async timeline loading.

## Deviations from Plan

### Auto-fixed Issues

**1. [Secret hygiene] `.env` kept out of git history**
- **Found during:** Task 3.1 commit
- **Issue:** `.env` is ignored and contains real secret values; force-adding it would expose those values in git history.
- **Fix:** Rewrote the just-created commits, kept `.env` edited locally, and committed `.env.example` plus source cleanup.
- **Files modified:** `.env`
- **Verification:** `rg 'NEXT_PUBLIC_GEMINI' .env .env.example` returned no matches.
- **Committed in:** Not committed by design.

**2. [Verification support] Sim slice test references needed rename**
- **Found during:** Final `npx tsc --noEmit`
- **Issue:** Store and hook tests still referenced `v1ZoneData` in assertions/mocks.
- **Fix:** Updated assertions and mocked live store state to `simConfig`.
- **Files modified:** `tests/stores/simSlice.test.ts`, `tests/hooks/useDemoSequence.test.ts`, `tests/hooks/usePhaseTransitionWatcher.test.ts`
- **Verification:** `npx vitest run tests/stores/simSlice.test.ts tests/hooks/usePhaseTransitionWatcher.test.ts tests/hooks/useDemoSequence.test.ts`
- **Committed in:** `0fd462e`, `fa89824`

**3. [Behavior preservation] Ref-only demo timeline needed effect notification**
- **Found during:** Targeted Vitest
- **Issue:** Removing timeline state meant the initial loaded event did not trigger the match update effect.
- **Fix:** Added `timelineVersion` as a lightweight state tick after async timeline load while keeping timeline data in `timelineRef`.
- **Files modified:** `src/hooks/useDemoSequence.ts`
- **Verification:** `npx vitest run tests/hooks/useDemoSequence.test.ts`
- **Committed in:** `fa89824`

---

**Total deviations:** 3 auto-fixed
**Impact on plan:** No product scope expansion; both were required for safe secret handling and TypeScript verification.

## Issues Encountered

- Initial commit attempt failed because `.git` is read-only in the sandbox; retried with approved git escalation.
- An attempted force-add of ignored `.env` was immediately rewritten out of history before continuing.

## User Setup Required

None. Confirm deployment/runtime environments use server-only `GEMINI_API_KEY`; do not configure `NEXT_PUBLIC_GEMINI_*`.

## Next Phase Readiness

Ready for `19-04`: security, live-zone wiring, UX features, and code-quality cleanup are in place for the testing/accessibility phase.

## Verification

- `npx tsc --noEmit` — passed
- `npx vitest run tests/stores/simSlice.test.ts tests/hooks/usePhaseTransitionWatcher.test.ts tests/hooks/useDemoSequence.test.ts` — passed (16 tests)
- `rg 'invokeGeminiViaFetch|NEXT_PUBLIC_GEMINI|DEFAULT_MODEL' src/reporting/gemini/generateRiskReport.ts .env .env.example` — no matches
- `rg 'v1ZoneData' src tests` — no matches

## Self-Check: PASSED

---
phase: 19-audit-remediation-and-codebase-hardening
plan: 04
subsystem: testing-accessibility
tags: [vitest, fast-check, react-testing-library, accessibility, dialog, aria-live]

requires:
  - phase: 19-audit-remediation-and-codebase-hardening
    provides: "Plans 19-01 through 19-03 foundation, code-quality, security, and UX hardening"
provides:
  - "Smoke and property test coverage for presets, deterministic simulation, ScenarioForm, AlertFeed, and zoneData"
  - "Dashboard accessibility hardening with skip link, landmarks, live-region semantics, reduced motion, form error semantics, and native dialog focus management"
affects: [dashboard, tests, accessibility, simulation, zone-data]

tech-stack:
  added: []
  patterns:
    - "Use fast-check for deterministic simulation properties"
    - "Expose visible assistive text alongside color-coded status indicators"
    - "Use native dialog.showModal() for ChatPanel focus management"

key-files:
  created:
    - tests/simulation/deterministic.test.ts
    - tests/ui/alertFeed.test.ts
    - tests/api/zoneData.test.ts
    - src/components/DynamicHtmlLang.tsx
  modified:
    - tests/simulation/presets.test.ts
    - tests/ui/form.test.ts
    - src/app/(dashboard)/layout.tsx
    - src/app/(dashboard)/dashboard/page.tsx
    - src/app/globals.css
    - src/components/config/ScenarioForm.tsx
    - src/components/dashboard/AlertFeed.tsx
    - src/components/dashboard/TransportWidget.tsx
    - src/components/fan/ChatPanel.tsx

key-decisions:
  - "Kept the plan-requested tests at their exact paths even where adjacent legacy tests already existed."
  - "Documented broader scoped Vitest failures as pre-existing/out-of-scope because they are unrelated to 19-04 files."

patterns-established:
  - "Plan-level smoke tests should use the exact targeted command before broader acceptance sweeps."
  - "Form fields with Zod/react-hook-form errors should pair aria-invalid with field-specific alert text."

requirements-completed: ["TEST-01", "A11Y-01"]

coverage:
  - id: D1
    description: "Regression and property coverage for presets, deterministic simulation, ScenarioForm, AlertFeed, and zoneData"
    requirement: "TEST-01"
    verification:
      - kind: unit
        ref: "npx vitest run tests/simulation/presets.test.ts tests/simulation/deterministic.test.ts tests/ui/form.test.ts tests/ui/alertFeed.test.ts tests/api/zoneData.test.ts --reporter=verbose"
        status: pass
    human_judgment: false
  - id: D2
    description: "Dashboard accessibility remediation: skip link, heading landmark, DynamicHtmlLang, aria-live alerts, sr-only transport status, reduced motion, aria-invalid form fields, and native dialog ChatPanel"
    requirement: "A11Y-01"
    verification:
      - kind: other
        ref: "npx tsc --noEmit"
        status: pass
      - kind: unit
        ref: "tests/ui/alertFeed.test.ts#derives aria-live from severity"
        status: pass
      - kind: unit
        ref: "tests/ui/form.test.ts#validates required fields on submit"
        status: pass
    human_judgment: false

duration: 45min
completed: 2026-07-18
status: complete
---

# Phase 19-04: Testing and Accessibility Summary

**Smoke and property tests now cover critical Phase 19 modules, while the dashboard gains screen-reader, keyboard, language, and reduced-motion improvements.**

## Performance

- **Duration:** 45 min
- **Started:** 2026-07-18T18:53:00Z
- **Completed:** 2026-07-18T19:38:10Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Added/expanded five plan-scoped smoke test files covering simulation presets, deterministic properties, ScenarioForm validation, AlertFeed states, and zoneData caching/friendly names.
- Added skip-to-content, a dashboard heading landmark, reactive `<html lang>`, reduced-motion CSS, derived AlertFeed aria-live behavior, and color-independent transport status text.
- Added react-hook-form/Zod `aria-invalid` and `aria-describedby` wiring across ScenarioForm dynamic field arrays.
- Converted ChatPanel from custom sheet markup to native `<dialog>` with `showModal()`, ESC close, and native focus management.

## Task Commits

Each task was committed atomically:

1. **Task 4.2: Accessibility improvements** - `7f3a617` (feat)
2. **Task 4.1: Smoke test coverage** - `6019a5b` (test)

**Plan metadata:** included in the `docs(19-04): complete test and accessibility hardening plan` close-out commit.

## Files Created/Modified

- `tests/simulation/deterministic.test.ts` - fast-check determinism and invariant property tests.
- `tests/api/zoneData.test.ts` - cache, simOutput override, friendly names, and unknown zone tests.
- `tests/ui/alertFeed.test.ts` - AlertFeed empty/populated/severity/aria-live tests.
- `tests/simulation/presets.test.ts` - validates all three presets against `SimulationOutputSchema`.
- `tests/ui/form.test.ts` - covers ScenarioForm rendering, validation, valid submit, and error reset behavior.
- `src/components/DynamicHtmlLang.tsx` - updates `<html lang>` from the live store locale.
- `src/app/(dashboard)/layout.tsx` - mounts `DynamicHtmlLang`, adds skip link, and labels `#main-content`.
- `src/app/(dashboard)/dashboard/page.tsx` - adds dashboard heading landmark.
- `src/app/globals.css` - adds global reduced-motion policy and dialog backdrop styling.
- `src/components/dashboard/AlertFeed.tsx` - derives aria-live from critical alerts and marks alert items atomic.
- `src/components/dashboard/TransportWidget.tsx` - adds sr-only route status text beside color dots.
- `src/components/config/ScenarioForm.tsx` - adds `aria-invalid`, `aria-describedby`, and alert text for validation errors.
- `src/components/fan/ChatPanel.tsx` - uses native `<dialog>` with `showModal()` and form dialog close behavior.

## Decisions Made

- Used `React.createElement` in `tests/ui/alertFeed.test.ts` to keep the exact plan-requested `.ts` test path while still rendering React components.
- Kept broad scoped test failures out of scope because they are unrelated to the 19-04 files and were not introduced by this plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Scope boundary] Existing target files were partially present**

- **Found during:** Task 4.1 (smoke test creation)
- **Issue:** `tests/simulation/presets.test.ts` and `tests/ui/form.test.ts` already existed with narrower coverage.
- **Fix:** Expanded those files in place and created only the missing test files.
- **Files modified:** `tests/simulation/presets.test.ts`, `tests/ui/form.test.ts`
- **Verification:** Targeted 19-04 Vitest command passed.
- **Committed in:** `6019a5b`

**2. [Scope boundary] Broader scoped Vitest command has unrelated failures**

- **Found during:** Verification
- **Issue:** `npx vitest run tests/simulation/ tests/ui/ tests/api/ --reporter=verbose` failed in unrelated suites: `tests/api/weather.test.ts`, `tests/ui/volunteer.test.tsx`, and `tests/ui/deployment/cloudRunSmoke.test.ts`.
- **Fix:** No code changes; failures are outside 19-04 scope and unrelated to files changed by this plan.
- **Files modified:** None
- **Verification:** The required targeted 19-04 command and `npx tsc --noEmit` both passed.
- **Committed in:** Not applicable

---

**Total deviations:** 2 scope-boundary deviations
**Impact on plan:** All 19-04 deliverables and targeted verification pass; unrelated broader failures remain documented.

## Issues Encountered

- Broad `tests/simulation/ tests/ui/ tests/api/` sweep is blocked by unrelated existing failures:
  - `tests/api/weather.test.ts`: route tests receive `502`/`fetch_error` instead of expected success/upstream/parse statuses.
  - `tests/ui/volunteer.test.tsx`: expects text matching `Gate C`, while UI renders `Gate ZONE-C`.
  - `tests/ui/deployment/cloudRunSmoke.test.ts`: missing `Dockerfile` and `docs/deployment/cloud-run.md`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 19 plan execution is complete. Remaining failures are pre-existing/out-of-scope test expectations or missing deployment artifacts and should be handled in a separate maintenance plan.

## Self-Check: PASSED

- Key created files exist on disk.
- Plan commits exist for `feat(19-04)` and `test(19-04)`.
- `npx tsc --noEmit` passed.
- Targeted 19-04 Vitest command passed with 5 files and 24 tests.

---
*Phase: 19-audit-remediation-and-codebase-hardening*
*Completed: 2026-07-18*

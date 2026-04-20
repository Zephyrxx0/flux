---
phase: 01-deterministic-simulation-core
plan: 01
subsystem: simulation
tags: [simulation, deterministic, zod, vitest, fast-check]

requires:
  - phase: 01-deterministic-simulation-core
    provides: phase context decisions D-01 through D-09 and SIM-01/SIM-02 traceability
provides:
  - Versioned simulation input/output contracts with runtime validation
  - Deterministic simulation entrypoints (`simulateDeterministic`, `StadiumSim.run`)
  - Wave-0 test harness with smoke and full-suite commands
affects: [phase-02-configuration, phase-03-visualization, phase-04-ai-reporting]

tech-stack:
  added: [vitest, fast-check, zod, typescript]
  patterns: [pure-core-plus-wrapper, schema-versioned-contracts, deterministic-smoke-gate]

key-files:
  created:
    - package.json
    - vitest.config.ts
    - src/simulation/contracts/schemaVersion.ts
    - src/simulation/contracts/input.schema.ts
    - src/simulation/contracts/output.schema.ts
    - src/simulation/core/simulateDeterministic.ts
    - src/simulation/adapters/StadiumSim.ts
    - src/simulation/index.ts
    - tests/simulation/contracts.test.ts
    - tests/simulation/determinism.test.ts
    - tests/simulation/throughput-delay.test.ts
    - tests/simulation/invariants.test.ts
    - tests/simulation/properties.test.ts
  modified:
    - .gitignore

key-decisions:
  - "Use schemaVersion-gated Zod contracts as the single runtime contract boundary for SIM-01/SIM-02."
  - "Expose deterministic core as pure function and keep StadiumSim as a thin adapter wrapper."
  - "Keep per-task smoke verification bound to contracts + determinism tests for sub-30s feedback."

patterns-established:
  - "Contract-first simulation development: tests target contracts before algorithm depth."
  - "Deterministic verification pattern: smoke gate after each task, full suite at plan end."

requirements-completed: [SIM-01, SIM-02]

duration: 4 min
completed: 2026-04-18
---

# Phase 01 Plan 01: Deterministic simulation scaffolding Summary

**Versioned deterministic simulation contracts, entrypoint adapter surface, and Wave-0 smoke/full test feedback loop are now executable and stable for downstream phases.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-18T19:13:36Z
- **Completed:** 2026-04-18T19:18:03Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Established simulation test harness with Vitest + fast-check and a fast smoke command.
- Added schema-versioned input/output contracts plus deterministic core + adapter entrypoints.
- Enforced input contract relationships (gate/arrival references, detailed-mode metadata) and validated adapter delegation.

## Task Commits

1. **Task 0: Wave 0 deterministic test harness and smoke feedback setup (RED)** - `ccc0389` (test)
2. **Task 0: Wave 0 deterministic test harness and smoke feedback setup (GREEN)** - `133033c` (feat)
3. **Task 1: Define versioned contracts and interface-first simulation entrypoints (RED)** - `6d326bd` (test)
4. **Task 1: Define versioned contracts and interface-first simulation entrypoints (GREEN)** - `2b2d53a` (feat)

## Files Created/Modified
- `package.json` - Added simulation test scripts and dependencies.
- `vitest.config.ts` - Added deterministic non-watch runner configuration.
- `src/simulation/contracts/input.schema.ts` - Added schemaVersioned input contract with relationship validation.
- `src/simulation/contracts/output.schema.ts` - Added output contract with matrix, peaks, and invariants.
- `src/simulation/core/simulateDeterministic.ts` - Added deterministic pure simulation entrypoint.
- `src/simulation/adapters/StadiumSim.ts` - Added wrapper adapter delegating to pure core.
- `src/simulation/index.ts` - Added stable simulation exports for downstream phases.
- `tests/simulation/*.test.ts` - Added Wave-0 contract/determinism/throughput/invariant/property tests.

## Decisions Made
- Locked schemaVersion as required field for both input and output contracts.
- Kept deterministic function (`simulateDeterministic`) as core source of truth and class adapter as thin delegate.
- Chose a strict smoke gate (`contracts + determinism`) as per-task regression sentinel.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Implemented minimal simulation source scaffolding during Task 0 GREEN**
- **Found during:** Task 0 (Wave 0 deterministic test harness and smoke feedback setup)
- **Issue:** RED tests imported `src/simulation/*` contracts/core modules that did not exist yet, blocking Task 0 verification command from ever going green.
- **Fix:** Added minimal versioned contracts and deterministic entrypoint scaffolding to satisfy Wave-0 smoke execution, then hardened contract behavior in Task 1.
- **Files modified:** `src/simulation/contracts/schemaVersion.ts`, `src/simulation/contracts/input.schema.ts`, `src/simulation/contracts/output.schema.ts`, `src/simulation/core/simulateDeterministic.ts`, `src/simulation/adapters/StadiumSim.ts`, `src/simulation/index.ts`
- **Verification:** `npx vitest run tests/simulation/contracts.test.ts tests/simulation/determinism.test.ts --bail 1` passed.
- **Committed in:** `133033c`

**2. [Rule 3 - Blocking] Added `node_modules/` ignore for local install artifacts**
- **Found during:** Task 0 (dependency installation)
- **Issue:** `npm install` produced untracked runtime artifacts that must not remain unmanaged.
- **Fix:** Added `node_modules/` to `.gitignore`.
- **Files modified:** `.gitignore`
- **Verification:** `git status --short` returned clean working tree.
- **Committed in:** `133033c`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were required to preserve executable TDD flow and clean repository state; no scope creep into visualization/AI work.

## Known Stubs

- `src/simulation/core/simulateDeterministic.ts`: `runDeterministicHash` currently uses deterministic `JSON.stringify(parsed)` placeholder hashing pending deeper engine implementation in Plan 01-02.
- `src/simulation/core/simulateDeterministic.ts`: `warnings` is intentionally empty at this stage; richer warning semantics are deferred to algorithm-focused follow-up.

## Issues Encountered

- `gsd-sdk` CLI was not available in this execution environment (`command not recognized`), so state/roadmap/requirements updates were applied manually in-repo instead of via query handlers.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Deterministic simulation core contract surface is established and test-gated.
- Plan `01-02` can focus on deeper deterministic engine logic (throughput carry, severity policy nuance, richer invariants) without contract churn.

## Self-Check: PASSED

- FOUND: `.planning/phases/01-deterministic-simulation-core/01-01-SUMMARY.md`
- FOUND commits: `ccc0389`, `133033c`, `6d326bd`, `2b2d53a`

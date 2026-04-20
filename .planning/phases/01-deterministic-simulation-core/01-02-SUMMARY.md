---
phase: 01-deterministic-simulation-core
plan: 02
subsystem: simulation
tags: [simulation, deterministic, throughput, invariants, vitest, fast-check]

requires:
  - phase: 01-deterministic-simulation-core
    provides: Versioned contracts and baseline deterministic simulation scaffolding from 01-01
provides:
  - Deterministic phase engine decomposition across throughput, severity, and invariant modules
  - Gate-delay hard blocking, overflow carry-over, and over-capacity severity behavior under test
  - Detailed-mode deterministic output with exactly two sub-zones per zone
affects: [phase-02-configuration, phase-03-visualization, phase-04-ai-reporting]

tech-stack:
  added: []
  patterns: [tdd-red-green-per-task, deterministic-zone-expansion, pure-core-module-composition]

key-files:
  created:
    - src/simulation/core/enginePhases.ts
    - src/simulation/core/throughput.ts
    - src/simulation/core/invariants.ts
    - src/simulation/core/severity.ts
  modified:
    - src/simulation/core/simulateDeterministic.ts
    - tests/simulation/throughput-delay.test.ts
    - tests/simulation/invariants.test.ts
    - tests/simulation/determinism.test.ts
    - tests/simulation/properties.test.ts

key-decisions:
  - "Detailed mode expands each zone into deterministic entry/interior sub-zones using integer split rules."
  - "Phase processing was modularized so throughput constraints, severity mapping, and invariant evaluation remain independently testable."
  - "Task-level TDD gates are enforced via explicit RED then GREEN commits for each auto task marked tdd=true."

patterns-established:
  - "Constraint-first simulation tests: delay, carry-over, and severity scenarios are codified before engine implementation."
  - "Mode-aware matrix cardinality: detailed mode doubles zone rows while preserving stable phase/zone ordering."

requirements-completed: [SIM-01, SIM-02]

duration: 6 min
completed: 2026-04-18
---

# Phase 01 Plan 02: Deterministic simulation core behavior Summary

**Deterministic phase processing now enforces throughput-delay carry rules and detailed-mode two-sub-zone replay with stable invariant-backed outputs.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-18T19:22:05Z
- **Completed:** 2026-04-18T19:28:16Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Implemented modular deterministic core behavior (`enginePhases`, `throughput`, `severity`, `invariants`) and wired it into `simulateDeterministic`.
- Added and passed executable tests for D-07 carry-over, D-08 hard delay blocking, and D-09 occupancy/severity behavior.
- Enforced detailed mode deterministic output shape with exactly two sub-zones per zone and property-level matrix/conservation checks.

## Task Commits

1. **Task 0: Implement deterministic phase engine and constraint processing (RED)** - `e22ebf6` (test)
2. **Task 0: Implement deterministic phase engine and constraint processing (GREEN)** - `ce217c7` (feat)
3. **Task 1: Finalize deterministic replay behavior and detailed-mode assertions (RED)** - `6c3b370` (test)
4. **Task 1: Finalize deterministic replay behavior and detailed-mode assertions (GREEN)** - `993a330` (feat)

## Files Created/Modified
- `src/simulation/core/enginePhases.ts` - Encapsulates per-phase deterministic demand/throughput processing.
- `src/simulation/core/throughput.ts` - Implements gate-delay hard block and throughput capacity calculations.
- `src/simulation/core/invariants.ts` - Centralizes invariant flag recomputation from matrix rows.
- `src/simulation/core/severity.ts` - Maps occupancy ratio to deterministic severity tiers.
- `src/simulation/core/simulateDeterministic.ts` - Orchestrates stable phase-zone execution and detailed-mode two-sub-zone expansion.
- `tests/simulation/throughput-delay.test.ts` - Verifies delay blocking, throughput helper behavior, and carry-over between phases.
- `tests/simulation/invariants.test.ts` - Verifies severity mapping and over-capacity occupancy invariants.
- `tests/simulation/determinism.test.ts` - Verifies multi-run deterministic replay and detailed-mode sub-zone determinism.
- `tests/simulation/properties.test.ts` - Verifies generated-input deterministic behavior and matrix cardinality/conservation properties.

## Decisions Made
- Detailed mode remains explicit/manual and is represented by deterministic `:entry` and `:interior` sub-zone rows.
- Integer split logic (`ceil` for entry, `floor` for interior) is used to keep per-zone totals conserved and deterministic.
- Invariant computation is delegated to a dedicated module so downstream phases can validate contract-level guarantees consistently.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `gsd-sdk` CLI is not available in this environment (`command not recognized`), so state/roadmap/requirements updates were applied directly in tracked planning files instead of query handlers.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SIM-01 and SIM-02 deterministic core behavior is test-proven and ready for Phase 2 scenario configuration wiring.
- Detailed-mode output shape is now stable for visualization/AI consumers without adding UI/AI scope in this plan.

## Self-Check: PASSED

- FOUND: `.planning/phases/01-deterministic-simulation-core/01-02-SUMMARY.md`
- FOUND commits: `e22ebf6`, `ce217c7`, `6c3b370`, `993a330`

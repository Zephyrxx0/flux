---
phase: 01-deterministic-simulation-core
verified: 2026-04-19T02:00:00Z
status: passed
score: 3/3 must-haves verified
---

# Phase 1: Deterministic Simulation Core Verification Report

**Phase Goal:** Users can execute a deterministic multi-phase simulation that reflects gate-delay and throughput effects on zone occupancy.
**Verified:** 2026-04-19T02:00:00Z
**Status:** passed

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can run the same scenario input multiple times and get the same simulation result. | ✓ VERIFIED | `npx vitest run tests/simulation/determinism.test.ts` passed; deterministic replay covered in UAT test 1 (pass). |
| 2 | User can adjust gate-delay and throughput values and observe occupancy changes by phase. | ✓ VERIFIED | `npx vitest run tests/simulation/throughput-delay.test.ts tests/simulation/invariants.test.ts --bail 1` passed; UAT tests 2 and 3 passed. |
| 3 | Simulation output exposes per-phase, per-zone values consumable by downstream views. | ✓ VERIFIED | Output contract and matrix/invariant fields validated by `tests/simulation/contracts.test.ts` and output schema usage in deterministic pipeline. |

**Score:** 3/3 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/simulation/core/simulateDeterministic.ts` | Deterministic simulation entrypoint | ✓ EXISTS + SUBSTANTIVE | Orchestrates deterministic run, contract validation, mode-aware output shaping. |
| `src/simulation/core/enginePhases.ts` | Phase processing behavior | ✓ EXISTS + SUBSTANTIVE | Computes arrivals/carry/throughput and per-phase occupancy rows. |
| `src/simulation/core/throughput.ts` | Delay and throughput constraints | ✓ EXISTS + SUBSTANTIVE | Enforces delay blocking and bounded throughput behavior by phase. |
| `src/simulation/core/invariants.ts` | Conservation and consistency checks | ✓ EXISTS + SUBSTANTIVE | Recomputes and validates carry, throughput, and occupancy invariant flags. |
| `src/simulation/contracts/input.schema.ts` | Versioned input contract validation | ✓ EXISTS + SUBSTANTIVE | Rejects invalid references/duplicates and malformed payloads. |
| `src/simulation/contracts/output.schema.ts` | Versioned output contract validation | ✓ EXISTS + SUBSTANTIVE | Validates matrix shape, peaks, and invariant payload structure. |
| `tests/simulation/*.test.ts` | Determinism + constraint coverage | ✓ EXISTS + SUBSTANTIVE | 5 files, 16 tests passing in full suite run. |

**Artifacts:** 7/7 verified

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| Input schema | Deterministic core | `inputSchema.parse` | ✓ WIRED | Simulation execution validates input before processing. |
| Deterministic core | Output schema | `outputSchema.parse` | ✓ WIRED | Output normalized and validated before return from simulation entrypoint. |
| Throughput constraints | Matrix rows/invariants | `computeThroughputFans` + engine phase composition | ✓ WIRED | Delay/throughput logic propagates into row fields and invariant recomputation. |
| Adapter `StadiumSim.run` | Core engine | delegate call | ✓ WIRED | Adapter behavior validated by contract and determinism tests. |

**Wiring:** 4/4 connections verified

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SIM-01 | 01-01-PLAN.md, 01-02-PLAN.md | Deterministic repeatable simulation outputs for identical inputs | ✓ SATISFIED | `tests/simulation/determinism.test.ts`; UAT test 1 pass; full suite green. |
| SIM-02 | 01-01-PLAN.md, 01-02-PLAN.md | Gate-delay and throughput constraints impact occupancy by phase/zone | ✓ SATISFIED | `tests/simulation/throughput-delay.test.ts`, `tests/simulation/invariants.test.ts`; UAT tests 2-3 pass. |

**Coverage:** 2/2 requirements satisfied

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| src/simulation/core/simulateDeterministic.ts | n/a | `runDeterministicHash` name currently reflects serialized snapshot semantics | ℹ️ Info | Non-blocking naming clarity issue; does not affect deterministic correctness. |

**Anti-patterns:** 1 found (0 blockers, 0 warnings)

## Human Verification Required

None — phase acceptance behavior was covered by UAT and automated deterministic/constraint tests for this phase scope.

## Gaps Summary

**No gaps found.** Phase goal achieved. Ready to proceed.

## Verification Metadata

**Verification approach:** Goal-backward (derived from ROADMAP phase goal)
**Must-haves source:** ROADMAP.md phase success criteria + phase plan requirements mapping
**Automated checks:** 16 passed, 0 failed
**Human checks required:** 0
**Total verification time:** 25 min

---
*Verified: 2026-04-19T02:00:00Z*
*Verifier: the agent*

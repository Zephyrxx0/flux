---
phase: 01
slug: deterministic-simulation-core
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-19
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vitest.config.ts` (Wave 0 installs) |
| **Smoke run command** | `npx vitest run tests/simulation/contracts.test.ts tests/simulation/determinism.test.ts --bail 1` |
| **Quick run command** | `npx vitest run tests/simulation/determinism.test.ts tests/simulation/throughput-delay.test.ts --bail 1` |
| **Full suite command** | `npx vitest run` |
| **Estimated smoke runtime** | ~15-25 seconds |
| **Estimated full runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/simulation/contracts.test.ts tests/simulation/determinism.test.ts --bail 1`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency target:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | SIM-01,SIM-02 | — | Wave 0 harness and contract smoke checks establish deterministic fast feedback loop | unit | `npx vitest run tests/simulation/contracts.test.ts tests/simulation/determinism.test.ts --bail 1` | ✅ | ✅ green |
| 01-01-02 | 01 | 1 | SIM-01,SIM-02 | — | Contract versioning/validation rejects malformed schemas safely | unit | `npx vitest run tests/simulation/contracts.test.ts --bail 1` | ✅ | ✅ green |
| 01-02-01 | 02 | 2 | SIM-02 | — | Gate delay hard-block and throughput-bound behavior by phase with carry-over conservation | unit + integration | `npx vitest run tests/simulation/throughput-delay.test.ts tests/simulation/invariants.test.ts --bail 1` | ✅ | ✅ green |
| 01-02-02 | 02 | 2 | SIM-01 | — | Deterministic replay for identical input and detailed-mode deterministic behavior | unit + property | `npx vitest run tests/simulation/determinism.test.ts tests/simulation/properties.test.ts --bail 1` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `tests/simulation/determinism.test.ts` — stubs for SIM-01
- [x] `tests/simulation/throughput-delay.test.ts` — stubs for SIM-02
- [x] `tests/simulation/invariants.test.ts` — conservation and matrix completeness
- [x] `tests/simulation/contracts.test.ts` — schemaVersion and boundary validation
- [x] `vitest.config.ts` — deterministic runner config and include patterns
- [x] `npm install -D vitest fast-check` — framework and property-test support

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Canonical scenario sanity review (Normal, Sold Out Rush, Gate Crisis) against expected occupancy trend shape | SIM-02 | Human judgment needed to confirm modeled dynamics are operationally plausible | Run scenario fixtures, inspect phase-by-zone output trend and overflow carry narrative in summary notes |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency <= 30s for task-level smoke commands
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** verified 2026-04-19

## Validation Audit 2026-04-19

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

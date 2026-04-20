---
phase: 01-deterministic-simulation-core
reviewed: 2026-04-19T01:26:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - .gitignore
  - package.json
  - src/simulation/adapters/StadiumSim.ts
  - src/simulation/contracts/input.schema.ts
  - src/simulation/contracts/output.schema.ts
  - src/simulation/contracts/schemaVersion.ts
  - src/simulation/core/enginePhases.ts
  - src/simulation/core/invariants.ts
  - src/simulation/core/severity.ts
  - src/simulation/core/simulateDeterministic.ts
  - src/simulation/core/throughput.ts
  - src/simulation/index.ts
  - tests/simulation/contracts.test.ts
  - tests/simulation/determinism.test.ts
  - tests/simulation/invariants.test.ts
  - tests/simulation/properties.test.ts
  - tests/simulation/throughput-delay.test.ts
  - vitest.config.ts
findings:
  critical: 0
  warning: 1
  info: 1
  total: 2
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-19T01:26:00Z
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

Reviewed all scoped Phase 1 files at standard depth after applied fixes. No critical security issues were found, and previously reported invariant/schema correctness issues are now resolved in the current code. One remaining logic warning exists in throughput delay classification, plus one naming/contract clarity info item.

Test signal: `npm test` passed (`5` files, `16` tests).

## Warnings

### WR-01: Delay Flag Can Be Incorrect When Throughput Is Zero for Non-Delay Reasons

**File:** `src/simulation/core/throughput.ts:32`
**Issue:** `blockedByDelay` is currently computed as `availableThroughput === 0 && gates.length > 0`. This flags delay as the cause even when throughput is zero because gates have `throughputPerMin = 0` (or equivalent zero-capacity configuration), which is a different condition.
**Fix:** Derive `blockedByDelay` from delay-window overlap rather than total throughput alone.

```ts
const phaseEndMin = phaseStartMin + phaseDurationMin

const gateHasActiveWindow = (gate: Gate) => {
  const activeStart = Math.max(phaseStartMin, gate.delayMin)
  return Math.max(0, phaseEndMin - activeStart) > 0
}

const blockedByDelay = gates.length > 0 &&
  gates.every((gate) => !gateHasActiveWindow(gate))
```

## Info

### IN-01: `runDeterministicHash` Name Does Not Match Stored Value

**File:** `src/simulation/core/simulateDeterministic.ts:147`
**Issue:** `runDeterministicHash` stores `JSON.stringify(parsed)`, which is an input snapshot string, not a hash digest. The current behavior is valid but the field name can mislead downstream users.
**Fix:** Either rename the field to snapshot semantics (for example, `runDeterministicSnapshot`) or compute an actual digest.

```ts
import { createHash } from "node:crypto"

runDeterministicHash: createHash("sha256")
  .update(JSON.stringify(parsed))
  .digest("hex")
```

---

_Reviewed: 2026-04-19T01:26:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_

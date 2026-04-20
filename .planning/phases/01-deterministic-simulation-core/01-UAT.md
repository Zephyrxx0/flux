---
status: complete
phase: 01-deterministic-simulation-core
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md
started: 2026-04-19T01:35:00Z
updated: 2026-04-19T01:55:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Deterministic Replay
expected: Running the simulation twice with identical input produces identical output values, including phase-zone rows, peak summaries, and invariant flags.
result: pass

### 2. Delay And Throughput Phase Effects
expected: Changing gate delay or throughput values changes occupancy outcomes by phase and by zone in a way consistent with constraints.
result: pass

### 3. Overflow Carry Conservation
expected: When demand exceeds throughput in a phase, overflow carries into the next phase in the same zone and conservation holds.
result: pass

### 4. Detailed Mode Two-Subzone Behavior
expected: In detailed mode, each zone expands to exactly two deterministic sub-zones (entry and interior) with stable replay.
result: pass

### 5. Input Contract Validation
expected: Invalid input (for example duplicate phase IDs/order, duplicate zone IDs, duplicate gate IDs, missing references) is rejected with clear validation errors.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]

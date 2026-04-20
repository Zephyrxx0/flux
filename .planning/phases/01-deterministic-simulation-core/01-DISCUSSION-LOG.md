# Phase 1: Deterministic Simulation Core - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `01-CONTEXT.md`.

**Date:** 2026-04-19
**Phase:** 01-deterministic-simulation-core
**Areas discussed:** Simulation Model Granularity, Input And Output Contract, Constraint Handling Rules

---

## Simulation Model Granularity

| Option | Description | Selected |
|--------|-------------|----------|
| Zone-level deterministic flow | Track occupancy by zone across phases with aggregate flow math | |
| Sub-zone lane modeling | Split each zone into finer lanes; higher realism, higher complexity | |
| Hybrid | Zone-level core with optional sub-zone details | ✓ |

**Follow-up: Sub-zone activation policy**
- Selected: Manual toggle per run

**Follow-up: Detailed-mode depth**
- Selected: 2-level split per zone (entry vs interior)

**User's choice summary:** Hybrid model with manual detailed mode and 2-level sub-zone split.

---

## Input And Output Contract

| Option | Description | Selected |
|--------|-------------|----------|
| Pure function + class wrapper | Core deterministic function with `StadiumSim` convenience wrapper | ✓ |
| Class-only API | `StadiumSim(config).run()` as only entrypoint | |
| Function-only API | Single exported function only | |

**Schema/versioning question**
- Selected: Embed `schemaVersion` in input and output with runtime validation

**Output guarantee question**
- Selected: Phase x Zone matrix + peak summaries + invariant flags

**User's choice summary:** Versioned, validated contracts with rich deterministic output shape for downstream phases.

---

## Constraint Handling Rules

| Option | Description | Selected |
|--------|-------------|----------|
| Carry overflow to next phase in same zone | Deterministic backlog behavior | ✓ |
| Redistribute overflow immediately | Dynamic reallocation across zones | |
| Clamp and discard overflow | Simple but lossy behavior | |

**Gate delay policy**
- Selected: Hard blocking window before gate opens

**Over-capacity policy**
- Selected: Allow occupancy >100% and compute severity tiers from ratio

**User's choice summary:** Preserve realistic pressure signals with deterministic overflow and hard delay rules.

---

## the agent's Discretion

- Exact deterministic rounding strategy and invariant catalogue details.
- Internal helper/module partitioning for simulation core implementation.

## Deferred Ideas

- Determinism and validation policy depth was left for planning refinement.

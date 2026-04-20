# Phase 1: Deterministic Simulation Core - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a deterministic multi-phase simulation core that models gate-delay and throughput effects on zone occupancy and exposes stable per-phase, per-zone outputs for downstream visualization and AI reporting phases.

</domain>

<decisions>
## Implementation Decisions

### Simulation Model Granularity
- **D-01:** Use a hybrid modeling strategy: zone-level deterministic core with optional detailed mode.
- **D-02:** Detailed mode is a manual per-run toggle (not automatic threshold activation).
- **D-03:** In detailed mode, each zone is split into exactly two sub-zones (entry vs interior) for Phase 1.

### Input And Output Contract
- **D-04:** Expose a pure simulation function as the core contract, plus a `StadiumSim` class wrapper for convenience.
- **D-05:** Include `schemaVersion` in both simulation input and simulation output, with runtime validation.
- **D-06:** Guarantee output contains phase-by-zone matrix values, peak summaries, and invariant/validation flags.

### Constraint Handling Rules
- **D-07:** When throughput is insufficient, carry overflow to the next phase in the same zone.
- **D-08:** Apply gate delay as a hard blocking window (no throughput before delay expiry).
- **D-09:** Permit occupancy beyond 100% in simulation output and compute severity tiers from occupancy ratio.

### the agent's Discretion
- Exact invariant set and rounding precision implementation details (as long as deterministic guarantees hold).
- Internal naming of helper functions and module boundaries between core function and class wrapper.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase and requirement anchors
- `.planning/ROADMAP.md` — Phase 1 goal, scope boundary, and success criteria.
- `.planning/REQUIREMENTS.md` — SIM-01 and SIM-02 requirement definitions and traceability.
- `.planning/PROJECT.md` — project-level constraints and architecture decisions that affect implementation.

### Product and technical blueprint
- `predictive-fan-flow-plan.md` — detailed architecture, data models, and target file/component structure.
- `idea8_predictive_fan_flow_technical_plan.html` — alternate technical blueprint and implementation narrative for the same product.

### Codebase intelligence context
- `graphify-out/GRAPH_REPORT.md` — identified system hubs and dependencies; confirms simulation engine/data-model centrality.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No implemented source files found yet (`src/` and code files absent). Phase 1 should establish foundational simulation contracts as first reusable assets.
- Existing planning artifacts define intended module boundaries (for example `engine/StadiumSim.js`, config models, and output model expectations).

### Established Patterns
- Client-side-first architecture with no traditional backend service.
- Deterministic simulation is prioritized before visualization and AI layers.
- Single-run simulation -> structured JSON output -> downstream consumers pattern is already documented.

### Integration Points
- Phase 2 configuration UI will feed simulation input contract.
- Phase 3 visualization layer will consume per-phase/per-zone output matrix.
- Phase 4 AI reporting will consume structured simulation output and invariant flags.

</code_context>

<specifics>
## Specific Ideas

- Detailed mode should be user-controlled per run so demo operators can switch between speed and fidelity explicitly.
- Phase 1 should prove hybrid architecture without overbuilding sub-zone complexity (two sub-zones only).
- Output contract should be explicit enough to avoid rework in visualization and AI phases.

</specifics>

<deferred>
## Deferred Ideas

- **Determinism and validation policy depth** (rounding policy details, fixture strategy, and invariant test matrix) was not fully discussed and can be finalized during planning while honoring SIM-01.

</deferred>

---

*Phase: 01-deterministic-simulation-core*
*Context gathered: 2026-04-19*
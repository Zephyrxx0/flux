# Phase 1: Deterministic Simulation Core - Research

**Researched:** 2026-04-19
**Domain:** Deterministic client-side simulation engine for stadium fan-flow modeling
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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

### Claude's Discretion
- Exact invariant set and rounding precision implementation details (as long as deterministic guarantees hold).
- Internal naming of helper functions and module boundaries between core function and class wrapper.

### Deferred Ideas (OUT OF SCOPE)
- **Determinism and validation policy depth** (rounding policy details, fixture strategy, and invariant test matrix) was not fully discussed and can be finalized during planning while honoring SIM-01.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SIM-01 | User can run a deterministic multi-phase simulation that yields repeatable outputs for the same input. | Pure-function core, integer-based arithmetic strategy, stable ordering rules, invariant suite, snapshot tests, property-based determinism checks. |
| SIM-02 | User can model gate-delay and throughput constraints that affect zone occupancy by phase. | Phase engine with per-zone carry-over, gate delay hard-block, throughput caps, per-phase occupancy matrix contract, peak/severity summaries. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Before architecture/codebase answers, read graphify outputs if present. In this workspace, `graphify-out/` was not found, so no graph report is available to consult.
- If graphify wiki index exists, use it before raw files. Not applicable because `graphify-out/wiki/index.md` is missing.
- After modifying code files, run `graphify update .`. This phase produced planning documentation only (no code file edits).

## Summary

Phase 1 should implement a deterministic simulation kernel as a framework-agnostic domain module, then expose that kernel through a thin `StadiumSim` class wrapper. This directly satisfies D-04 and prevents future UI/AI phases from coupling to implementation details. The model should be phase-driven (Entry, First Half, Halftime, etc.), process demand and throughput per zone in stable order, and preserve carry-over overflow by zone across phases (D-07). Gate delay must strictly block throughput until delay expiry (D-08), and occupancy values must be allowed above 100% with explicit severity tiers (D-09).

To satisfy SIM-01 robustly, the engine should avoid floating-point accumulation for core state transitions. Use integer math for fan counts and occupancy basis points, with display rounding only at output boundaries. Determinism must be enforced by: no wall-clock/random inputs, stable iteration order, immutable inputs, and invariant checks in output. Runtime schema validation (D-05) should reject malformed inputs early and stamp output with `schemaVersion` for downstream compatibility.

Because there is no existing source scaffolding in the repo, Wave 0 for Phase 1 should include simulation package/module setup, contracts, and test harness. Verification should focus on repeatability, throughput/gate constraints, and matrix completeness so later D3/AI phases can consume the contract without schema churn.

**Primary recommendation:** Implement a pure `simulateDeterministic(input)` integer-math core + `StadiumSim.run()` wrapper with Zod-validated versioned contracts and Vitest determinism/invariant tests as Phase 1 baseline.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | 24.13.0 (env) | Runtime for tooling/tests | Available now in environment; exceeds modern tooling minimums. |
| zod | 4.3.6 (npm, modified 2026-01-25) | Runtime schema validation for input/output with version checks | Mature schema validation in JS/TS; avoids hand-rolled validators and supports strict contracts. |
| vitest | 4.1.4 (npm, modified 2026-04-09) | Fast unit/integration testing for deterministic engine | Native fit for Vite-era stack; supports targeted and full test runs. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fast-check | 4.7.0 (npm, modified 2026-04-17) | Property-based tests for determinism and invariant stress | Use for SIM-01 stability under many generated input variants. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| zod | Ajv + JSON Schema | Better for large JSON-schema ecosystems, but adds complexity for this phase; Zod is faster to integrate in code-first contracts. |
| vitest | Jest | Jest is viable, but Vitest has lower setup friction for a Vite/React roadmap and faster local feedback. |
| fast-check | table-driven tests only | Simpler, but weaker coverage against hidden deterministic edge cases. |

**Installation:**
```bash
npm install zod
npm install -D vitest fast-check
```

**Version verification:**
```bash
npm view zod version
npm view zod time.modified
npm view vitest version
npm view vitest time.modified
npm view fast-check version
npm view fast-check time.modified
```

## Recommended Architecture

### Recommended Project Structure
```
src/
├── simulation/                 # Deterministic domain engine only
│   ├── contracts/              # zod schemas + version constants
│   │   ├── schemaVersion.ts
│   │   ├── input.schema.ts
│   │   └── output.schema.ts
│   ├── core/
│   │   ├── simulateDeterministic.ts
│   │   ├── enginePhases.ts
│   │   ├── throughput.ts
│   │   ├── invariants.ts
│   │   └── severity.ts
│   ├── adapters/
│   │   └── StadiumSim.ts       # Class wrapper over pure function
│   └── index.ts
└── shared/
    └── types/                  # Optional shared types exported to UI/AI layers

tests/
└── simulation/
   ├── determinism.test.ts
   ├── throughput-delay.test.ts
   ├── invariants.test.ts
   └── contracts.test.ts
```

### Pattern 1: Pure Core + Wrapper Adapter
**What:** Keep one side-effect-free function as source of truth; wrapper class only for convenience API.
**When to use:** Always for Phase 1 execution path.
**Example:**
```ts
// Pure deterministic contract
export function simulateDeterministic(input: SimulationInput): SimulationOutput {
  const parsed = SimulationInputSchema.parse(input)
  // ... deterministic calculations only
  return SimulationOutputSchema.parse(output)
}

export class StadiumSim {
  constructor(private readonly input: SimulationInput) {}
  run(): SimulationOutput {
    return simulateDeterministic(this.input)
  }
}
```

### Pattern 2: Integer Internal State, Rounded External View
**What:** Maintain fan counts and occupancy in integer units internally (for example, basis points), format decimals only for output fields.
**When to use:** All per-phase math loops.
**Example:**
```ts
const OCCUPANCY_BPS = Math.round((zoneFans * 10000) / zoneCapacity)
const occupancyRatio = OCCUPANCY_BPS / 10000
```

### Pattern 3: Stable Iteration Contract
**What:** Sort phase and zone keys explicitly and never rely on incidental object ordering for computation.
**When to use:** Every loop that contributes to computed totals.
**Example:**
```ts
const orderedPhases = [...input.phases].sort((a, b) => a.order - b.order)
const orderedZones = [...input.zones].sort((a, b) => a.id.localeCompare(b.id))
```

### Data Contracts

```ts
export type SchemaVersion = "1.0.0"

export interface SimulationInput {
  schemaVersion: SchemaVersion
  mode: "zone" | "detailed" // detailed is manual toggle (D-02)
  phases: Array<{
    id: string
    order: number
    durationMin: number
  }>
  zones: Array<{
    id: string
    capacity: number
  }>
  gates: Array<{
    id: string
    zoneId: string
    throughputPerMin: number
    delayMin: number
  }>
  arrivals: Array<{
    phaseId: string
    zoneId: string
    demandFans: number
  }>
}

export interface SimulationOutput {
  schemaVersion: SchemaVersion
  runDeterministicHash: string
  phaseZoneMatrix: Array<{
    phaseId: string
    zoneId: string
    occupancyFans: number
    occupancyRatio: number // may exceed 1.0 (D-09)
    occupancySeverity: "green" | "amber" | "red" | "critical"
    overflowCarryFans: number
    blockedByDelay: boolean
  }>
  peakSummaries: Array<{
    zoneId: string
    phaseId: string
    peakOccupancyFans: number
    peakOccupancyRatio: number
  }>
  invariants: {
    deterministicReplay: boolean
    nonNegativeOccupancy: boolean
    throughputBoundRespected: boolean
    carryOverConservation: boolean
    matrixComplete: boolean
  }
  warnings: string[]
}
```

### Anti-Patterns to Avoid
- **Hidden non-determinism:** no `Date.now()`, no `Math.random()`, no locale/timezone-dependent formatting inside core math.
- **Mutable shared objects:** never mutate incoming input object.
- **Mixed float/integer core state:** causes drift and brittle equality checks.
- **Implicit ordering assumptions:** always use explicit order keys/sorts.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Input/output shape validation | Manual `if` trees for every nested field | zod schemas | Fewer contract bugs, better error reporting, explicit `schemaVersion` enforcement. |
| Determinism regression detection | Ad-hoc manual checks | Vitest deterministic replay tests + snapshots | Repeatable quality gate for SIM-01. |
| Randomized edge exploration | Homegrown input fuzz scripts | fast-check properties | Better coverage and reproducibility for edge cases. |

**Key insight:** Determinism failures are usually contract/ordering/rounding bugs, not algorithmic complexity; standardized validation and test tooling catches these earlier than custom utilities.

## Common Pitfalls

### Pitfall 1: Floating-point accumulation drift
**What goes wrong:** repeated decimal arithmetic causes run-to-run mismatch in strict equality tests.
**Why it happens:** binary floating-point precision limits.
**How to avoid:** keep internal state integer-based; use tolerance only at external formatting checks.
**Warning signs:** values such as `0.30000000000000004` and flaky equality tests.

### Pitfall 2: In-place sort mutation of shared arrays
**What goes wrong:** one computation mutates ordering used by later steps, changing results unexpectedly.
**Why it happens:** `Array.prototype.sort()` mutates in place.
**How to avoid:** clone before sort (`[...arr].sort(...)`) and keep immutable phase/zone sequences.
**Warning signs:** deterministic tests fail only after specific test order.

### Pitfall 3: Incorrect gate-delay handling
**What goes wrong:** delayed gates still process fans in blocked interval.
**Why it happens:** applying delay as percentage instead of hard time block.
**How to avoid:** throughput contribution is exactly zero before `delayMin` expiry in each relevant phase (D-08).
**Warning signs:** occupancy changes appear too smooth in crisis scenarios.

### Pitfall 4: Overflow discarded instead of carried
**What goes wrong:** demand beyond throughput disappears, underestimating risk.
**Why it happens:** phase transition does not persist overflow state by zone.
**How to avoid:** explicit `overflowCarryFans` in state and output; conservation invariant in tests.
**Warning signs:** total demand does not reconcile with processed + carry + final occupancy.

## Code Examples

Verified patterns from official sources:

### Stable numeric sort comparator
```ts
const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order
const ordered = [...items].sort(byOrder)
```
Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort

### Floating-point caution for equality checks
```ts
const equalWithin = (x: number, y: number, tolerance: number) =>
  Math.abs(x - y) < tolerance
```
Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON

### Vitest minimal deterministic test
```ts
import { describe, expect, it } from "vitest"
import { simulateDeterministic } from "../src/simulation/core/simulateDeterministic"

describe("determinism", () => {
  it("returns identical output for identical input", () => {
    const out1 = simulateDeterministic(sampleInput)
    const out2 = simulateDeterministic(sampleInput)
    expect(out1).toEqual(out2)
  })
})
```
Source: https://vitest.dev/guide/

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Unstable sort behavior assumptions across engines | Stable sort guaranteed by modern ECMAScript implementations | ES2019+ | Enables deterministic ordering assumptions if comparator is well-formed. |
| Handwritten validation or weak typing only | Runtime schema validation with code-first schemas | Current JS/TS best practice | Safer cross-phase contracts for UI and AI consumers. |
| Test-only examples for fixed fixtures | Add property-based testing for invariants | Common in modern reliability workflows | Catches more determinism edge cases before integration. |

**Deprecated/outdated:**
- Relying on implicit lexicographic default sort for numeric values: unsafe for deterministic numeric pipelines.

## Open Questions

1. **Phase-level exit semantics**
   - What we know: occupancy by phase is required, with overflow carry constraints.
   - What's unclear: exact split of ingress vs egress during halftime/exit under mixed flows.
   - Recommendation: lock one canonical flow rule set in PLAN and encode as fixture baseline.

2. **Severity tier thresholds above 100% occupancy**
   - What we know: occupancy above 100% must be allowed and tiered (D-09).
   - What's unclear: exact threshold cutoffs for `red` vs `critical` above 1.0.
   - Recommendation: define threshold constants centrally in `severity.ts` and freeze with approval tests.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/test runtime | ✓ | 24.13.0 | — |
| npm | Package install + scripts | ✓ | 11.1.0 | — |
| bun | Optional script/test execution | ✓ | 1.3.10 | npm scripts |
| pnpm | Optional package manager | ✗ | — | Use npm |
| yarn | Optional package manager | ✗ | — | Use npm |
| Python | Optional scripting only | ✓ | 3.13.1 | Not required for Phase 1 |

**Missing dependencies with no fallback:**
- None.

**Missing dependencies with fallback:**
- `pnpm`, `yarn` unavailable; use `npm` for all commands.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | none - see Wave 0 |
| Quick run command | `npx vitest run tests/simulation/determinism.test.ts -t "identical output"` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIM-01 | Same input returns identical output every run | unit + property | `npx vitest run tests/simulation/determinism.test.ts tests/simulation/properties.test.ts` | ❌ Wave 0 |
| SIM-02 | Gate delays + throughput limits change occupancy by phase with carry-over | unit + integration | `npx vitest run tests/simulation/throughput-delay.test.ts tests/simulation/invariants.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/simulation/determinism.test.ts tests/simulation/throughput-delay.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green + deterministic replay fixture hash unchanged for fixed seedless inputs.

### Wave 0 Gaps
- [ ] `tests/simulation/determinism.test.ts` - SIM-01 repeatability
- [ ] `tests/simulation/throughput-delay.test.ts` - SIM-02 gate delay and throughput effects
- [ ] `tests/simulation/invariants.test.ts` - conservation and matrix completeness
- [ ] `tests/simulation/contracts.test.ts` - schemaVersion and contract validation
- [ ] `vitest.config.ts` - deterministic runner config and include patterns
- [ ] `package.json` scripts (`test`, `test:quick`) if absent

## Risks and Mitigations

1. **Risk: contract churn breaks downstream UI/AI phases**
   - Mitigation: lock `schemaVersion` and publish input/output schemas before visualization/AI implementation.
2. **Risk: deterministic math still diverges due to accidental float paths**
   - Mitigation: enforce integer-only internal state and lint rule/tests around forbidden float accumulation helpers.
3. **Risk: scenario complexity explosion in detailed mode**
   - Mitigation: cap Phase 1 detailed mode to exactly two sub-zones per zone (D-03), no automatic mode switching (D-02).
4. **Risk: missing baseline fixtures delays Phase 2+ integration**
   - Mitigation: create canonical scenario fixtures (Normal, Sold Out Rush, Gate Crisis) in Phase 1 test assets.

## Sources

### Primary (HIGH confidence)
- `.planning/phases/01-deterministic-simulation-core/01-CONTEXT.md` - locked decisions and constraints
- `.planning/REQUIREMENTS.md` - SIM-01/SIM-02 requirement definitions
- `.planning/ROADMAP.md` - Phase 1 success criteria
- `predictive-fan-flow-plan.md` - intended simulation architecture and data shape
- https://vitest.dev/guide/ - framework requirements and usage
- https://zod.dev/ - runtime validation capabilities
- npm registry queries (`npm view`) for zod/vitest/fast-check versions

### Secondary (MEDIUM confidence)
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort - stable sort semantics and comparator constraints
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON - numeric precision caveats

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified by current npm registry and official docs.
- Architecture: HIGH - directly constrained by locked Phase 1 decisions and roadmap outcomes.
- Pitfalls: HIGH - backed by JS spec references and deterministic simulation practices.

**Research date:** 2026-04-19
**Valid until:** 2026-05-19

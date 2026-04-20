# Phase 2: Scenario Configuration Experience - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a unified scenario configuration panel that allows users to define and calibrate stadium parameters (capacity, gates, phases, arrivals), apply presets, and save scenario templates. This phase bridges the deterministic simulation engine from Phase 1 with the visualization requirements of Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Layout and Navigation
- **D-01 (Scenario Panel Layout):** Use a **Persistent Sidebar** (likely on the left) for all configuration controls. This keeps the center/right area available for simulation output visualization in future phases and supports a tight "Run-Adjust-Rerun" feedback loop.
- **D-02 (Preset Integration):** Use **Toolbar Buttons** at the top of the configuration panel for one-click application of "Normal Event", "Sold Out Rush", and "Gate Crisis" presets.

### User Interaction and Feedback
- **D-03 (Simulation Trigger Mode):** Use an **Explicit Run** button. While the simulation is client-side and fast, an explicit trigger provides a clear boundary between drafting a configuration and seeing the result, which aligns with the user's preference for an "On-Run Error List".
- **D-04 (Validation Strategy):** Communicate validation errors (duplicate IDs, unknown refs) as an **On-Run Error List**. This prevents distracting the user with red borders/text while they are in the middle of a complex multi-step configuration change but blocks the execution of invalid simulations.

### Configuration Features
- **D-05 (Advanced Calibration UI):** Surface advanced calibration controls (e.g., Detailed Mode sub-zone settings, throughput constants) via **Collapsible Inline Sections** within their respective categories (Gates, Phases, etc.).
- **D-06 (Persistence Model):** Support **Saved Scenarios** (named templates like "2026 Finals") in addition to the Phase 5 requirement for persisted run history. This allows users to treat configurations as reusable assets independent of specific simulation outputs.

### Technical Stack (Phase 2+)
- **D-07 (Frontend Stack):** Initialize the project with **React + Vite + Tailwind CSS**.
- **D-08 (Component Library):** Use **shadcn/ui** (Radix UI + Tailwind) for standardized, professional configuration components (Inputs, Selects, Accordions, Toolbars).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and Roadmap
- `.planning/ROADMAP.md` — Phase 2 goal and success criteria (CFG-01, CFG-02, CFG-03).
- `.planning/REQUIREMENTS.md` — Detailed requirement definitions for configuration and presets.

### Existing Simulation Contracts
- `src/simulation/contracts/input.schema.ts` — The Zod schema defining the configuration data structure the UI must produce.
- `src/simulation/contracts/output.schema.ts` — The structure of simulation results that the configuration state must eventually trigger.

### Prior Phase Decisions
- `.planning/phases/01-deterministic-simulation-core/01-CONTEXT.md` — Decisions on simulation granularity (Detailed Mode) and constraint handling.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SimulationInputSchema` (in `src/simulation/contracts/input.schema.ts`): The source of truth for configuration state validation.
- `SimulationInput` type: To be used as the primary state model for the configuration panel.

### Established Patterns
- **Zod-driven validation**: Continue using Zod for the "On-Run Error List" validation logic to ensure parity between UI and Engine.
- **Functional Simulation Engine**: The `simulateDeterministic` function is ready to be called by the React UI.

### Integration Points
- The Configuration Sidebar will wrap/trigger the simulation engine from Phase 1.
- Saved Scenarios will likely require a simple JSON persistence mechanism (e.g., LocalStorage for MVP, or a simple JSON file structure).

</code_context>

<specifics>
## Specific Ideas
- Presets should be implemented as functional "modifiers" that can be applied to the current state, ensuring CFG-02 ("one action") is satisfied.
- The sidebar should be scrollable and categorized (Venue, Phases, Arrivals) to handle the potentially high volume of inputs defined in `SimulationInputSchema`.

</specifics>

<deferred>
## Deferred Ideas
- **Interactive Visual Timeline**: Adjusting phase duration or demand peaks via a drag-and-drop chart was discussed but deferred in favor of a robust form-based sidebar for v1.
- **Multi-scenario Comparison View**: While Phase 2 enables "Saved Scenarios", the actual side-by-side comparison UI belongs in Phase 5.

</deferred>

---

*Phase: 02-scenario-configuration-experience*
*Context gathered: 2026-04-19*

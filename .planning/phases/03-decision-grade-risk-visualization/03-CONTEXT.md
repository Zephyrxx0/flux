# Phase 3: Decision-Grade Risk Visualization - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver decision-grade visualization of simulation risk through a D3 chart and a zone heatmap with consistent severity signaling and readable transitions across updates.

This phase clarifies HOW to present existing simulation outputs. It does not add new simulation capabilities or AI reporting.

</domain>

<decisions>
## Implementation Decisions

### Chart Structure and Controls
- **D-01:** Use a multi-line chart that compares zones in one view.
- **D-02:** Default chart scope shows top 5 highest-risk zones, with a user toggle to show all zones.

### Heatmap Model and Layout
- **D-03:** Use an approximate stadium silhouette heatmap (not a tile grid).
- **D-04:** Use detailed hand-drawn polygon regions per zone for the Phase 3 map.

### Risk Thresholds and Legends
- **D-05:** Severity thresholds are locked to: Green `< 0.80`, Amber `0.80-0.95`, Red `>= 0.95`.
- **D-06:** These thresholds must be consistent between chart encoding, heatmap encoding, and legends.

### Animation Clarity Rules
- **D-07:** Animate all state changes (run updates and interaction-driven changes).
- **D-08:** Transition timing should be fast (`150-250ms`) to preserve responsiveness while maintaining context.

### the agent's Discretion
- Exact D3 rendering primitives (line interpolation, axis styling, tooltip implementation).
- Legend placement and typography as long as threshold semantics remain unchanged.
- Exact easing curve for animations, provided duration remains in the fast range.

</decisions>

<specifics>
## Specific Ideas

- Comparison-first chart behavior is important; the top-5 default is intended to reduce clutter while preserving a show-all path.
- The heatmap should visually resemble a stadium footprint rather than abstract tiles.
- Motion should be visible but snappy; avoid slow transitions that make risk interpretation feel delayed.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirement anchors
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria.
- `.planning/REQUIREMENTS.md` — VIZ-01, VIZ-02, and VIZ-03 definitions.
- `.planning/PROJECT.md` — Product constraints and architecture intent.

### Prior decisions that constrain implementation
- `.planning/phases/02-scenario-configuration-experience/02-CONTEXT.md` — Phase 2 UI/interaction and stack decisions.
- `.planning/phases/01-deterministic-simulation-core/01-CONTEXT.md` — Simulation output and invariant expectations.

### Existing data contracts and integration points
- `src/simulation/contracts/output.schema.ts` — `phaseZoneMatrix`, severity fields, and output contract consumed by visuals.
- `src/components/layout/AppLayout.tsx` — Existing placeholder integration point for chart and heatmap in main workspace.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SimulationOutputSchema` in `src/simulation/contracts/output.schema.ts` provides explicit phase/zone rows and occupancy severity.
- `StadiumSim.run()` integration already exists in `src/components/config/ScenarioForm.tsx` to produce simulation output for visualization.
- Existing design tokens in `src/index.css` include chart color variables that can anchor visual consistency.

### Established Patterns
- React + Vite + Tailwind + shadcn/ui stack is already established from Phase 2.
- Sidebar/main split layout exists in `AppLayout`, with main area reserved for Phase 3 visualizations.

### Integration Points
- Visualization components should mount in the current `SidebarInset` main workspace area.
- Chart and heatmap should consume the same normalized simulation output and shared severity threshold mapping.

</code_context>

<deferred>
## Deferred Ideas

- None - discussion stayed within phase scope.

</deferred>

---

*Phase: 03-decision-grade-risk-visualization*
*Context gathered: 2026-04-19*

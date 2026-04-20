# Phase 3: Decision-Grade Risk Visualization - Research

**Researched:** 2026-04-19  
**Domain:** React + Vite risk visualization (D3 chart + SVG zone heatmap)  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use a multi-line chart that compares zones in one view.
- **D-02:** Default chart scope shows top 5 highest-risk zones, with a user toggle to show all zones.
- **D-03:** Use an approximate stadium silhouette heatmap (not a tile grid).
- **D-04:** Use detailed hand-drawn polygon regions per zone for the Phase 3 map.
- **D-05:** Severity thresholds are locked to: Green `< 0.80`, Amber `0.80-0.95`, Red `>= 0.95`.
- **D-06:** These thresholds must be consistent between chart encoding, heatmap encoding, and legends.
- **D-07:** Animate all state changes (run updates and interaction-driven changes).
- **D-08:** Transition timing should be fast (`150-250ms`) to preserve responsiveness while maintaining context.

### Claude's Discretion
- Exact D3 rendering primitives (line interpolation, axis styling, tooltip implementation).
- Legend placement and typography as long as threshold semantics remain unchanged.
- Exact easing curve for animations, provided duration remains in the fast range.

### Deferred Ideas (OUT OF SCOPE)
- None - discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIZ-01 | User can view a D3 chart of zone density by event phase. | Multi-line D3 SVG with keyed join and top-5/show-all filtering. |
| VIZ-02 | User can view a zone heatmap with consistent green/amber/red thresholds. | SVG polygon map with shared threshold scale and common legend model. |
| VIZ-03 | User can perceive simulation updates through animated transitions without losing state clarity. | 150-250ms transitions, stable domains, reduced-motion fallback, keyed transitions. |
</phase_requirements>

## Summary
Phase 3 should use one shared risk-encoding module that drives both visualizations. The chart and heatmap must not compute thresholds independently. Instead, centralize threshold constants and color/token mapping, then consume this in both D3 chart rendering and SVG polygon fill logic. This directly enforces D-05 and D-06.

Best implementation pattern in this codebase is React-owned data derivation plus D3-owned scales/path generation and transition orchestration inside isolated visualization components. Keep App layout wiring simple: read latest simulation output from shared state, derive chart series + heatmap zone state once, render both views from the same normalized structure.

Primary technical risk: current simulation severity helper uses different boundaries (`<0.8`, `<1.0`, `<1.2`, `critical`) than locked Phase 3 thresholds (`<0.8`, `0.8-0.95`, `>=0.95`). If not addressed, chart/heatmap legend consistency will drift and VIZ-02/VIZ-03 can fail by design.

## Recommended Implementation Direction
1. Add a visualization state slice (or selector) that stores the latest simulation output payload currently logged in ScenarioForm run handler.
2. Build a shared mapper module that converts `phaseZoneMatrix` into:
   - line-series rows per zone across phase order
   - per-zone latest ratio for heatmap fill
   - top-5 by peak ratio (default view)
3. Create one threshold utility for Phase 3:
   - thresholds: `[0.8, 0.95]`
   - labels: Green, Amber, Red
   - color tokens mapped to CSS variables
   - helper: `riskBandFromRatio(ratio)`
4. Implement D3 multi-line chart as SVG:
   - x: phase order (point or band)
   - y: occupancy ratio (linear)
   - line generator with stable keyed join by zone id
   - top-5 default, show-all toggle via UI control
5. Implement heatmap as static SVG silhouette with `<polygon>` per zone and fill from same threshold utility.
6. Apply synchronized transitions (150-250ms, ease-out), preserve stable y-domain across updates, and support reduced motion.

## Standard Stack

### Core
| Library | Verified Version | Purpose | Why Standard |
|---------|------------------|---------|--------------|
| d3 | 7.9.0 | scales, line generation, keyed data joins, transitions | Official D3 APIs cover all required chart and transition behavior in one package. |
| react + react-dom | 19.2.5 | component integration and state-driven rendering | Already established in repo; avoids introducing competing view layers. |

### Supporting
| Library | Verified Version | Purpose | When to Use |
|---------|------------------|---------|-------------|
| @types/d3 | 7.4.3 | TypeScript definitions for D3 modules | Use if editor/TS type inference is insufficient with current imports. |
| Vitest + RTL | 4.1.4 + 16.3.2 | component and behavior tests | Existing test stack for VIZ requirement verification. |

Installation:

```bash
npm install d3
npm install -D @types/d3
```

Version verification used:
- `npm view d3 version` -> `7.9.0`
- `npm view @types/d3 version` -> `7.4.3`
- Publish dates from npm metadata:
  - d3 7.9.0 published 2024-03-12
  - @types/d3 7.4.3 published 2023-11-07

## Architecture Patterns

### Integration points in this repo
- Layout mount point: `src/components/layout/AppLayout.tsx`
- Simulation output contract: `src/simulation/contracts/output.schema.ts`
- Current run trigger: `src/components/config/ScenarioForm.tsx`
- Existing test harness: `vitest.config.ts` + `tests/ui/*.test.ts`

### Pattern 1: Shared risk encoding module (required)
Use one source of truth for threshold boundaries and labels, consumed by both chart and heatmap.

### Pattern 2: React data prep, D3 rendering islands
Prepare normalized arrays in React (`useMemo`), then let D3 handle scale math/path generation and animated joins in `useEffect` with stable keys.

### Pattern 3: SVG polygon heatmap over tile/grid
Use fixed zone polygon coordinate map keyed by `zoneId`, filled from shared threshold mapper.

### Anti-patterns to avoid
- Recomputing thresholds separately per component.
- Auto-rescaling y-domain every update (destroys readability).
- Using index-based joins instead of keyed joins on `zoneId`.
- Driving heatmap from simulation `occupancySeverity` directly without applying locked Phase 3 thresholds.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Threshold bucket logic in many places | ad-hoc if/else in each component | single threshold utility + D3 threshold scale | Prevents drift and legend mismatch. |
| Enter/update/exit DOM bookkeeping | manual node lifecycle code | D3 keyed join pattern | Less bug-prone during show-all toggles and reruns. |
| Stadium shape engine | runtime geometry generator | static hand-drawn SVG polygon map | Locked decision D-04; deterministic and testable. |

## Common Pitfalls
1. Threshold mismatch with simulation core severities. Fix by introducing explicit visualization thresholds and not reusing core severity labels as-is.
2. Top-5 ordering instability across quick reruns. Fix by sorting on peak ratio with deterministic tie-breaker (zoneId).
3. Visual flicker during toggle/run transitions. Fix with keyed joins, fixed domains, and short ease-out transitions.
4. Motion overload for sensitive users. Fix with `prefers-reduced-motion` support and reduced duration/disabled interpolation.

## Animation Guidance (VIZ-03)
- Duration window: 150-250ms (locked).
- Use ease-out (`cubicOut`) for position/path interpolation.
- Keep y-axis domain stable per run session; only update when data exceeds configured max policy.
- Animate opacity and path morph, not large-scale layout shifts.
- Reduced motion mode: minimize or remove interpolation while keeping state updates immediate and clear.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build + tests | Yes | v24.13.0 | - |
| npm | dependency install | Yes | 11.1.0 | - |
| d3 package | VIZ-01 chart behavior | No (not installed yet) | - | None for locked D3 requirement |

Missing dependencies with no fallback:
- d3 must be installed before Phase 3 implementation.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4 + React Testing Library |
| Config file | vitest.config.ts |
| Quick run command | npm run test -- tests/ui/layout.test.ts |
| Full suite command | npm run test |

### Requirement -> test map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIZ-01 | D3 multi-line chart renders zone series and top-5/show-all toggle behavior | UI integration | `npm run test -- tests/ui/visualization.chart.test.ts` | No (Wave 0) |
| VIZ-02 | Polygon heatmap fills by shared threshold mapping and legend consistency | UI integration | `npm run test -- tests/ui/visualization.heatmap.test.ts` | No (Wave 0) |
| VIZ-03 | 150-250ms transition policy and reduced-motion behavior preserve readability | UI behavior | `npm run test -- tests/ui/visualization.motion.test.ts` | No (Wave 0) |

Wave 0 gaps:
- Add visualization fixtures from simulation output schema for deterministic zone/phase snapshots.
- Add three new UI test files listed above.
- Add one shared test helper to render visualization workspace with mocked simulation output.

## Project Constraints (from CLAUDE.md)
- Before architecture/codebase answers, read graphify output report if present.
- Prefer graphify wiki index when available.
- After modifying code files, run graphify update.

Note: graphify output directory was not present in this workspace during this research pass, so graph report constraints could not be applied.

## Sources

Primary (HIGH)
- D3 threshold scales: https://d3js.org/d3-scale/threshold
- D3 line generator: https://d3js.org/d3-shape/line
- D3 data joins: https://d3js.org/d3-selection/joining
- D3 transitions: https://d3js.org/d3-transition
- Vitest guide: https://vitest.dev/guide/
- React Testing Library intro: https://testing-library.com/docs/react-testing-library/intro/
- MDN SVG polygon: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polygon
- MDN reduced motion: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

Secondary (MEDIUM)
- Repository implementation context from ROADMAP/REQUIREMENTS/STATE and Phase 3 context + current source files.

## Confidence Breakdown
- Standard stack: HIGH (official docs + npm registry verification)
- Architecture: HIGH (fits locked decisions and existing repo wiring)
- Pitfalls: HIGH (directly observed threshold contract mismatch and common D3 join/transition risks)

Ready for planning

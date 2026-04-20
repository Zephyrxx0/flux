# Phase 4: Structured AI Risk Reporting - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver grounded, structured AI risk reporting from simulation output with schema-hard parsing and deterministic fallback behavior. This phase adds reporting generation and failure handling, not new simulation mechanics.

</domain>

<decisions>
## Implementation Decisions

### Report Contract and Validation
- **D-01:** Use a strict fixed report schema with exact required keys, enums, and numeric ranges; reject malformed or extra/missing fields.
- **D-02:** Every accepted report must include all mandatory sections: overall risk + confidence, top critical zones with phase context, actionable staffing recommendations, assumptions/limitations, machine-readable evidence block, and executive summary text.
- **D-03:** Schema validation remains a hard gate: only schema-valid content is rendered as AI output.

### Fallback Strategy
- **D-04:** On AI failure or invalid response, generate a full structured deterministic fallback report (not a compact summary).
- **D-05:** Fallback output must mirror the same section structure as the AI report so UI and export consumers can rely on a single contract.

### Trigger and Run Lifecycle
- **D-06:** Report generation triggers automatically after each successful simulation run.
- **D-07:** Keep one Gemini call per run as the cost/determinism policy; no automatic retry loop.

### Failure UX and Retry Policy
- **D-08:** On timeout/error/invalid output, show inline error messaging plus immediate fallback rendering.
- **D-09:** Provide a user-initiated Retry action in the report panel; retry does not block the rest of the workspace.
- **D-10:** Report failures must not clear simulation visuals or block visualization interpretation.

### the agent's Discretion
- Exact copy tone for error and fallback banners.
- Internal helper/module boundaries for report assembly and parsing.
- Precise confidence-band thresholds as long as they are deterministic and schema-validated.

</decisions>

<specifics>
## Specific Ideas

- The report should be briefing-friendly while still machine-parseable: human narrative plus structured evidence in one contract.
- Retry should be explicit and operator-controlled rather than automatic.
- Failure transparency matters: users should know AI failed, but still get deterministic recommendations immediately.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` - Phase 4 goal, success criteria, and dependency boundaries.
- `.planning/REQUIREMENTS.md` - AI-01, AI-02, and AI-03 requirement definitions.
- `.planning/PROJECT.md` - project-level AI constraints, one-call-per-run direction, and delivery framing.

### Prior locked context
- `.planning/phases/01-deterministic-simulation-core/01-CONTEXT.md` - simulation/output contract assumptions that feed report grounding.
- `.planning/phases/02-scenario-configuration-experience/02-CONTEXT.md` - run-trigger and validation UX conventions from scenario workflow.
- `.planning/phases/03-decision-grade-risk-visualization/03-CONTEXT.md` - shared risk threshold and readability expectations for downstream consistency.

### Existing code contracts and integration points
- `src/simulation/contracts/output.schema.ts` - simulation output source of truth for report grounding.
- `src/hooks/useScenarioStore.ts` - latest simulation output state and run-lifecycle integration surface.
- `src/components/config/ScenarioForm.tsx` - explicit run trigger path and simulation invocation behavior.
- `src/visualization/components/VisualizationWorkspace.tsx` - main workspace state handling and empty/error composition baseline.
- `src/components/layout/AppLayout.tsx` - report panel placement/integration shell.

### Architecture and stack research
- `.planning/research/ARCHITECTURE.md` - recommended AI adapter/report boundary and fallback behavior.
- `.planning/research/STACK.md` - Gemini SDK/model and schema-validation stack guidance.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SimulationOutputSchema` and `SimulationOutput` in `src/simulation/contracts/output.schema.ts` provide deterministic metrics and invariants for grounding report evidence.
- `useScenarioStore` in `src/hooks/useScenarioStore.ts` already stores `latestSimulationOutput` and is the natural report trigger source.
- `ScenarioForm` already enforces schema-valid run submission before simulation execution.

### Established Patterns
- Zod-first boundary validation is already established for persisted input and simulation contracts.
- Explicit run action exists in configuration UX, with non-blocking visualization updates.
- Shared risk semantics are already centralized for chart and heatmap consistency.

### Integration Points
- Add report state and generation flow adjacent to current visualization workspace, consuming `latestSimulationOutput`.
- Wire a report panel component into the main content area in `AppLayout`/workspace composition.
- Keep fallback generation local and deterministic from `SimulationOutput` so report delivery is resilient when AI fails.

</code_context>

<deferred>
## Deferred Ideas

- Comparative multi-run narrative synthesis belongs to Phase 5 comparison workflow.
- Any backend proxy or server-side key brokering is outside this phase's current boundary.

</deferred>

---

*Phase: 04-structured-ai-risk-reporting*
*Context gathered: 2026-04-19*

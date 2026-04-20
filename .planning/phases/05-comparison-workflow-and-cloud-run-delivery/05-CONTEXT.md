# Phase 5: Comparison Workflow and Cloud Run Delivery - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a run-adjust-rerun comparison workflow with persisted run history, quantified intervention sensitivity narratives, briefing-ready export artifacts, and a publicly accessible Cloud Run deployment for end-to-end demo usage.

This phase clarifies HOW to implement comparison, export, and deployment in the existing static-app architecture. New backend service capabilities are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Comparison Baseline and Run History
- **D-01:** Comparison uses explicit baseline/candidate pair selection from persisted run history (not implicit latest-vs-previous only).
- **D-02:** Run history persistence uses local browser storage with schema validation, aligned to existing persisted store patterns.

### Sensitivity Narrative Rules
- **D-03:** Sensitivity narrative must include absolute delta, percent delta, and severity band transition for each compared metric.
- **D-04:** Narrative scope prioritizes top 3 changed zones plus an overall risk summary.

### Export Artifact Shape
- **D-05:** Phase 5 MVP export includes JSON export plus print-friendly HTML summary.
- **D-06:** Export content must include compared run metadata (timestamps, scenario names, hashes), top 3 zone deltas with severity transitions, action recommendation summary, and assumptions/limitations.

### Cloud Run Delivery Strategy
- **D-07:** Deployment target is a static Vite build served via Nginx container on Cloud Run.
- **D-08:** Deployment automation for this phase is documented manual `gcloud` deployment with checked-in `Dockerfile` and `nginx` config; full CI/CD is deferred.
- **D-09:** Demo acceptance path must explicitly verify: public `run.app` URL availability, SPA route refresh fallback behavior, and end-to-end run->compare->export flow on deployed app.

### the agent's Discretion
- Exact run-history record schema fields beyond required traceability metadata.
- Exact comparison panel layout and interaction microcopy.
- Exact print stylesheet details for the HTML briefing artifact.
- Exact command wrapper shape for documented deployment steps, as long as they are reproducible.

</decisions>

<specifics>
## Specific Ideas

- Baseline/candidate pairing should feel explicit and auditable instead of auto-comparing arbitrary recent runs.
- Sensitivity statements should read like operations guidance, not just raw charts.
- Export output should be usable by non-technical briefing recipients while preserving machine-readable JSON.
- Deployment verification should reflect real demo flow, not just container boot success.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and requirement anchors
- `.planning/ROADMAP.md` - Phase 5 goal, dependencies, and success criteria.
- `.planning/REQUIREMENTS.md` - CMP-01/02/03 and DEP-01/02/03 definitions.
- `.planning/PROJECT.md` - static-architecture constraints and Cloud Run framing.

### Prior locked decisions that constrain phase 5
- `.planning/phases/02-scenario-configuration-experience/02-CONTEXT.md` - explicit run trigger and saved-scenario persistence decisions.
- `.planning/phases/03-decision-grade-risk-visualization/03-CONTEXT.md` - shared risk threshold and readability conventions.
- `.planning/phases/04-structured-ai-risk-reporting/04-CONTEXT.md` - report structure, deterministic fallback, and run lifecycle expectations.

### Existing implementation contracts and integration points
- `src/hooks/useScenarioStore.ts` - persisted scenario state and latest simulation output wiring.
- `src/hooks/useRiskReportStore.ts` - one-call-per-run report lifecycle and retry behavior.
- `src/reporting/contracts/riskReport.schema.ts` - strict report section contract for export content reuse.
- `src/visualization/components/VisualizationWorkspace.tsx` - main workspace composition for comparison/export integration.
- `src/components/layout/AppLayout.tsx` - shell structure where comparison workflow and deployment-tested UX live.

### Architecture and deployment guidance
- `.planning/research/ARCHITECTURE.md` - static Cloud Run + Nginx deployment model and boundary rules.
- `.planning/research/STACK.md` - recommended Cloud Run packaging baseline and deploy constraints.
- `.vscode/mcp.json` - Cloud Run MCP configuration present in workspace.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useScenarioStore` already persists scenario inputs and can be extended for run history entries.
- `useRiskReportStore` already tracks per-run report generation lifecycle and fallback, useful for comparison export consistency.
- `RiskReportSchema` provides a strict shape that can anchor export section validation.

### Established Patterns
- Zod-validated boundaries for persisted and generated data.
- Explicit run lifecycle (user-triggered run, then downstream visualization/report updates).
- Main workspace composition keeps simulation outputs and report panel co-located.

### Integration Points
- Comparison state can attach to scenario/report stores without introducing backend dependencies.
- Export actions can compose from existing report + simulation output models.
- Deployment artifacts (`Dockerfile`, Nginx config, deploy doc) must be added and validated against existing Vite build output.

</code_context>

<deferred>
## Deferred Ideas

- Remote backend run-history storage (out of current static-app phase scope).
- Full CI/CD pipeline automation for Cloud Run (deferred after MVP deploy reliability).
- Custom domain and certificate setup (deferred unless demo requirements change).

</deferred>

---

*Phase: 05-comparison-workflow-and-cloud-run-delivery*
*Context gathered: 2026-04-19*

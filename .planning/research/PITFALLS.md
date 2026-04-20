# Domain Pitfalls

**Domain:** Predictive fan flow simulation for stadium pre-event planning
**Researched:** 2026-04-18
**Project context:** Greenfield, browser-first simulation, Gemini-generated risk report, Cloud Run demo delivery

## Critical Pitfalls

### Pitfall 1: Simulation model is mathematically clean but operationally unrealistic
**What goes wrong:** The simulator produces smooth outputs that look credible but do not reflect real stadium behavior (burst arrivals, gate imbalance, corridor spillover, halftime nonlinear surges).
**Why it happens:** Teams optimize for implementation speed and visuals before defining realistic assumptions and constraints.
**Consequences:** Recommendations are wrong in the moments that matter most; confidence in the tool collapses after first operator review.
**Warning signs:**
- Zone densities barely change across very different presets.
- Delay changes produce linear improvements only, with no bottleneck knock-on effects.
- Exit and halftime patterns look symmetric or too stable.
- SMEs ask "where is corridor pressure" or "why is Zone A unaffected by Gate 2 delay?"
**Prevention strategy:**
- Define and document explicit modeling assumptions before UI polish (arrival curves by phase, gate throughput caps, spillover heuristics, critical thresholds).
- Build deterministic benchmark scenarios with expected outcomes (for example: Gate Crisis must spike Zone A/B during Entry).
- Add sensitivity checks: small input changes should produce plausible directional output changes.
- Keep model parameters externally configurable so tuning does not require code rewrites.
**Recommended phase to address it:** Days 1-2 (Simulation Engine deep dive), then re-validate during Days 7-8 wiring.

### Pitfall 2: Hidden unit/time inconsistencies corrupt risk outputs
**What goes wrong:** Different components use inconsistent units (fans/min vs fans/phase, density 0-1 vs 0-100), causing incorrect thresholds and misleading "critical" flags.
**Why it happens:** Fast iteration across engine, chart, and AI prompt without a strict schema contract.
**Consequences:** Chart colors, critical zones, and Gemini report can disagree for the same run.
**Warning signs:**
- UI shows 85% while JSON stores 0.85 but prompt says 85 as raw number.
- Risk level flips when only formatting code changed.
- Same run produces different critical zone lists after refactor.
**Prevention strategy:**
- Create a canonical simulation schema with units for every field (`densityRatio`, `densityPct`, `throughputPerMin`, timestamps in minutes).
- Enforce schema validation at the simulation boundary before visualization and before Gemini call.
- Add contract tests for serialization/parsing of `SimResult` and report input payload.
- Centralize threshold constants in one module used by engine, UI, and report mapping.
**Recommended phase to address it:** Days 1-2 (data model contract), reinforced in Days 5-6 (D3) and Days 9-10 (Gemini integration).

### Pitfall 3: LLM report appears authoritative but is not reliably grounded in simulation data
**What goes wrong:** Gemini generates fluent recommendations that are generic, contradictory, or not traceable to computed metrics.
**Why it happens:** Prompt asks for narrative quality without strict output schema and grounding constraints.
**Consequences:** Operational recommendations become non-auditable; trust and judge confidence drop.
**Warning signs:**
- Report mentions zones/phases not present in `SimResult`.
- Suggested actions do not correspond to top peak zones.
- Same input yields materially different recommendations each run.
**Prevention strategy:**
- Require strict JSON output schema and reject/repair non-conforming responses.
- Include explicit grounding instructions: every critical alert must cite zone, phase, and density from provided JSON.
- Add deterministic post-checks: validate referenced zones/phases exist and match top-risk metrics.
- Provide fallback deterministic rule-based summary when LLM response fails validation.
**Recommended phase to address it:** Days 9-10 (Gemini integration), with schema scaffolding prepared in Days 1-2.

### Pitfall 4: "Pretty chart" bias masks decision usability
**What goes wrong:** Visualization emphasizes animation over decision support, making it hard to answer practical questions (where to add staff, when to intervene, expected impact).
**Why it happens:** D3 complexity consumes bandwidth; UX for ops decisions is deferred.
**Consequences:** Demo looks impressive but fails decision-making criteria.
**Warning signs:**
- Users cannot quickly identify top 3 risk windows.
- No clear mapping from chart state to recommended action.
- Stakeholders ask for "so what should we do now?"
**Prevention strategy:**
- Define decision tasks first (identify critical zone, time window, action priority) and design visuals to support those tasks.
- Add persistent annotations for peak events and threshold crossings.
- Align colors/labels across ZoneGrid, chart, and report severity levels.
- Include one-click scenario comparison deltas (before/after gate delay reduction).
**Recommended phase to address it:** Days 5-6 (visualization design) and Days 11-12 (usability polish).

### Pitfall 5: Security and key-handling shortcuts create demo and compliance risk
**What goes wrong:** Gemini key leaks in client bundle/repo or is mishandled during build/deploy.
**Why it happens:** Hackathon urgency encourages quick env handling without a threat check.
**Consequences:** Credential compromise, blocked demo, reputational risk.
**Warning signs:**
- API key appears in source history, screenshots, or logs.
- Bundle inspection reveals raw key string.
- Team relies on local `.env` without deployment secret discipline.
**Prevention strategy:**
- Treat key exposure as a release blocker with explicit pre-deploy checklist.
- Use deployment-time secret injection and never commit local env files.
- Add lightweight automated scan for key patterns in repo and build artifacts.
- Define emergency rotation procedure before first public demo.
**Recommended phase to address it:** Days 11-12 (deployment hardening), with guardrails created from Day 1.

## Moderate Pitfalls

### Pitfall 6: Scenario presets do not produce meaningfully distinct outcomes
**What goes wrong:** Normal, Sold Out, and Gate Crisis look too similar, weakening product story and comparison value.
**Warning signs:**
- Risk level unchanged across presets.
- Peak densities move only marginally despite major parameter shifts.
- Judges cannot tell which intervention had impact.
**Prevention strategy:**
- Calibrate presets against target deltas (for example: Gate Crisis must push one zone above critical threshold; mitigation run must bring it below).
- Add acceptance thresholds per preset in test fixtures.
- Include scenario-diff summary in output (`risk delta`, `peak zone delta`, `time-to-peak`).
**Recommended phase to address it:** Days 7-8 (end-to-end wiring) and Days 9-10 (report comparison text).

### Pitfall 7: No reproducibility baseline for simulation and report
**What goes wrong:** Teams cannot explain why outputs changed between commits.
**Warning signs:**
- Demo behavior differs after unrelated UI changes.
- No saved golden outputs for canonical scenarios.
**Prevention strategy:**
- Store golden `SimResult` fixtures for baseline scenarios and run snapshot/contract tests.
- Version prompt templates and include version metadata in each report.
- Add "simulation hash" metadata to tie chart/report to exact input state.
**Recommended phase to address it:** Days 1-2 (fixture setup), maintained through Days 9-10.

### Pitfall 8: Late mobile/responsive checks break live judging demo
**What goes wrong:** Layout breaks on smaller screens; controls or report pane become unusable.
**Warning signs:**
- Horizontal overflow in sidebar/chart region.
- Critical controls hidden below fold with no affordance.
**Prevention strategy:**
- Define minimum supported viewport and responsive layout rules early.
- Add quick manual test matrix for common laptop/tablet widths used in judging.
- Keep a fallback simplified single-column view for live demos.
**Recommended phase to address it:** Days 3-4 (layout foundations), validated again Days 11-12.

## Minor Pitfalls

### Pitfall 9: Over-ambitious feature creep undermines MVP completion
**What goes wrong:** Team adds live telemetry, multi-tenant admin, or backend complexity despite explicit out-of-scope boundaries.
**Warning signs:**
- New tasks appear that do not improve pre-event decision support.
- Core simulation/report quality work gets postponed.
**Prevention strategy:**
- Enforce scope gate: every new feature must map to judging impact and MVP objectives.
- Maintain explicit "not now" list and revisit only after demo-ready milestone.
**Recommended phase to address it:** Continuous; gate decisions during planning and every phase transition.

### Pitfall 10: Insufficient failure-mode UX for Gemini/API outages
**What goes wrong:** Simulation runs, but report pane fails silently or blocks the workflow when API errors occur.
**Warning signs:**
- Blank report area with no error explanation.
- Retry requires full app refresh.
**Prevention strategy:**
- Treat AI report as enhancement, not single point of failure.
- Show explicit error states and provide retry + local heuristic fallback summary.
- Separate simulation completion from report generation status in UI.
**Recommended phase to address it:** Days 9-10 (integration) and Days 11-12 (hardening).

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Days 1-2: Engine + data model | Unrealistic assumptions; unit mismatch | Lock schema + units; create benchmark scenarios and golden outputs |
| Days 3-4: Sidebar + config UX | Inputs disconnected from meaningful simulation effects | Add sanity checks and visible parameter-to-impact mapping |
| Days 5-6: D3 + ZoneGrid | Visual polish over decision clarity | Add threshold annotations and action-oriented legends |
| Days 7-8: End-to-end wiring | Presets too similar; state sync bugs | Validate per-preset acceptance deltas and contract tests |
| Days 9-10: Gemini integration | Ungrounded or invalid AI output | Enforce strict JSON schema, grounding checks, deterministic fallback |
| Days 11-12: Deploy + polish | Key leakage; responsive demo failures | Secret hygiene checklist, key scan, responsive test matrix |
| Day 13: Submission | Story does not show intervention impact | Demo script with scenario comparison and quantified improvement |

## Planning Guardrails for Roadmap

1. Add an explicit "Model Assumptions + Validation" milestone gate before heavy UI polish.
2. Add a "Data Contract Freeze" checkpoint before Gemini integration.
3. Add "Scenario Calibration" acceptance criteria to MVP definition.
4. Add "AI Grounding + Fallback" acceptance criteria for report readiness.
5. Add "Deployment Security + Demo Resilience" checklist as release blocker.

## Sources

- Internal project context: `PROJECT.md`
- Internal technical plan: `predictive-fan-flow-plan.md`
- Internal architecture execution guide: `idea8_predictive_fan_flow_technical_plan.html`

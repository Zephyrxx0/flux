# Feature Landscape

**Domain:** Pre-event stadium safety simulation planning tool (predictive fan flow)
**Project:** Predictive Fan Flow Simulator
**Milestone Context:** Greenfield
**Researched:** 2026-04-18

## Table Stakes

Features users expect in a credible safety simulation planner. Missing any of these makes the tool feel like a demo toy instead of an operations aid.

| Feature | Why Expected | Complexity | Dependencies | Project-Specific Notes |
|---------|--------------|------------|--------------|------------------------|
| Scenario configuration panel (capacity, gates, delays, phase timing) | Ops teams need to model their actual event setup before trusting outputs | Medium | Core simulation model, config defaults, validation rules | Must expose total capacity, gate delay, over-capacity factor, halftime duration, and preset switching from the sidebar flow described in the plan |
| Deterministic multi-phase simulation run | A planning tool must produce repeatable what-if results for decision meetings | High | StadiumSim engine, phase model, gate throughput logic | Engine must model Entry/First Half/Halftime/Second Half/Exit with cumulative occupancy and delayed-gate throughput effects |
| Zone-level risk visualization over time | Users need instant visual detection of dangerous phases/zones | Medium | Simulation output schema, charting layer, density thresholds | D3 phase x zone density chart plus zone heatmap (A-F) with shared threshold colors (green/amber/red) |
| Structured risk report output | Planners need an interpretable artifact to act on, not raw numbers | Medium | Stable SimResult JSON, report schema, rendering component | Risk report must show overall risk, critical zone alerts, and staffing actions in a consistent schema |
| Scenario comparison workflow (run, adjust, rerun) | Planning decisions require tradeoff checks, not one isolated run | Medium | Config state management, cached run results or quick recompute | UX should make changes obvious (for example, gate delay 20 min to 5 min) and highlight resulting density drop |
| Baseline scenario presets | Safety planners expect fast starting points for tabletop planning | Low | Config presets model | Normal Event, Sold Out Rush, and Gate Crisis are mandatory for judge/demo narrative and quick iteration |
| Failure and loading states for simulation/report generation | Tool reliability is table stakes for operational trust | Low | Hook state management, UI states | Keep explicit isRunning and report loading/error states; never show stale report after a new run |

## Differentiators

Features that make this specific product stand out for judging and practical adoption.

| Feature | Value Proposition | Complexity | Dependencies | Project-Specific Notes |
|---------|-------------------|------------|--------------|------------------------|
| AI-generated, action-oriented staffing recommendations from simulation JSON | Bridges analytics to operations by proposing concrete interventions | Medium | High-quality structured prompt, strict output schema, Gemini integration | Must remain grounded in simulation data (zone, phase, density, suggested staff movement), not generic safety text |
| Critical-zone intervention sensitivity narrative ("if X changes, risk drops to Y") | Turns simulator into a decision support tool, not just a detector | High | Multi-run comparison logic, delta metrics, report templating | Example target: show how reducing gate delays changes Zone A peak density from critical to manageable |
| Combined chart + heatmap + risk panel single-screen workflow | Faster operator cognition than tabbed analytics tools | Medium | Cohesive UI layout, synchronized phase selection/state | The two-column app layout is part of product identity; maintain run-first workflow with immediate visual + textual feedback |
| Judge-ready scenario storytelling (Normal vs Sold Out vs Gate Crisis) | Strong demoability and clearer communication of practical impact | Low | Presets, comparison UX, report clarity | Keeps hackathon pitch tight and reproducible while still reflecting plausible operations scenarios |
| Exportable report artifact for briefing | Enables handoff from planner to staff lead without live app session | Medium | Report rendering, formatting, export utility | Prioritize simple structured export (JSON/print-friendly first); richer PDF polish can follow after MVP |

## Anti-Features

Features to explicitly avoid in this project phase; they increase scope but do not improve MVP decision quality.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time IoT/sensor ingestion and live incident command dashboard | Contradicts pre-event planning scope and introduces backend + reliability overhead | Keep simulator offline/pre-event and explicitly document that live telemetry is out of scope |
| Native mobile apps | Splits frontend effort and weakens core simulation/analysis quality in a 13-day window | Deliver responsive web UI only |
| Multi-tenant org admin, RBAC, and audit suite | Enterprise platform concerns are not needed for hackathon judging or MVP learning | Use a single-session operator workflow with local scenario inputs |
| Full digital twin (3D rendering, agent-based micro-movement physics) | High complexity with poor timeline fit and high risk of unfinished delivery | Keep phase-level zone density model with transparent assumptions |
| Backend orchestration service for simulation and report persistence | Adds deployment and ops complexity without immediate MVP value | Run simulation client-side and perform one API call per run for report generation |
| Chatbot-style freeform AI assistant | Encourages hallucinated advice and weakens structured safety analysis | Enforce schema-first report generation from deterministic simulation output |

## Feature Dependencies

Key dependency chains for implementation planning:

```text
Config defaults + validation -> Sidebar controls -> SimConfig state
SimConfig state -> StadiumSim.run() -> SimResult JSON
SimResult JSON -> (SimChart + ZoneGrid) visualization
SimResult JSON + prompt contract -> Gemini report generation -> RiskReport rendering
Presets + rerun workflow -> Scenario comparison insights
Scenario comparison insights -> Actionable intervention recommendations
```

## MVP Recommendation (Project-Specific)

Prioritize build order:
1. Scenario configuration + deterministic StadiumSim engine
2. Zone visualization (chart + heatmap) with critical threshold highlighting
3. Structured risk report generation from simulation output
4. Scenario comparison pass for intervention sensitivity

Defer until after MVP demo stability:
1. Rich export formatting (advanced PDF styling)
2. Extended scenario library beyond the three core presets
3. Advanced calibration tooling for venue-specific tuning

## Confidence

**Overall confidence:** HIGH for project fit, based on direct alignment with provided project docs and constraints.

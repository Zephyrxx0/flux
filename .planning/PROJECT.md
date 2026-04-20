# Predictive Fan Flow Simulator

## What This Is

A browser-based pre-event planning tool for stadium operations teams to simulate crowd movement under different scenarios before an event starts. Users configure capacity, gates, delays, and phase timing, run the simulation, and receive a structured Gemini-generated risk report with actionable staffing recommendations. It is built for PromptWars Virtual using Google Antigravity and deployed to Google Cloud Run.

## Core Value

Operations managers can identify and mitigate crowd risk before kickoff by running scenario-based simulations that produce actionable, zone-specific safety recommendations.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Configure stadium and scenario parameters from a control panel.
- [ ] Run phase-based crowd simulation and visualize zone density over time.
- [ ] Generate structured AI risk reports from simulation output.
- [ ] Compare scenario outcomes to support pre-event planning decisions.
- [ ] Deploy a public Cloud Run demo suitable for hackathon judging.

### Out of Scope

- Real-time live sensor ingestion during events — this project focuses on pre-event simulation, not operational telemetry.
- Native mobile apps — web-first scope for hackathon timeline and delivery speed.
- Multi-tenant enterprise admin features — unnecessary for v1 judging criteria.

## Context

Project context comes from two comprehensive planning documents in this repository:
- `predictive-fan-flow-plan.md` (full technical plan, timeline, prompts, deploy and submission checklist)
- `idea8_predictive_fan_flow_technical_plan.html` (tabbed execution guide and architecture narrative)

The concept is a four-layer system:
1. Configuration UI (React + Tailwind)
2. Simulation engine (`StadiumSim`) for zone occupancy and density modeling
3. Visualization layer (D3 chart + zone heatmap)
4. Gemini 1.5 Flash risk reasoning over structured simulation JSON

Hackathon framing and deadlines strongly shape scope. The project is intended to be demo-ready by around day 9 with deployment and submission assets finalized by day 13.

## Constraints

- **Timeline**: About 13 days — hackathon window requires strict MVP-first sequencing.
- **Platform**: Google Cloud Run deployment — final demo must be publicly reachable as `*.run.app`.
- **Tooling**: Google Antigravity required — implementation should preserve prompt-driven build workflow.
- **Architecture**: No traditional backend service — simulation runs client-side, app served as static assets.
- **AI Integration**: Gemini key handling via build-time injection — avoid committing secrets and keep deployment repeatable.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use React + Vite + Tailwind + D3 | Fast build velocity plus expressive, custom visualization for simulation output | — Pending |
| Keep simulation client-side in `StadiumSim` | Removes backend complexity and speeds Cloud Run deployment | — Pending |
| Trigger one Gemini call per simulation run | Controls cost and keeps report generation deterministic | — Pending |
| Prioritize scenario presets (Normal, Sold Out, Gate Crisis) | Strengthens demo narrative and judge-facing clarity | — Pending |
| Deploy as static app on Cloud Run with Nginx | Meets platform requirement with minimal operational overhead | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-18 after initialization*

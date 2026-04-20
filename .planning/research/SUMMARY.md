# Project Research Summary

**Project:** Predictive Fan Flow Simulator
**Domain:** Pre-event stadium safety simulation planning
**Researched:** 2026-04-18
**Confidence:** HIGH

## Executive Summary

This is a browser-first decision-support product for pre-event crowd safety planning. The strongest implementation pattern is a deterministic local simulation core (phase x zone fan-flow modeling) paired with clear visual risk outputs and a tightly constrained AI report layer for action recommendations. Experts in this space prioritize reproducibility and traceability over visual novelty: operators must see why risk appears, where it appears, and what intervention changes it.

Recommended approach: ship a modular frontend monolith (React + Vite + TypeScript) with a pure `StadiumSim` engine, D3 risk visualizations, and one post-run Gemini call validated through a strict schema. Deploy as a static SPA on Cloud Run for speed and operational simplicity. Treat AI as augmentation, not source-of-truth.

Main risks are model realism drift, unit/schema inconsistencies across engine-chart-report boundaries, and ungrounded AI outputs. Mitigation is to freeze data contracts early, enforce deterministic fixture tests, require grounded JSON-only AI responses, and keep a deterministic fallback report path.

## Key Findings

### Stack

React + Vite + TypeScript + Tailwind 4 is the most practical baseline for fast iteration and maintainability. D3 is the right primary visualization engine for phase/zone-specific safety views, while Gemini integration should use `@google/genai` with stable model IDs and Zod validation for response contracts.

Core stack recommendations:
- React 19 + Vite 8 + TypeScript 6 for UI speed and strong typing.
- Tailwind 4 (+ `@tailwindcss/vite`) for rapid control-panel and dashboard implementation.
- D3 7.9 for custom risk visualization fidelity.
- `@google/genai` + Gemini 2.5 Flash for low-latency structured analysis.
- Zod for strict report schema validation.
- Cloud Run + Artifact Registry for deploy simplicity and current Google Cloud best practice.

### Table Stakes

Must-have features for MVP credibility:
- Scenario configuration controls for capacity, gate delay, throughput, and phase timing.
- Deterministic multi-phase simulation with repeatable outputs.
- Zone-level risk visualization over time (chart + heatmap with consistent thresholds).
- Structured risk report (overall risk, critical zones, staffing actions).
- Run-adjust-rerun comparison flow for intervention testing.
- Core presets: Normal Event, Sold Out Rush, Gate Crisis.
- Explicit loading/error/fallback states to avoid stale or silent failures.

### Watch Outs

Top pitfalls to design against:
1. Unrealistic simulation assumptions produce confident but wrong recommendations.
2. Unit/contract drift (`0-1` vs `0-100`, per-minute vs per-phase) causes contradictory risk outputs.
3. AI recommendations that are fluent but ungrounded in `SimResult` data.
4. Visual polish overshadowing decision usability (operators cannot map chart to action).
5. API key handling shortcuts that create deploy/demo risk.

## Implications for Roadmap

### Implementation Priorities

1. **Simulation core + data contracts first**
- Deliver: locked `SimConfig` and `SimResult`, deterministic engine fixtures, threshold constants.
- Why first: every feature (visuals, AI, reporting) depends on this contract stability.
- Pitfalls avoided: realism drift, unit mismatch, non-reproducible outputs.

2. **Configuration workflow + scenario presets**
- Deliver: validated sidebar inputs, stable state snapshots, calibrated baseline presets.
- Why second: enables meaningful run/re-run behavior and credible scenario variance.
- Pitfalls avoided: weak scenario differentiation and misleading comparisons.

3. **Decision-grade visualization layer**
- Deliver: D3 phase chart, zone heatmap, peak/threshold annotations, consistent severity mapping.
- Why third: fastest way to expose whether model outputs are operationally useful.
- Pitfalls avoided: "pretty chart" bias and unclear intervention windows.

4. **AI report adapter with strict grounding**
- Deliver: one-call-per-run prompt contract, JSON schema validation, grounding checks, fallback summary.
- Why fourth: adds differentiation only after deterministic outputs are stable and trustworthy.
- Pitfalls avoided: hallucinated recommendations and blocked workflow on API failure.

5. **Cloud Run hardening + demo resilience**
- Deliver: containerized SPA deployment, secret hygiene checklist, responsive test matrix, demo script.
- Why final: packaging and reliability should stabilize once core flows are complete.
- Pitfalls avoided: late deployment surprises, key leaks, mobile/demo failures.

### Research Flags

Needs deeper phase-level research:
- AI grounding and schema-hardening details for robust Gemini behavior under edge-case inputs.
- Security posture for browser-based key usage in a public demo context.

Standard patterns (can proceed without extra research phase):
- React/Vite SPA scaffolding and Cloud Run static deployment.
- Tailwind-based control panel layout and state-driven run lifecycle UX.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions and platform choices align with current docs and constraints. |
| Features | HIGH | Strong fit to pre-event planning workflow and judging expectations. |
| Architecture | HIGH | Boundaries and data flow are coherent with no-backend constraint. |
| Pitfalls | HIGH | Risks are concrete, phase-mapped, and mitigation-ready. |

**Overall confidence:** HIGH

### Gaps to Address

- Venue calibration realism still needs empirical tuning with domain feedback.
- AI recommendation consistency under near-tie risk scenarios needs targeted test fixtures.

## Sources

- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`
- Gemini API docs and Cloud Run docs referenced by source research files.

---
*Research completed: 2026-04-18*
*Ready for roadmap: yes*

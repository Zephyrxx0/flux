# Architecture Patterns

**Domain:** Predictive fan flow simulation (pre-event planning)
**Researched:** 2026-04-18
**Milestone context:** Greenfield
**Delivery target:** Production-grade hackathon demo in 13 days
**Deployment constraint:** Cloud Run
**Backend constraint:** No traditional backend service

## Recommended Architecture

Use a **frontend-first, compute-in-browser architecture** with a thin deployment shell:

1. **Client App (React + Vite)** owns UI, state orchestration, and user workflow.
2. **Simulation Engine (pure TypeScript/JavaScript module)** runs deterministic fan-flow simulation locally in the browser.
3. **Visualization Layer (D3 + UI components)** renders phase and zone outputs from simulation state.
4. **AI Analysis Adapter (Gemini client module)** performs one post-simulation API call for structured risk reasoning.
5. **Static Delivery Shell (Nginx on Cloud Run)** serves built assets and handles SPA routing; no business logic server.

This structure keeps operational complexity low while still producing a production-like architecture with clear boundaries, testable modules, and reliable deployment.

## Component Boundaries

| Component | Responsibility | Inputs | Outputs | Communicates With |
|-----------|----------------|--------|---------|-------------------|
| App Shell (`App`) | Route-level composition and high-level state wiring | User events, initial config | Props/state slices for children | Config Panel, Simulation Orchestrator, Visualization, Report Panel |
| Config Panel (`Sidebar`, presets) | Capture and validate scenario inputs | User controls | `SimConfig` | App Shell |
| Simulation Orchestrator (`useSimulation`) | Trigger simulation runs, manage run lifecycle states | `SimConfig`, run command | `SimResult`, run metadata (`idle/running/success/error`) | Simulation Engine, App Shell |
| Simulation Engine (`StadiumSim`) | Deterministic crowd-flow computation by phase/zone | `SimConfig` | `SimResult` (phase-zone densities, peaks, risk primitives) | Simulation Orchestrator |
| Visualization (`SimChart`, `ZoneGrid`, `PhaseSelector`) | Render simulation results for quick risk interpretation | `SimResult`, selected phase | Visual state only | App Shell |
| AI Adapter (`useGemini`, `geminiPrompt`) | Build structured prompt, call Gemini once per run, parse response | `SimResult`, scenario metadata | `GeminiReport` (`loading/success/error`) | Report Panel, App Shell |
| Report Panel (`RiskReport`) | Present AI recommendations and confidence indicators | `GeminiReport`, fallback heuristics | User-facing risk report | App Shell |
| Shared Domain Models (`config`, `types`, `utils`) | Canonical schemas, thresholds, formatters, color maps | Static constants | Reusable deterministic helpers | All components |
| Delivery Shell (`Dockerfile`, `nginx.conf`, Cloud Run service) | Build and serve SPA reliably | Built `/dist` assets | Public `*.run.app` app | End users/browser |

### Boundary Rules

- `StadiumSim` must be **pure and side-effect free** (no DOM, no network, no global state).
- `useGemini` must not mutate simulation state; it only consumes finalized `SimResult`.
- UI components are presentational; orchestration stays in hooks/App layer.
- No server-owned session state; scenario and outputs are browser-memory scoped per session.

## Data Flow (Direction and Contracts)

### Primary Flow

`User Input -> SimConfig -> Simulation Run -> SimResult -> (Visualization + AI Analysis) -> Risk Report`

### Detailed Direction

1. User changes sliders/toggles/presets in Config Panel.
2. App Shell stores normalized `SimConfig` in client state.
3. User clicks `Run Simulation`.
4. Simulation Orchestrator snapshots current `SimConfig` and calls `StadiumSim.run(config)`.
5. `StadiumSim` returns `SimResult` with zone/phase metrics, peaks, and derived risk primitives.
6. Visualization components re-render immediately from `SimResult`.
7. AI Adapter receives the same immutable `SimResult`, builds prompt, and sends one Gemini request.
8. Report Panel renders `GeminiReport` when available; on failure, show deterministic fallback summary from `SimResult`.

### Data Contracts to Lock Early

- `SimConfig`: capacity, zones, gates, delays, throughput, phase durations, scenario label.
- `SimResult`: per-phase per-zone density/fan count, peak events, critical zones, overall risk seed.
- `GeminiReport`: overall risk narrative, critical alerts, staffing actions, scenario comparison notes.

### Failure Paths

- Simulation error: block downstream AI call and surface validation/runtime error.
- Gemini error/timeout: keep visual simulation results visible; render fallback report and retry option.
- Invalid config: enforce upfront validation before run button enables.

## Runtime View (Cloud Run + No Traditional Backend)

- Cloud Run hosts an Nginx container that serves static frontend assets.
- Browser performs direct HTTPS call to Gemini API after each simulation run.
- No custom API server, no database, no queue, no background workers.

Implication: this is operationally simple and fast to ship, but key exposure and client-side trust boundaries must be explicitly accepted for hackathon scope.

## Production-Grade Guardrails for Hackathon Scope

1. **Deterministic simulation first:** treat AI as augmentation, not source of truth.
2. **Schema validation at boundaries:** validate config input and AI JSON output parsing.
3. **Observability-lite:** client error logging, run counters, latency timings, and API error categorization.
4. **Graceful degradation:** app remains usable without Gemini response.
5. **Repeatable deploys:** pinned runtime versions and scripted Cloud Run deploy command.
6. **Security posture (hackathon-appropriate):** restricted API key, domain restrictions where possible, rotate key after judging.

## Build-Order Implications (13-Day Plan)

Build order should follow dependency gravity: core math first, then rendering, then AI, then deploy hardening.

1. **Days 1-2: Domain model + Simulation Engine**
   - Lock `SimConfig` and `SimResult` schemas.
   - Implement and test `StadiumSim` with fixture scenarios.
   - Exit criterion: deterministic outputs for baseline, sold-out, and gate-delay presets.

2. **Days 3-4: Config Panel + State Wiring**
   - Build controls and validation rules.
   - Wire App Shell to produce stable `SimConfig` snapshots.
   - Exit criterion: config changes serialize correctly and survive rerenders.

3. **Days 5-6: Visualization Layer**
   - Implement `SimChart` and `ZoneGrid` against mocked, then real `SimResult`.
   - Add risk thresholds and color scale consistency.
   - Exit criterion: visual differences are obvious across scenarios.

4. **Days 7-8: Orchestration Integration**
   - Introduce `useSimulation`, loading/error states, and run lifecycle.
   - Ensure single source of truth for current result.
   - Exit criterion: one-click run updates all visual outputs reliably.

5. **Days 9-10: AI Adapter + Report Panel**
   - Add prompt builder, one-call-per-run behavior, strict JSON parsing.
   - Implement fallback report path.
   - Exit criterion: stable report generation and non-blocking failure handling.

6. **Days 11-12: Cloud Run Packaging + Reliability Pass**
   - Finalize Docker + Nginx + SPA routing.
   - Validate build args/env handling and end-to-end in Cloud Run.
   - Exit criterion: public `*.run.app` works on desktop/mobile and recovers from API failure.

7. **Day 13: Demo Hardening + Submission Assets**
   - Freeze scope, smoke-test key scenarios, record demo, finalize docs.
   - Exit criterion: predictable live demo path with backup scenario presets.

## Phase Risks and Mitigations

| Risk | Where It Appears | Mitigation |
|------|------------------|------------|
| Data contract churn between engine/chart/AI | Days 3-10 | Freeze schemas early and version fixture files |
| Over-investing in UI polish before core validity | Days 1-6 | Gate UI work on deterministic simulation tests |
| AI response instability | Days 9-10 | Enforce strict response format and fallback generator |
| Cloud Run surprises late in schedule | Days 11-13 | Deploy a minimal static build early, then iterate |
| Client-exposed key risk | Throughout | Use restricted key, rotate post-event, avoid repo leakage |

## Architecture Decision Summary

- **Primary pattern:** Modular frontend monolith with pure compute core.
- **Integration style:** One-way data flow with explicit contracts.
- **Deployment model:** Static SPA on Cloud Run, no traditional backend.
- **Why this fits 13 days:** minimizes infra surface area while preserving clear engineering boundaries and demo reliability.

## Sources

- Internal project brief: `.planning/PROJECT.md`
- Technical plan: `predictive-fan-flow-plan.md`
- Execution guide: `idea8_predictive_fan_flow_technical_plan.html`

## Confidence

| Area | Confidence | Notes |
|------|------------|-------|
| Component boundaries | HIGH | Directly aligned with project plans and no-backend constraint |
| Data flow direction | HIGH | Derived from existing architecture narrative and run sequence |
| Build-order implications | HIGH | Matches 13-day timeline and dependency order in planning docs |
| Cloud Run/no-backend alignment | HIGH | Consistent with stated deployment and architecture constraints |

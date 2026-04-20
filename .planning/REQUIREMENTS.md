# Requirements: Predictive Fan Flow Simulator

**Defined:** 2026-04-18
**Core Value:** Operations managers can identify and mitigate crowd risk before kickoff by running scenario-based simulations that produce actionable, zone-specific safety recommendations.

## v1 Requirements

### Configuration

- [x] **CFG-01**: User can configure total stadium capacity, gates, delay values, and phase timing from a unified scenario panel.
- [x] **CFG-02**: User can apply preset scenarios (Normal Event, Sold Out Rush, Gate Crisis) in one click.
- [x] **CFG-03**: User can tune advanced calibration controls for venue-specific parameters.

### Simulation

- [x] **SIM-01**: User can run a deterministic multi-phase simulation that yields repeatable outputs for the same input.
- [x] **SIM-02**: User can model gate-delay and throughput constraints that affect zone occupancy by phase.

### Visualization

- [x] **VIZ-01**: User can view a D3 chart of zone density by event phase.
- [x] **VIZ-02**: User can view a zone heatmap with consistent green/amber/red thresholds.
- [x] **VIZ-03**: User can perceive simulation updates through animated transitions without losing state clarity.

### AI Reporting

- [x] **AI-01**: User can generate a structured Gemini risk report from simulation JSON.
- [x] **AI-02**: User can rely on schema-validated report parsing that rejects malformed AI outputs.
- [x] **AI-03**: User can still receive a deterministic fallback report when AI generation fails.

### Scenario Comparison

- [x] **CMP-01**: User can execute a run-adjust-rerun comparison workflow.
- [x] **CMP-02**: User can see intervention sensitivity narratives that quantify risk change from input changes.
- [x] **CMP-03**: User can access persisted run-history analytics for scenario comparison.

### Deployment and Delivery

- [x] **DEP-01**: User can open a public Cloud Run deployment URL for end-to-end demo use.
- [x] **DEP-02**: User can run the app from a containerized Nginx static build artifact.
- [x] **DEP-03**: User can export a report artifact suitable for operations briefing.

### UI Experience Overhaul

- [x] **UI-06-01**: User can access a cinematic hero interface aligned to operations-focused visual direction.
- [x] **UI-06-02**: User can navigate sections with a magnetic dock that preserves workflow continuity.
- [x] **UI-06-03**: User can use motion-enhanced interactions that remain readability-safe and reduced-motion aware.
- [x] **UI-06-04**: User can rely on centralized theme tokens for consistent, maintainable UI styling.

## v2 Requirements

### Enhancements

- **ENH-01**: User can use richer venue calibration tooling and model tuning guidance.
- **ENH-02**: User can use expanded scenario libraries beyond core presets.
- **ENH-03**: User can use advanced report formatting and richer PDF outputs.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time IoT/sensor ingestion dashboards | Contradicts pre-event planning focus and adds major backend/reliability scope. |
| Native iOS/Android apps | Splits delivery effort in a 13-day timeline; web-first is sufficient. |
| Multi-tenant RBAC/admin suite | Enterprise concerns exceed hackathon MVP goals. |
| Freeform chatbot assistant mode | Weakens deterministic, grounded safety-report workflow. |
| 3D digital twin micro-agent simulation | High complexity and timeline risk versus phase-level density model. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CFG-01 | Phase 9 | Completed (09-01) |
| CFG-02 | Phase 9 | Completed (09-01) |
| CFG-03 | Phase 9 | Completed (09-01) |
| SIM-01 | Phase 1 | Completed (01-02) |
| SIM-02 | Phase 1 | Completed (01-02) |
| VIZ-01 | Phase 9 | Completed (09-02) |
| VIZ-02 | Phase 9 | Completed (09-02) |
| VIZ-03 | Phase 9 | Completed (09-02) |
| AI-01 | Phase 9 | Completed (09-02) |
| AI-02 | Phase 9 | Completed (09-02) |
| AI-03 | Phase 9 | Completed (09-02) |
| CMP-01 | Phase 9 | Completed (09-03) |
| CMP-02 | Phase 9 | Completed (09-03) |
| CMP-03 | Phase 9 | Completed (09-03) |
| DEP-01 | Phase 9 | Completed (09-03) |
| DEP-02 | Phase 9 | Completed (09-03) |
| DEP-03 | Phase 9 | Completed (09-03) |
| UI-06-01 | Phase 10 | Completed (10-01) |
| UI-06-02 | Phase 10 | Completed (10-01) |
| UI-06-03 | Phase 10 | Completed (10-01) |
| UI-06-04 | Phase 10 | Completed (10-01) |

**Coverage:**
- v1 requirements: 21 total
- Checked complete: 21
- Pending gap closure: 0
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-04-18*
*Last updated: 2026-04-20 after Phase 10 verification backfill execution*





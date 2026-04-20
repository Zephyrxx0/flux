# Project Roadmap

### Phase 1: Deterministic Simulation Core
**Goal**: Build the core computation engine handling continuous, deterministic state transitions for simulation.
**Plans:** 2 plans

### Phase 2: Scenario Configuration Experience
**Goal**: Establish the structure for configuring comparison scenarios using modular overrides against a baseline.
**Plans:** 3 plans

### Phase 3: Decision-Grade Risk Visualization
**Goal**: Visualize core metric trajectories (Cash, Debt, Valuation) with confidence banding and direct scenario comparison.
**Plans:** 3 plans

### Phase 4: Structured AI Risk Reporting
**Goal**: Integrate AI to generate structured, deterministic narrative reports explaining deviations between scenarios.
**Plans:** 3 plans

### Phase 5: Comparison Workflow and Cloud Run Delivery
**Goal**: Finalize the multi-scenario comparison flow (up to 3 scenarios) and package the application for Cloud Run deployment.
**Plans:** 3 plans

### Phase 6: Website Overhaul with Next.js and Motion-First UI
**Goal**: Replace existing static site with a responsive, motion-enhanced React/Next.js application matching the provided design.
**Plans:** 5 plans

### Phase 7: Planning Traceability Reconciliation
**Goal**: Standardize and complete planning artifacts to establish continuous traceability from ROADMAP to code implementation.
**Plans:** 1 plans

### Phase 8: Milestone Audit Refresh and Roadmap Consistency
**Goal**: Ensure all roadmap statuses, task verifications, and milestone tracking are fully up-to-date and consistent with executed phases.
**Plans:** 1 plans

### Phase 9: Verification Evidence Backfill (Product Phases 02-05)
**Goal**: Retroactively establish explicit test/verification evidence linking plan criteria directly to codebase reality for earlier phases.
**Plans:** 3 plans

### Phase 10: Verification Evidence Backfill (UI and Governance Phases 06-08)
**Goal**: Retroactively verify plan criteria against the codebase for recent UI architecture and planning governance phases.
**Plans:** 2 plans

### Phase 11: Integration Matrix Revalidation and Milestone Readiness
**Goal**: Execute comprehensive cross-phase checks mapping Phase 01-10 artifacts to ensure the system behaves consistently as a unified product.
**Plans:** 1 plans

### Phase 12: Webpage Design Rehaul
**Goal**: Rehaul the webpage design into a polished, modern, multi-page application featuring 3D visuals.
**Depends on**: Phase 11
**Requirements**: 
- Migrate to Next.js + Vite
- Integrate Three.js (https://threejs.org/docs/) for 3D visuals (stadium focus)
- Deploy on Cloud Run
- Add 21st dev MCP (`claude mcp add magic --scope user --env API_KEY="ac7e0868a00de91813bd5ae0f7d31dbd38ae7ceb9f28a5bd4ef5f0de2e003fd1" -- npx -y @21st-dev/magic@latest`)
- Implement Hero card (`@herocard.tsx.example`)
- Test with Chrome DevTools MCP
- Use shadcn components and shadcnthemer.com theme.css format
- Implement multi-page architecture instead of single page
- Create new branch for phase discussion
**Success Criteria** (what must be TRUE):
  1. The app runs on Next.js + Vite and is deployed to Cloud Run.
  2. A 3D visual (like a stadium) is implemented using Three.js and forms the main focus of the UI.
  3. The app is multi-page and uses shadcn components with clean CSS (shadcnthemer format).
**Plans**: 3 plans
- [ ] 12-01-PLAN.md — Migrate configuration to Next.js and Tailwind baseline
- [ ] 12-02-PLAN.md — Implement the CTA Hero Card and 21st-dev Magic MCP integration
- [ ] 12-03-PLAN.md — Implement the core 3D visual using Three.js / React Three Fiber

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 1.1 -> 2 -> 2.1 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11 -> 12

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Deterministic Simulation Core | 2/2 | Complete | 2026-04-18 |
| 2. Scenario Configuration Experience | 3/3 | Complete | 2026-04-19 |
| 3. Decision-Grade Risk Visualization | 3/3 | Complete | 2026-04-19 |
| 4. Structured AI Risk Reporting | 3/3 | Complete | 2026-04-20 |
| 5. Comparison Workflow and Cloud Run Delivery | 3/3 | Complete | 2026-04-20 |
| 6. Website Overhaul with Next.js and Motion-First UI | 5/5 | Complete | 2026-04-19 |
| 7. Planning Traceability Reconciliation | 1/1 | Complete | 2026-04-20 |
| 8. Milestone Audit Refresh and Roadmap Consistency | 1/1 | Complete | 2026-04-20 |
| 9. Verification Evidence Backfill (Product Phases 02-05) | 3/3 | Complete | 2026-04-20 |
| 10. Verification Evidence Backfill (UI and Governance Phases 06-08) | 2/2 | Complete | 2026-04-20 |
| 11. Integration Matrix Revalidation and Milestone Readiness | 1/1 | Complete | 2026-04-20 |
| 12. Webpage Design Rehaul | 0/3 | Planned | - |

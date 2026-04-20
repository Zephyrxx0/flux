---
phase: 02
slug: scenario-configuration-experience
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-19
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + React Testing Library |
| **Config file** | `vitest.config.ts` (Updated in 02-01) |
| **Smoke run command** | `npx vitest run tests/ui/form.test.ts tests/simulation/presets.test.ts --bail 1` |
| **Quick run command** | `npx vitest run tests/ui/` |
| **Full suite command** | `npx vitest run` |
| **Estimated smoke runtime** | ~10-20 seconds |
| **Estimated full runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run smoke command or specific task test.
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency target:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | CFG-01 | T-02-01 | React/Tailwind/shadcn setup boots correctly | smoke | `npm run test:smoke` | ⬜ | ⬜ pending |
| 02-01-02 | 01 | 1 | CFG-01 | — | AppLayout renders Sidebar component | ui | `npx vitest run tests/ui/layout.test.ts` | ⬜ | ⬜ pending |
| 02-02-01 | 02 | 2 | CFG-02 | — | Presets are valid against SimulationInputSchema | unit | `npx vitest run tests/simulation/presets.test.ts` | ⬜ | ⬜ pending |
| 02-02-02 | 02 | 2 | CFG-02 | T-02-02 | Zustand store persists and validates LocalStorage | unit | `npx vitest run tests/ui/store.test.ts` | ⬜ | ⬜ pending |
| 02-02-03 | 02 | 2 | CFG-02 | — | PresetsToolbar triggers store actions | ui | `npx vitest run tests/ui/presets.test.ts` | ⬜ | ⬜ pending |
| 02-03-01 | 03 | 3 | CFG-01 | — | ScenarioForm handles nested arrays and wires to store | ui | `npx vitest run tests/ui/form.test.ts` | ⬜ | ⬜ pending |
| 02-03-02 | 03 | 3 | CFG-03 | — | Advanced calibration sections are collapsible | ui | `npx vitest run tests/ui/calibration.test.ts` | ⬜ | ⬜ pending |
| 02-03-03 | 03 | 3 | CFG-01 | T-02-04 | Run button validates and triggers engine | integration | `npx vitest run tests/ui/run.test.ts` | ⬜ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/ui/layout.test.ts` — Layout smoke test
- [ ] `tests/ui/store.test.ts` — Store persistence/validation
- [ ] `tests/ui/presets.test.ts` — Toolbar interaction
- [ ] `tests/ui/form.test.ts` — ScenarioForm functionality
- [ ] `tests/ui/calibration.test.ts` — Accordion behavior
- [ ] `tests/ui/run.test.ts` — Run trigger integration

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual polish and Sidebar responsiveness | CFG-01 | Subjective UX | Resize browser, check Sidebar collapse/expand animation and layout shift. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency <= 30s for task-level smoke commands
- [x] `nyquist_compliant: true` set in frontmatter

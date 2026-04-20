# Phase 2: Scenario Configuration Experience - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 02-scenario-configuration-experience
**Areas discussed:** Scenario Panel Layout, Preset Integration, Advanced Calibration UI, Simulation Trigger Mode, Persistence, Validation, UI Library

---

## Scenario Panel Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Persistent Sidebar | Configuration on the left/right, visualization in the center. Best for feedback loop. | ✓ |
| Full-screen Setup | Dedicated view for setup. Maximum space for complex lists. | |
| Split-pane Workspace| User can resize the boundary. Most flexible. | |

**User's choice:** Persistent Sidebar
**Notes:** Preferred for tight feedback loop during "Run-Adjust-Rerun" cycles.

---

## Preset Integration

| Option | Description | Selected |
|--------|-------------|----------|
| Toolbar Buttons | Prominent buttons at top for Normal/Sold Out/Crisis. Fastest. | ✓ |
| Dropdown Menu | Select from a list. Saves space. | |
| Preset Cards | Card-based view with descriptions. Most informative. | |

**User's choice:** Toolbar Buttons
**Notes:** Satisfies the "one click" requirement (CFG-02).

---

## Advanced Calibration UI

| Option | Description | Selected |
|--------|-------------|----------|
| Collapsible Inline | "Advanced" headers under categories that expand to reveal calibration values. | ✓ |
| Global Toggle | A master toggle at the top that reveals advanced inputs globally. | |
| Advanced Tab | Dedicated tab for Detailed Mode and fine-tuning constants. | |

**User's choice:** Collapsible Inline
**Notes:** Keeps calibration context close to the basic inputs.

---

## Simulation Trigger Mode

| Option | Description | Selected |
|--------|-------------|----------|
| Live (Reactive) | Simulation runs automatically as you adjust sliders or types. | |
| Explicit Run | User clicks a "Run Simulation" button. Clearer boundary. | ✓ |
| Hybrid Flow | Live for small values, click for structural changes. | |

**User's choice:** Explicit Run
**Notes:** Provides a clear boundary and works well with an "On-Run Error List".

---

## Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Saved Scenarios | Save/Load specific named configuration templates (e.g. "2026 Finals"). | ✓ |
| Run-based Only | Only persist the results of a "Run". | |

**User's choice:** Saved Scenarios
**Notes:** Allows reuse of complex stadium setups across different planning sessions.

---

## Validation

| Option | Description | Selected |
|--------|-------------|----------|
| Immediate Inline | Validation errors appear inline as you type. | |
| On-Run Error List | Only show errors when "Run" is clicked. | ✓ |

**User's choice:** On-Run Error List
**Notes:** Keeps the drafting experience quiet/clean, but ensures validity before simulation.

---

## UI Library

| Option | Description | Selected |
|--------|-------------|----------|
| shadcn/ui | Radix + Tailwind. Professional look, fast implementation. | ✓ |
| Vanilla Tailwind | Custom components. Maximum control. | |

**User's choice:** shadcn/ui (Recommended)
**Notes:** Aligns with the project's React/Vite/Tailwind stack and ensures high design quality.

---

## Claude's Discretion
- Choice of specific icons for the toolbar buttons.
- Precise ordering of categories within the sidebar (as long as it's logical).
- Internal state management patterns (e.g., useReducer vs Zustand).

## Deferred Ideas
- Interactive visual timeline for phase/arrival adjustment.
- Side-by-side comparison UI (deferred to Phase 5).

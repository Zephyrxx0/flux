# Phase 02: Scenario Configuration Experience - Research

**Researched:** 2026-04-19
**Domain:** React Frontend, Form Management, Persistence
**Confidence:** HIGH

## Summary

This phase transitions the project from a CLI/Engine focus to a web-based interactive experience. The primary challenge is managing the complex, nested state defined by the `SimulationInputSchema` while maintaining high performance and a clean "Run-Adjust-Rerun" feedback loop.

**Primary recommendation:** Use **React 19** with **React Hook Form** and **Zod** for strict type safety, leveraging **shadcn/ui**'s new Sidebar system for the layout and **Zustand** for local scenario persistence.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01 (Scenario Panel Layout):** Use a **Persistent Sidebar** (likely on the left) for all configuration controls.
- **D-02 (Preset Integration):** Use **Toolbar Buttons** at the top of the configuration panel for one-click application of "Normal Event", "Sold Out Rush", and "Gate Crisis" presets.
- **D-03 (Simulation Trigger Mode):** Use an **Explicit Run** button to provide a clear boundary between drafting and execution.
- **D-04 (Validation Strategy):** Communicate validation errors (duplicate IDs, unknown refs) as an **On-Run Error List**.
- **D-05 (Advanced Calibration UI):** Surface advanced calibration controls via **Collapsible Inline Sections** (Accordions).
- **D-06 (Persistence Model):** Support **Saved Scenarios** (named templates) in LocalStorage.
- **D-07 (Frontend Stack):** Initialize the project with **React + Vite + Tailwind CSS**.
- **D-08 (Component Library):** Use **shadcn/ui** (Radix UI + Tailwind).

### the agent's Discretion
- Implementation of "Presets as Functional Modifiers" — recommended to use `useForm.reset()` for full presets and `useForm.setValue()` for partial modifiers.
- Sidebar structure — recommended to categorize by Venue (Zones/Gates), Event (Phases), and Demand (Arrivals).

### Deferred Ideas (OUT OF SCOPE)
- Interactive Visual Timeline (drag-and-drop charts).
- Multi-scenario Comparison View (Phase 5).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CFG-01 | Configure capacity, gates, delays, and phase timing. | `useFieldArray` for nested arrays in `SimulationInput`. |
| CFG-02 | Apply presets in one action. | `zustand` for preset storage and `form.reset()` for application. |
| CFG-03 | Tune advanced calibration controls. | shadcn `Accordion` for collapsible advanced sections. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Configuration Form | Browser | — | React Hook Form manages `SimulationInput` state. |
| Simulation Execution | Browser | — | `simulateDeterministic` runs as a pure function on the main thread. |
| Persistence | Browser | — | `LocalStorage` (via Zustand) stores saved scenario templates. |
| Validation | Browser | — | Zod schema validation runs on "Run" click to produce the Error List. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.5 | UI Library | [VERIFIED: npm registry] First-class support for new hooks, better ref handling. |
| Vite | 8.0.8 | Build Tool | [VERIFIED: npm registry] Fast HMR and simple configuration for React. |
| Tailwind CSS | 4.2.2 | CSS Framework | [VERIFIED: npm registry] CSS-first config, OKLCH support, high performance. |
| shadcn/ui | 4.3.0 | UI Components | [VERIFIED: npm registry] Accessible, customizable Radix primitives. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Hook Form | 7.72.1 | Form Management | [VERIFIED: npm registry] Performance with nested arrays (useFieldArray). |
| Zod | 4.3.6 | Validation | [VERIFIED: npm registry] Schema-driven validation matching the simulation engine. |
| Zustand | 5.0.12 | State Management | [VERIFIED: npm registry] Lightweight persistence for "Saved Scenarios". |
| Lucide React | 1.8.0 | Icons | [VERIFIED: npm registry] Standard icon set for shadcn/ui. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | Simple LocalStorage | Manual serialization/deserialization and sync logic required. |
| Tailwind v4 | Tailwind v3 | v4 has better performance and a simpler CSS-only configuration model. |

**Installation:**
```bash
# Core
npm install react@latest react-dom@latest
npm install -D vite @vitejs/plugin-react

# Styling & UI
npm install -D tailwindcss @tailwindcss/vite
npx shadcn@latest init

# Form & State
npm install react-hook-form zod @hookform/resolvers zustand lucide-react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/             # shadcn primitives
│   ├── config/         # Phase 02 specific components
│   │   ├── ScenarioSidebar.tsx
│   │   ├── ValidationList.tsx
│   │   └── PresetsToolbar.tsx
│   └── layout/
│       └── AppLayout.tsx
├── hooks/
│   └── useScenarioStore.ts
├── simulation/         # From Phase 01
│   ├── contracts/      # Zod schemas
│   └── core/           # Deterministic engine
└── lib/
    └── utils.ts
```

### Pattern 1: Nested Field Arrays
For `phases`, `zones`, `gates`, and `arrivals`, use `useFieldArray`.
**Optimization:** Wrap each array item in a `React.memo` component to prevent the entire list from re-rendering on a single input change [CITED: React Hook Form docs].

### Pattern 2: On-Run Error List
1. Form uses `mode: "onSubmit"` to avoid distracting validation errors during typing.
2. The "Run" button triggers `handleSubmit`.
3. In the `onError` callback, flatten the nested `FieldErrors` object into a list of strings.
4. Display this list in a `ValidationList` component (using shadcn `Alert`).

### Pattern 3: Functional Presets
Implement presets as pure data objects in `src/simulation/presets.ts`. Use a "modifier" pattern where applying a preset can either:
- **Full Reset:** `form.reset(presetData)`
- **Partial Patch:** `form.reset({ ...form.getValues(), ...presetPatch })`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| LocalStorage Sync | Custom `useEffect` | `zustand/persist` | Handles JSON serialization and hydration edge cases. |
| Sidebar Layout | Flexbox + CSS transitions | shadcn `Sidebar` | Built-in accessible collapsible behavior and mobile support. |
| Form Validation | Custom Regex/Checks | `zodResolver` | Ensures UI validation exactly matches Engine validation. |

## Common Pitfalls

### Pitfall 1: Index Shifting in Field Arrays
**What goes wrong:** Removing an item from the middle of a list of 100 causes all subsequent inputs to lose focus or re-render.
**How to avoid:** Use the `field.id` (provided by `useFieldArray`) as the React `key`, NOT the array index.

### Pitfall 2: Hydration Mismatch with LocalStorage
**What goes wrong:** Server (or initial client render) has empty state, but LocalStorage has data, causing a flash or error.
**How to avoid:** Use Zustand's `onRehydrateStorage` or a `useHasMounted` hook to ensure the UI only renders persistence-dependent parts after hydration.

### Pitfall 3: Large Array Performance
**What goes wrong:** Hundreds of `ArrivalSchema` records slow down the UI.
**How to avoid:** Use `React.memo` for rows and avoid watching the entire array at the top level.

## Code Examples

### flattening Zod/RHF Errors for the Error List
```typescript
// Flatten nested errors for the "On-Run Error List"
const getFlatErrors = (errors: any, path: string = ""): string[] => {
  return Object.keys(errors).reduce((acc: string[], key) => {
    const currentPath = path ? `${path}.${key}` : key;
    if (errors[key].message) {
      acc.push(`${currentPath}: ${errors[key].message}`);
    } else {
      acc.push(...getFlatErrors(errors[key], currentPath));
    }
    return acc;
  }, []);
};
```

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Development | ✓ | 20.x | — |
| npm | Package management | ✓ | 10.x | — |
| Browser | Runtime | ✓ | Modern | — |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Environment | jsdom |
| Quick run command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CFG-01 | Inputs update form state correctly | unit/rtl | `vitest tests/ui/form.test.ts` | ❌ Wave 0 |
| CFG-02 | Presets apply expected values | unit | `vitest tests/simulation/presets.test.ts` | ❌ Wave 0 |
| CFG-03 | Advanced toggles show/hide sections | e2e/rtl | `vitest tests/ui/calibration.test.ts` | ❌ Wave 0 |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Zod schema validation on every "Run" trigger. |
| V12 File and Resources | yes | Sanitize LocalStorage key usage to prevent cross-tab interference. |

### Known Threat Patterns for React/Vite

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Client-side DoS | Availability | Simulation engine runs in milliseconds; no blocking loops. |
| State Injection | Tampering | Validating LocalStorage data with Zod before hydration into state. |

## Sources

### Primary (HIGH confidence)
- [npm view] - Package versions.
- [shadcn/ui docs] - Sidebar component and Tailwind v4 compatibility.
- [React Hook Form docs] - `useFieldArray` and `zodResolver` usage.
- [Zustand docs] - Persistence middleware.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Latest versions verified via npm.
- Architecture: HIGH - Standard patterns for React Hook Form + Zod.
- Pitfalls: MEDIUM - Based on common community experience with large forms.

**Research date:** 2026-04-19
**Valid until:** 2026-05-19

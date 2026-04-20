---
phase: 12-webpage-design-rehaul
plan: 01
subsystem: ui
tags: [nextjs, tailwind, shadcn, theme]
requires: []
provides:
  - Next.js app-router baseline configuration and scripts
  - Tailwind config aligned with shadcn CSS variable tokens
  - Root layout and theme provider wiring for app-level theming
affects: [homepage, styling, phase-12-wave-2]
tech-stack:
  added: [next, next-themes, @react-three/fiber, @react-three/drei, three]
  patterns: [app-router layout shell, css-variable color tokens]
key-files:
  created: [next.config.mjs, tailwind.config.ts, src/app/layout.tsx, src/app/globals.css, src/components/theme-provider.tsx]
  modified: [package.json, package-lock.json]
key-decisions:
  - "Use app-router structure under src/app while keeping existing Vite scripts for backward compatibility."
  - "Adopt shadcn-style CSS variables in globals.css for light/dark theme parity."
patterns-established:
  - "Root layout wraps all pages in ThemeProvider."
  - "Tailwind semantic colors resolve from CSS custom properties."
requirements-completed: []
duration: 16min
completed: 2026-04-20
---

# Phase 12 Plan 01: Foundation Styling and Runtime Summary

**Established a Next.js app-router baseline with shadcn-compatible theme tokens and global theme-provider wiring.**

## Performance

- **Duration:** 16 min
- **Tasks:** 2/2 complete
- **Files modified:** 7

## Accomplishments

- Added Next.js runtime scripts/config plus core dependencies needed for the Phase 12 rehaul.
- Introduced Tailwind config extending semantic color tokens from CSS variables.
- Added `src/app/layout.tsx`, `src/app/globals.css`, and `src/components/theme-provider.tsx` to provide app-wide theming.

## Task Commits

1. **Task 1: Migrate configuration to Next.js and Tailwind baseline** - `4bb29a1` (feat)
2. **Task 2: Implement Shadcn modular theme.css** - `419f83e` (feat)

## Files Created/Modified

- `package.json` / `package-lock.json` - Added Next.js runtime + related dependencies and resolved lockfile.
- `next.config.mjs` - Added Next config with strict mode.
- `tailwind.config.ts` - Added shadcn-style color mappings and content globs.
- `src/app/layout.tsx` - Added Next root layout with ThemeProvider.
- `src/app/globals.css` - Added modular `:root` + `.dark` CSS token sets.
- `src/components/theme-provider.tsx` - Added wrapper around `next-themes` provider.

## Decisions Made

- Kept existing Vite path intact while introducing Next app-router baseline to satisfy migration without breaking existing scripts.

## Deviations from Plan

- **[Rule 3 - Blocking]** Fixed malformed `package.json` after dependency insertion to restore valid JSON before install.

## Verification

- `npm ls next three tailwindcss` ✅
- `grep --background src/app/globals.css` equivalent check ✅ (contains `--background`)
- `src/app/layout.tsx` imports `ThemeProvider` ✅

## Self-Check: PASSED

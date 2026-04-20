# Phase 6 Implementation Notes

## Locked UI Direction

- Hero follows wrap-shader-inspired cinematic visual composition.
- Navigation follows magnetic dock interaction model.
- Additional required primitives are sourced via shadcn tooling/MCP.
- Theme tokens are centralized in `src/theme.css` (shadcn variable style).
- Motion libraries used: `react-kino`, `animejs`.

## Current Implementation Delta

### Added

- `src/components/layout/CinematicHero.tsx`
  - Cinematic hero with motion reveal and briefing-focused value props.
  - Uses shadcn `Badge`, `Button`, `Card` composition.
- `src/components/layout/MagneticDock.tsx`
  - Bottom dock navigation with animejs magnetic pull interactions.
  - Anchors to key workflow sections.
- `src/theme.css`
  - Theme token authority for colors, radii, sidebar palette, and hero/dock accents.
- shadcn component additions via registry workflow:
  - `src/components/ui/card.tsx`
  - `src/components/ui/badge.tsx`

### Updated

- `src/components/layout/AppLayout.tsx`
  - Injects hero and dock while preserving core simulation workspace/test IDs.
  - Adds explicit route-surface parity markers used for App Router extraction.
- `src/visualization/components/VisualizationWorkspace.tsx`
  - Adds section anchors (`compare`, `report`, `deploy`) for dock navigation.
  - Adds route-surface markers for compare/report/deploy handoff boundaries.
- `src/components/layout/MagneticDock.tsx`
  - Adds `prefers-reduced-motion` detection and disables magnetic pull effects when reduced motion is requested.
  - Keeps click and keyboard navigation behavior while using non-animated section jumps in reduced-motion mode.
- `src/index.css`
  - Imports `src/theme.css` and keeps global base/atmosphere styles.
  - Adds touch-action and reduced-motion guardrails for dock interactions.
- `tests/ui/layout.test.ts`
  - Adds reduced-motion coverage for dock behavior parity.
- `package.json`
  - Adds explicit Next.js scaffold scripts (`dev:next`, `build:next`, `start:next`) using `npx` for migration-track execution.

## Behavioral Guardrails

1. Simulation numeric behavior remains unchanged.
2. Risk report schema/fallback behavior remains unchanged.
3. Comparison/export semantics remain unchanged.
4. Changes are presentation and navigation layer only.

## Next.js Scaffold (Gap Closure)

### Route Surface Mapping

- `/` -> `overview` shell with hero and dock
- `/simulate` -> scenario sidebar + visualization workspace mount
- `/compare` -> comparison panel surface
- `/report` -> risk reporting surface
- `/deploy` -> deployment readiness surface

### App Router Migration Strategy

1. Keep feature components in current paths and migrate shell composition first.
2. Introduce App Router route groups with clear client boundaries around motion-heavy components.
3. Preserve store hooks/contracts and avoid reinterpreting simulation semantics during route extraction.
4. Keep dock anchors and route-surface IDs aligned to future segment paths for parity verification.

### Script Strategy

- `npm run dev:next` for migration-track local App Router development.
- `npm run build:next` for migration-track production compile checks.
- `npm run start:next` for migration-track runtime parity checks.

## Quality Gates Executed

- `npm run test -- tests/ui/layout.test.ts` (pass)
- `npm run build` (pass)
- UI guideline audit artifact: `.planning/phases/06-website-overhaul-nextjs-motion-first-ui/06-UI-AUDIT.md`
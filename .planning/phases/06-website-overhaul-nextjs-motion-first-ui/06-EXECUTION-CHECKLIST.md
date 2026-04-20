# Phase 6 Skill-Aligned Execution Checklist

## Scope Lock

- [ ] Keep simulation behavior, report schema behavior, and comparison/export semantics unchanged.
- [ ] Keep hero and dock reference direction aligned to agreed visual patterns.

## Plan 06-01 Checklist (Hero + Theme)

### frontend-design
- [ ] Hero has clear visual hierarchy and a distinct cinematic identity.
- [ ] Typography and color choices are intentional and token-driven.
- [ ] Motion is meaningful (entry sequencing and attention guidance), not decorative noise.

### shadcn
- [ ] Reuse shadcn primitives before introducing custom wrappers.
- [ ] Use semantic tokens (`bg-card`, `text-foreground`, etc.) instead of raw color classes.
- [ ] Follow component composition rules (CardHeader/CardContent, Badge variants, icon conventions).

### ui-ux-pro-max
- [ ] Hero CTA buttons meet touch target expectations and are keyboard accessible.
- [ ] Contrast and focus states are verified in both light and dark modes.

## Plan 06-02 Checklist (Dock + Navigation)

### frontend-design
- [ ] Dock motion reinforces navigation intent and preserves readability.

### ui-ux-pro-max
- [ ] Dock targets are large enough and spaced for reliable interaction.
- [ ] Section navigation works on desktop and mobile.
- [ ] Reduced-motion fallback is defined for magnetic effects.

### vercel-react-best-practices
- [ ] Dock event handlers avoid unnecessary rerenders.
- [ ] Animation code does not introduce avoidable layout thrashing.

## Plan 06-03 Checklist (Docs + Migration Guardrails)

### next-best-practices
- [ ] Next.js migration notes include App Router structure and RSC/client boundaries.
- [ ] Async API and route/file conventions are explicitly documented for migration.

### shadcn
- [ ] Documentation retains shadcn MCP/registry-first sourcing policy.
- [ ] Theme ownership remains centralized in `src/theme.css`.

### web-design-guidelines
- [ ] Add a UI review checkpoint against accessibility and usability guidelines before final cutover.

## Verification Commands

- [ ] `npm run build`
- [ ] `npm run test -- tests/ui/layout.test.ts`
- [ ] Manual check: dock anchors scroll to `overview`, `simulate`, `compare`, `report`, `deploy`.

## Completion Gate

- [ ] All three Phase 6 plan files still include `<skills_to_apply>` sections.
- [ ] Any newly added implementation tasks reference at least one relevant skill constraint.

# Phase 12: Webpage Design Rehaul - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning
**Source:** User Direct Input

<domain>
## Phase Boundary

Rehaul the current webpage design which is currently inconsistent. Migrate to Next.js + Vite (if not done). Integrate Shadcn UI components, Three.js 3D visuals as the main focus (e.g., stadium), a CTA Hero Card section, and modular CSS (`theme.css` format per `shadcnthemer.com`). Multi-page structure is permitted. Deploy on Cloud Run.

</domain>

<decisions>
## Implementation Decisions

### Framework & Stack
- **D-01: Framework:** Next.js + Vite migration (if not already migrated).
- **D-02: Deployment:** Cloud Run.
- **D-03: Styling:** Modular `theme.css` format compatible with `shadcnthemer.com` for easy theme swapping. Recreate CSS from scratch.
- **D-04: UI Components:** Use Shadcn UI.
- **D-05: 3D Visuals:** Use Three.js for a central 3D visual experience (e.g., stadium).

### Structure & Content
- **D-06: Page Architecture:** Multi-page structure is acceptable (do not cram everything onto a single page).
- **D-07: Hero Section:** Use the provided CTA Hero Card code (`herocard.tsx.example`) including 21st-dev Magic MCP integration (`@21st-dev/magic@latest`).
- **D-08: MCP/Tools:** Use Chrome DevTools MCP for testing. Use 21st Dev Magic MCP (`ac7e0868a00de91813bd5ae0f7d31dbd38ae7ceb9f28a5bd4ef5f0de2e003fd1`) for open code UI integration.

### the agent's Discretion
- Specific multi-page routing and taxonomy (e.g., `/about`, `/features`).
- Exact Three.js scene details (lighting, camera, specific models) beyond the "stadium" or central focus concept.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Source Examples
- `herocard.tsx.example` — Reference code for the Hero CTA section.
- `https://threejs.org/docs/` — Core documentation for 3D visuals.
- `https://shadcnthemer.com/` — Reference for `theme.css` variables structure.

</canonical_refs>

<specifics>
## Specific Ideas

- The Hero CTA component must implement the dithering shader effect from `@paper-design/shaders-react` and follow the exact structure in `herocard.tsx.example`.
- Clear out inconsistent CSS before applying Shadcn theming.

</specifics>

<deferred>
## Deferred Ideas

None — user scope applies immediately to this rehaul.

</deferred>

---

*Phase: 12-webpage-design-rehaul*
*Context gathered: 2026-04-20 via direct prompt*

# Phase 6: Website Overhaul with Next.js and Motion-First UI - Context

**Gathered:** 2026-04-19
**Status:** Discussion started

<domain>
## Phase Boundary

Rebuild the frontend delivery surface from static Vite UI to Next.js while preserving the existing simulation engine behavior, reporting semantics, and project objective.

This phase focuses on product presentation quality, interaction design, and motion systems. It must not change the simulation's working principles or intended decision-support outcome.

</domain>

<initial_scope>
## Initial Scope (from request)

- Overhaul visual quality of the current website to feel intentional and polished.
- Migrate frontend app shell and pages from current static setup to Next.js.
- Integrate animation libraries where useful (animejs, react-kino) with performance and accessibility guardrails.
- Build custom UI components and patterns (to be defined in discussion).
- Preserve implementation behavior and project aim for simulation outcomes.

</initial_scope>

<decisions>
## Implementation Decisions (Kickoff)

- **D-01:** Use a parallel Next.js rebuild, then cut over after parity and validation.
- **D-02:** Aim for a high-motion brand experience, with motion integrated broadly across the UI.
- **D-03:** Prioritize custom components across all major families in first wave: layout/navigation, simulation controls, visualization surfaces, and reporting/export surfaces.
- **D-04:** Treat simulation outputs, risk-report schema behavior, and comparison/export outputs as strict non-regression baseline.
- **D-05:** Use a multi-route Next.js product flow (separate routes for simulate, compare, report, export).
- **D-06:** Prioritize visual impact first for motion policy, with explicit accessibility/performance guardrails to be defined during planning.
- **D-07:** Anchor the design language in a cinematic operations dashboard aesthetic.
- **D-08:** Hero direction should align with wrap-shader-style visual composition reference from 21st.dev.
- **D-09:** Primary navigation should align with magnetic dock interaction reference from 21st.dev.
- **D-10:** Additional UI primitives should be pulled through shadcn MCP/registry workflow instead of ad hoc custom primitives.
- **D-11:** Theme tokens must live in `src/theme.css` using shadcn-compatible variable format for easy future re-skinning.
- **D-12:** Motion stack baseline is `react-kino` + `animejs`, used where interaction value is clear.

</decisions>

<discussion_targets>
## Topics to Resolve in Discussion

1. Route information architecture and URL strategy within the multi-route model.
2. Motion system details: cadence, easing curves, sequencing rules, and animation ownership boundaries.
3. Accessibility/performance policy (reduced motion fallback and runtime budgets).
4. First-wave component specs by surface area.
5. Verification strategy proving no behavioral regression in simulation/reporting outputs.
6. Finalize migration checkpoint from current Vite baseline to Next.js implementation track.

</discussion_targets>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/PROJECT.md`
- `src/`

</canonical_refs>

---

*Phase: 06-website-overhaul-nextjs-motion-first-ui*
*Context gathered: 2026-04-19*

# Phase 6: Website Overhaul with Next.js and Motion-First UI - Discussion Log

> Audit trail only. Decisions are promoted into CONTEXT.md.

**Date:** 2026-04-19
**Phase:** 06-website-overhaul-nextjs-motion-first-ui
**Status:** Open

---

## Kickoff Notes

- User requested a major UI overhaul because current experience feels bland.
- User explicitly asked to keep simulation behavior and project objective unchanged.
- User requested migration from static frontend to Next.js.
- User requested use of animation libraries (animejs/react-kino where appropriate).
- User requested custom components, with detailed choices to be discussed next.

---

## Kickoff Decision Capture

| Topic | Selected Option |
|-------|-----------------|
| Migration strategy | Parallel rebuild then cutover |
| Animation policy | High-motion brand experience |
| Custom components priority | Layout/navigation, simulation controls, visualization surfaces, reporting/export surfaces |
| Non-regression baseline | All core behaviors (simulation outputs, risk-report schema behavior, comparison/export outputs) |

### Notes

- This phase explicitly preserves implementation behavior and project aim while modernizing UX and frontend architecture.

---

## Discussion Round 2

| Topic | Selected Option |
|-------|-----------------|
| App Router mapping | Multi-route product flow |
| Motion constraints | Prioritize visual impact first |
| Design language | Cinematic operations dashboard |

---

## Discussion Round 3 (Reference Lock-In)

| Topic | Selected Option |
|-------|-----------------|
| Hero reference direction | 21st.dev `wrap-shader` style |
| Navigation reference direction | 21st.dev `magnetic-dock` style |
| Additional component sourcing | Use shadcn MCP/registry flow |
| Theme strategy | Centralize shadcn-style tokens in `src/theme.css` |
| Motion stack | Use `react-kino` and `animejs` where required |

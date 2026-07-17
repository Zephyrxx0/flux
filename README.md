# Crowd Dynamics Engine

A web-based crowd flow simulation sandbox — run scenarios, compare outcomes, and export results. Built with **Next.js** (React + TypeScript).

## Quickstart

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Start dev server             |
| `pnpm build`     | Production build             |
| `pnpm start`     | Start production server      |
| `pnpm lint`      | Run linter                   |
| `pnpm typecheck` | Run TypeScript checks        |

## Stack

- **Framework**: Next.js (React + TypeScript)
- **Styling**: Tailwind CSS v4
- **Animation**: GSAP, Anime.js v4
- **3D Visualization**: Three.js / @react-three/fiber, d3
- **Deployment**: Vercel

## Project Structure

- `src/app/` — Next.js App Router pages and layouts
- `src/components/` — Shared UI components
- `src/simulation/` — Simulation domain logic
- `src/comparison/` — Baseline vs candidate comparison
- `src/export/` — Result export/serialization
- `src/reporting/` — Summary and reporting output
- `src/visualization/` — 3D visuals, plots, charts
- `src/hooks/` — Custom React hooks
- `src/lib/` — Shared utilities

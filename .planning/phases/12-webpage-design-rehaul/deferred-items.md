# Deferred Items (Phase 12 Execution)

These items were discovered while running `npm run build:next` and are outside the files/scope of Phase 12 plan tasks.

1. `src/reporting/gemini/generateRiskReport.ts` uses `import.meta.env.VITE_GEMINI_API_KEY`, which fails under Next.js type checking without a migration strategy for runtime env access.
2. `src/visualization/components/RiskLineChart.tsx` imports `d3` without `@types/d3`, causing Next.js type-check failures.

Status: Deferred (out-of-scope for this phase's targeted files and acceptance checks).

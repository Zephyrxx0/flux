# Technology Stack (2025-2026) - Predictive Fan Flow Simulator

Researched: 2026-04-18
Scope: browser-based stadium simulation + Gemini report generation + Cloud Run deployment

## Recommended Stack (Implementation Baseline)

| Layer | Technology | Version | Why this is the default now | Confidence |
|---|---|---:|---|---|
| UI framework | React | 19.2.5 | Current mainstream React baseline for interactive dashboards; strong ecosystem and tooling compatibility. | HIGH |
| Build tool | Vite | 8.0.8 | Fast local iteration and production bundling for SPA workloads; ideal for hackathon-speed delivery. | HIGH |
| Styling | Tailwind CSS | 4.2.2 | Current Tailwind generation with simplified setup; fast to implement dense control panels and data UIs. | HIGH |
| Tailwind integration | @tailwindcss/vite | 4.2.2 | Preferred Tailwind 4 integration path in Vite projects. | HIGH |
| Visualization | D3 | 7.9.0 | Best fit for custom, phase/time-based crowd-density visuals and fine-grained animation control. | HIGH |
| Simulation runtime | Browser JS + Web Workers + Comlink (optional) | comlink 4.4.2 | Keep simulation client-side; move to worker when frame drops appear during run/animation overlap. | MEDIUM |
| App language | TypeScript | 6.0.3 | Safer modeling of simulation schemas and AI response contracts; reduces silent data-shape bugs. | HIGH |
| AI SDK | @google/genai | 1.50.1 | Current official JS SDK path for Gemini API integration. | HIGH |
| AI model (reporting) | Gemini 2.5 Flash (stable model ID) | API model family | Google docs position this as strong price/performance for low-latency reasoning tasks. | HIGH |
| AI output guardrail | Zod | 4.3.6 | Parse/validate model JSON report output before rendering recommendations. | HIGH |
| Deployment platform | Cloud Run (fully managed) | Managed service | Standard container deployment target for this scope; revision-based rollouts and easy public URL. | HIGH |
| Image registry | Artifact Registry | Managed service | Current standard; Container Registry is deprecated/shut down for writes. | HIGH |

## What Not To Use (for this MVP)

| Do not use | Why not for this project |
|---|---|
| Next.js SSR/RSC stack | Adds server complexity without meaningful value for a simulation-first SPA.
| Dedicated Node/Express backend for simulation | Browser-side simulation is a core requirement; backend adds latency and ops overhead.
| Redux Toolkit by default | State graph is small/medium; local React state (or light store) is sufficient initially.
| Chart.js/Recharts as primary charting | Faster to start, but weaker than D3 for custom zone/phase animation and control.
| Gemini preview/latest aliases in production | Higher churn/deprecation risk; use stable model IDs for predictable behavior.
| Google Container Registry (gcr.io) as primary registry | Deprecated for writes; use Artifact Registry.

## Implementation Defaults

1. Build as an SPA with React + Vite + Tailwind 4, render D3 in isolated chart components.
2. Keep `StadiumSim` pure and deterministic (input config -> output JSON), no side effects.
3. Validate Gemini JSON with Zod before UI render; fall back to deterministic local summary on parse failure.
4. Start simulation on main thread; switch to Worker+Comlink only when profiling shows UI jank.
5. Containerize static assets and deploy to Cloud Run; app must listen on `PORT` provided by Cloud Run.
6. Store runtime config (including API key strategy) in Cloud Run env vars and CI secrets; never commit secrets.

## Suggested Package Set

```bash
npm install react@^19.2.5 react-dom@^19.2.5 d3@^7.9.0 @google/genai@^1.50.1 zod@^4.3.6 comlink@^4.4.2
npm install -D vite@^8.0.8 @vitejs/plugin-react@^6.0.1 tailwindcss@^4.2.2 @tailwindcss/vite@^4.2.2 typescript@^6.0.3
```

## Confidence Notes

- HIGH: npm registry versions verified live; Cloud Run and Gemini guidance cross-checked against current official docs (updated April 2026).
- MEDIUM: Worker+Comlink is strongly recommended for scale/jank control, but may be unnecessary for small stadium models in early MVP.

## Sources

- https://ai.google.dev/gemini-api/docs/models (updated 2026-04-15)
- https://ai.google.dev/gemini-api/docs/quickstart?lang=javascript (updated 2026-03-27)
- https://docs.cloud.google.com/run/docs/deploying (updated 2026-04-17)
- https://docs.cloud.google.com/run/docs/configuring/services/containers (updated 2026-04-17)
- https://docs.cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service (updated 2026-04-17)
- npm registry (`npm view`) for package versions

---
phase: 17
slug: weather-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-15
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm vitest run --changed` |
| **Full suite command** | `pnpm vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run --changed`
- **After every plan wave:** Run `pnpm vitest run tests/api/weather.test.ts tests/lib/api/weather.test.ts tests/components/WeatherCard.test.tsx`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| *To be filled by planner* | | | | | | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/api/weather.test.ts` — covers WTHR-01 (proxy, env var check, upstream error, Zod validation, mapping)
- [ ] `tests/lib/api/weather.test.ts` — covers WTHR-01 (OWM-to-WeatherData mapping, WeatherImpact determination, sim input adjustment)
- [ ] `tests/components/WeatherCard.test.tsx` — covers WTHR-02 (5 visual states, error-with-data stale data preservation)
- Existing infrastructure covers all phase requirements (Vitest already configured at root)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `useWeather` hook polls at 10-min interval | WTHR-02 | Polling hook requires browser runtime; not testable in Vitest without jsdom timer mocks | Mount dashboard page, observe network tab for `/api/weather` calls at ~600s intervals |
| WeatherCard renders in dashboard layout below MatchBanner | WTHR-02 | Layout integration requires full page render | Navigate to dashboard, confirm WeatherCard appears below MatchBanner |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

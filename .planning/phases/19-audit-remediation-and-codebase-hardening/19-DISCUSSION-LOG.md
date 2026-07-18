# Phase 19: Audit Remediation and Codebase Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-18
**Phase:** 19-audit-remediation-and-codebase-hardening
**Areas discussed:** Multilingual Scope, Sustainability AI, Transport AI Connection, Navigation→Heatmap Wiring, Volunteer Portal Dynamism, Zone Friendly Names, Weather City Config, Accessibility: Focus Trap, useAlertStream Behavioral Bug, usePoller Generic Hook Extraction, Cross-Store Coupling Fix, makeValidatedStorage Factory, Phase Transition Logic Cleanup

---

## Multilingual Scope

| Option | Description | Selected |
|--------|-------------|----------|
| AR + PT + DE (3 new) | Arabic, Portuguese, German | |
| AR + PT + DE + JA + KO + NL + IT (7 new) | All 7 additional languages | ✓ |
| AR + PT + DE + JA + KO (5 new) | Subset of FIFA languages | |
| ~30 keys | Covers all visible UI strings | |
| ~50+ keys | Full coverage incl. tooltips, errors, form labels | ✓ |
| ~15 keys | Minimal expansion only | |
| AI-generated | Gemini generates all translations | |
| AI-generated + manual override | Gemini + human review | ✓ |
| Manual only | User provides all translations | |
| Native script labels | Each language in its own script | ✓ |
| Short codes | Two-letter codes only | |
| Full RTL support | Flip layout for Arabic | |
| RTL text only | Arabic text right-aligned in LTR | |
| Skip RTL for now | Arabic in LTR layout | ✓ |
| LOCALE_NAMES map | Map in useChatStream.ts | ✓ |
| Store full name instead | Change i18nSlice | |

**User's choice:** 7 languages (AR/PT/DE/JA/KO/NL/IT), 50+ keys, AI+manual, native labels, skip RTL, LOCALE_NAMES map
**Notes:** 10 total languages (EN/ES/FR/AR/PT/DE/JA/KO/NL/IT)

---

## Sustainability AI

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated /api/sustainability endpoint | New POST route | ✓ |
| Extend Gemini risk prompt | Add to existing buildGeminiRiskPrompt | |
| Full panel: score + recs + heatmap | Comprehensive UI | ✓ |
| Simple card: score + recs | Lighter implementation | |
| Dashboard page | Below MatchBanner/WeatherCard | ✓ |
| Report page | Next to RiskReportPanel | |
| Both dashboard + report | Summary + full panel | |

**User's choice:** Dedicated endpoint, full panel on dashboard page

---

## Transport AI Connection

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic from simulation only | Derive from zone occupancy | |
| Full AI endpoint (/api/transport) | Gemini-structured recommendations | ✓ |
| Existing 3 routes | Metro, Bus Shuttle, Accessible Van | |
| Expand to 5-6 routes | Add stadium-specific routes | ✓ |
| On simulation change | Re-call when sim re-runs | ✓ |
| On fixed interval + sim change | Periodic + event-driven | |

**User's choice:** Full AI endpoint, 5-6 routes, re-evaluate on simulation change

---

## Navigation→Heatmap Wiring

| Option | Description | Selected |
|--------|-------------|----------|
| Store event (zustand) | highlightedZone field in store | ✓ |
| Callback prop | Pass through component tree | |
| Pulsing overlay | CSS keyframe animation | ✓ |
| Color shift + border | Fill color + thick ring | |
| Zoom to zone | Pan SVG viewport | |
| Add all 3 accessibility chips | Wheelchair route, drop-off, wait time | ✓ |
| Add only 1-2 | Minimal expansion | |
| Skip, keep current | Chips unchanged | |
| Yes, always show | Button on ChatMessage | ✓ |
| Yes, but only on fan page | Dashboard excluded | |

**User's choice:** Zustand store event, pulse animation, all 3 accessibility chips, "View on map" button always

---

## Volunteer Portal Dynamism

| Option | Description | Selected |
|--------|-------------|----------|
| From highest-severity alert | Task = recent critical alert | ✓ |
| From match phase + zone data | Derived from match state | |
| Both from live alerts | Gate + roster from alert data | ✓ |
| Gate from alerts, roster static | Roster # stays hardcoded | |

**User's choice:** Task from highest-severity alert, gate + roster from alerts

---

## Zone Friendly Names

| Option | Description | Selected |
|--------|-------------|----------|
| Simple friendly names | "North Stand", "South Stand" | ✓ |
| Grandstand-style names | Brand-heavy alternatives | |

**User's choice:** Simple descriptive names

---

## Weather City Config

| Option | Description | Selected |
|--------|-------------|----------|
| Stadium→city map | Hardcoded map in weather route | ✓ |
| Env var | WEATHER_CITY env var | |
| All FIFA 2026 host stadiums | 15+ entries | |
| Just the ones we reference | ~5-7 entries | ✓ |

**User's choice:** Stadium→city map with ~5-7 referenced stadiums

---

## Accessibility: Focus Trap

| Option | Description | Selected |
|--------|-------------|----------|
| Native <dialog> element | Built-in focus management | ✓ |
| Focus-trap library | External package | |
| Manual focus management | onKeyDown trapping | |

**User's choice:** Native HTML <dialog> element

---

## useAlertStream Behavioral Bug

| Option | Description | Selected |
|--------|-------------|----------|
| useRef pattern (audit fix) | Match to ref, remove from deps | ✓ |
| useEvent (React experimental) | Experimental hook | |

**User's choice:** useRef pattern (matches audit fix)

---

## usePoller Generic Hook Extraction

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, extract | Create usePoller<T> | ✓ |
| No, keep duplicated | Leave as-is | |
| Minimal interface | fetchFn, intervalMs, enabled, maxRetries | ✓ |
| Full interface with callbacks | Add onSuccess, onError, retryBaseMs | |

**User's choice:** Extract usePoller<T> with minimal interface

---

## Cross-Store Coupling Fix

| Option | Description | Selected |
|--------|-------------|----------|
| Move to ScenarioForm call site | Explicit orchestration in onValidInput | ✓ |
| Create orchestrator hook | useRunSimulation() coordinate | |

**User's choice:** Move comparison store call to ScenarioForm call site

---

## makeValidatedStorage Factory

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, extract to own file | src/lib/storage/makeValidatedStorage.ts | ✓ |
| Yes, inline in liveStore | Factory function in liveStore.ts | |

**User's choice:** Extract to dedicated file

---

## Phase Transition Logic Cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, extract (audit fix) | resolvePhaseEvent() pure function | ✓ |
| No, leave as-is | Current code works | |

**User's choice:** Extract resolvePhaseEvent() pure function

---

## the agent's Discretion

- Exact zone delta targets for goal events
- Demo event advance interval speed (5s default)
- DemoModeBanner styling details
- SportingEventSelector icon selection
- Specific implementation details for pulse animation keyframes, focus-trap dialog markup, skip-to-content link styling, SustainabilityPanel layout, TransportWidget expanded routes, ChatMessage button styling
- Stadium→city map entries (which ~5-7 stadiums)
- Weather→lucide-react icon mapping
- Quick chip accessibility wording
- Translation i18n key naming convention and file structure

## Deferred Ideas

- **Full Arabic RTL layout support** — When AR locale is active, flip layout direction (dir='rtl'), mirror alignment, adjust margins/paddings. Future phase.

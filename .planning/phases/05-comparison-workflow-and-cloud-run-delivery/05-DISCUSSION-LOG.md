# Phase 5: Comparison Workflow and Cloud Run Delivery - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves alternatives considered.

**Date:** 2026-04-19
**Phase:** 05-comparison-workflow-and-cloud-run-delivery
**Areas discussed:** Comparison Baseline Model, Sensitivity Narrative Rules, Export Artifact Format, Cloud Run Delivery Shape

---

## Comparison Baseline Model

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit pair selection from run history | User picks baseline and candidate runs from a persisted history list; safest and most audit-friendly. | yes |
| Auto compare latest run against last run | Fastest flow, but can be ambiguous when users explore multiple branches. | |
| Pin a named baseline scenario and compare every new run to it | Good for stable drills, but weaker for iterative experimentation. | |
| Let the agent decide | Leave implementation strategy open. | |

**User's choice:** Explicit pair selection from run history.
**Notes:** Chosen for auditability and comparison clarity.

### Follow-up: Run history storage

| Option | Description | Selected |
|--------|-------------|----------|
| Local persisted browser storage with schema validation | Extends current persisted-store pattern and keeps static deployment simple. | yes |
| In-memory session only | No persistence across refresh; weakest comparison continuity. | |
| Remote backend storage | Strongest persistence but introduces new backend capability and scope. | proposed then deferred |
| Let the agent decide | Leave implementation details open. | |

**User's choice:** Local persisted browser storage with schema validation (in-scope decision).
**Notes:** Remote backend storage was discussed and deferred as out-of-scope for this phase.

---

## Sensitivity Narrative Rules

| Option | Description | Selected |
|--------|-------------|----------|
| Absolute delta + percent delta + severity band change | Full decision-grade quantification of intervention impact. | yes |
| Percent delta only | Compact but can hide practical effect size. | |
| Severity band change only | Fast to read but loses quantitative depth. | |
| Let the agent decide | Keep quantification format flexible. | |

**User's choice:** Absolute delta + percent delta + severity band change.

### Follow-up: Narrative scope

| Option | Description | Selected |
|--------|-------------|----------|
| Top 3 changed zones plus overall risk summary | Balanced detail and readability for briefing. | yes |
| Single highest-risk zone only | Very concise but incomplete for distributed risk. | |
| All zones in full detail | Complete but noisy for quick operational use. | |
| Other | Custom scope definition. | |

**User's choice:** Top 3 changed zones plus overall risk summary.

---

## Export Artifact Format

| Option | Description | Selected |
|--------|-------------|----------|
| JSON export + print-friendly HTML summary | Covers machine + human briefing needs in MVP scope. | yes |
| PDF only | Briefing-friendly but heavier implementation now. | |
| JSON only | Fast but weaker for operations handoff. | |
| Let the agent decide | Keep export scope open. | |

**User's choice:** JSON export + print-friendly HTML summary.

### Follow-up: Required export content

| Option | Description | Selected |
|--------|-------------|----------|
| Compared run metadata (timestamps, scenario names, hashes) | Traceability and audit context. | yes |
| Top 3 zone deltas with severity transitions | Core sensitivity evidence. | yes |
| Action recommendations summary | Operational handoff value. | yes |
| Assumptions/limitations block | Communicates model boundaries. | yes |
| Raw full phase-zone matrix dump | Maximum detail but too noisy for primary briefing output. | |

**User's choice:** Include metadata, top 3 deltas, action summary, assumptions/limitations.

---

## Cloud Run Delivery Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Static Vite build served by Nginx container on Cloud Run | Matches DEP-02 and current architecture direction. | yes |
| Node server container serving static files | Extra runtime surface for little value. | |
| Hybrid app + API container | Adds backend scope and complexity. | |
| Let the agent decide | Keep packaging approach open. | |

**User's choice:** Static Vite build served by Nginx container on Cloud Run.

### Follow-up: Deployment automation expectation

| Option | Description | Selected |
|--------|-------------|----------|
| Documented manual gcloud deploy + checked-in Dockerfile/nginx config | Reproducible and practical for MVP timeline. | yes |
| Full CI/CD pipeline required now | Larger investment than phase requires. | |
| Ad hoc local-only deploy commands | Fast but not repeatable enough for demos. | |
| Other | Custom deployment expectation. | |

**User's choice:** Documented manual deployment with checked-in container config.

### Follow-up: Demo acceptance path

| Option | Description | Selected |
|--------|-------------|----------|
| Public run.app URL opens and loads app shell | DEP-01 core validation. | yes |
| SPA route refresh works (nginx fallback to index.html) | Prevents deep-link demo failures. | yes |
| Run -> compare -> export flow works from deployed URL | End-to-end requirement proof. | yes |
| Custom domain + HTTPS cert setup | Useful but non-essential for MVP. | |

**User's choice:** Validate URL availability, SPA fallback, and end-to-end deployed flow.

---

## the agent's Discretion

- UI layout details for comparison panels and export controls.
- Record-level run history schema details beyond required traceability fields.
- Print style details for HTML artifact.

## Deferred Ideas

- Remote backend storage for run history.
- Full CI/CD deployment automation.
- Custom domain and certificate setup.

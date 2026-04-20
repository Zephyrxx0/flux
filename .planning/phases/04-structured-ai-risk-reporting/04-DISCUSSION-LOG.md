# Phase 4: Structured AI Risk Reporting - Discussion Log

**Date:** 2026-04-19
**Mode:** discuss
**Branch:** phase-04-structured-ai-risk-reporting

## Selections

- Discussed all identified areas in one pass.
- Locked strict schema contract and deterministic fallback approach.

## Decision Trail

1. **Schema contract strictness**
- Selected: Strict fixed schema.
- Rationale: Safety and trust depend on rejecting malformed AI output.

2. **Fallback design**
- Selected: Full structured deterministic fallback report.
- Rationale: Users must always receive complete actionable output even when AI fails.

3. **Trigger behavior**
- Selected: Automatic report generation after successful simulation run.
- Rationale: Keeps workflow fast for planning iterations.

4. **Failure UX**
- Selected: Inline error + automatic fallback + Retry button.
- Rationale: Transparent failure handling without blocking simulation interpretation.

5. **Mandatory report sections**
- Selected: All proposed sections, including machine-readable evidence and assumptions/limitations.
- Rationale: Needs both operational readability and structured downstream consumption.

6. **Retry policy conflict resolution**
- Initial selection: one automatic retry.
- Conflict detected with prior one-call-per-run project decision.
- Final resolution: keep one-call-per-run; retry remains user-initiated only.

## Scope Guardrail Notes

- Kept within Phase 4 boundary (structured AI reporting and fallback behavior).
- Deferred broader comparison/report export enhancements to Phase 5.

## Output

- Wrote `.planning/phases/04-structured-ai-risk-reporting/04-CONTEXT.md`.

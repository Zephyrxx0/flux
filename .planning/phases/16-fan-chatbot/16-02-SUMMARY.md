# 16-02 SUMMARY: POST /api/chat SSE Route Handler

## Status: Complete ✅

## What Was Built

Full SSE POST route handler at `/api/chat` that receives chat messages, streams Gemini responses, and emits structured output events.

## Key Files Created / Modified

### Created
- `tests/api/chat.test.ts` — 6 integration tests following the alert.test.ts pattern

### Modified
- `src/app/api/chat/route.ts` — Full implementation replacing the placeholder stub

## Route Behavior

1. **POST body parsing** — validates with `ChatRequestSchema` (messages[], max 10); returns 400 on invalid JSON or schema failure
2. **Match state** — extracted from query params (`minute`, `phase`, `score`, `homeTeam`, `awayTeam`)
3. **Zone data** — server-initialized from `presets.normal` + `simulateDeterministic`
4. **Prompt** — built via `buildChatPrompt(zones, matchState, messages)` (from 16-01)
5. **SSE events emitted**:
   - `{"type":"token","text":"..."}` — for each Gemini chunk
   - `{"type":"structured","response":{...ChatResponse...}}` — after stream completes
   - `{"type":"complete"}` — end signal
   - `{"type":"error","message":"..."}` — on failures
6. **Retry logic** — 1 retry on Zod parse failure, text-only fallback if both fail
7. **Error handling** — `GeminiFetchError` (missing key → "API key not configured"), `GeminiRateLimitError` ("Rate limit reached"), generic errors

## Verification

```
npx vitest run tests/api/chat.test.ts
```

**Result: 6/6 tests pass** ✅

## Self-Check: PASSED

## What 16-03 and 16-04 Can Now Use

- POST `/api/chat` endpoint ready for `useChatStream` hook to consume
- SSE event format: `token`, `structured`, `complete`, `error`

import type { MatchState } from "@/types/match";
import type { ChatMessage } from "@/types/chat";

export function buildChatPrompt(
  zones: { id: string; name: string; occupancy: number; capacity: number; occupancyRatio: number }[],
  matchState: MatchState,
  history: ChatMessage[]
): string {
  const instructions = [
    "You are a stadium navigation assistant.",
    "Use ONLY the zone data and match state provided below.",
    "Do NOT guess wait times. If data is unavailable, say so.",
    "Keep answers concise (2-3 sentences max).",
    "Respond ONLY with a valid JSON object. No markdown fences, no commentary.",
    "Required JSON format:",
    '{ "text": "...", "suggestedGate": "C" | null, "walkingTime": "2 min" | null, "zoneInfo": { "zoneId": "north", "name": "North Zone", "occupancyRatio": 0.5 } | null }',
    "",
    "Example good response:",
    '{"text":"Gate C is closest to your seat. Walking time is approximately 2 minutes via the north concourse.","suggestedGate":"C","walkingTime":"2 min","zoneInfo":{"zoneId":"north","name":"North Zone","occupancyRatio":0.5}}',
  ];

  const matchContext = [
    "--- MATCH CONTEXT ---",
    `Minute: ${matchState.minute ?? "Pre-match"}`,
    `Phase: ${matchState.phase}`,
    `Score: ${matchState.homeTeam} ${matchState.score} ${matchState.awayTeam}`,
  ].join("\n");

  const zoneData = [
    "--- ZONE DATA ---",
    `Based on current conditions:`,
    ...zones.map(
      (z) =>
        `Zone ${z.id} (${z.name}): ${z.occupancy}/${z.capacity} fans (${Math.round(z.occupancyRatio * 100)}% capacity)`
    ),
  ].join("\n");

  const conversationHistory =
    history.length > 0
      ? [
          "--- CONVERSATION HISTORY (oldest first) ---",
          ...history.map((m) =>
            `${m.role === "user" ? "Fan" : "Assistant"}: ${m.content}`
          ),
        ].join("\n")
      : "";

  const parts = [instructions.join("\n"), "", matchContext, "", zoneData];
  if (conversationHistory) {
    parts.push("", conversationHistory);
  }

  return parts.join("\n");
}

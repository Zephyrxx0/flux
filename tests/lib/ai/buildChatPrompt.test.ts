import { describe, it, expect } from "vitest";
import { buildChatPrompt } from "@/app/api/chat/prompts";
import type { ChatMessage } from "@/types/chat";

const mockZones = [
  { id: "north", name: "North Zone", occupancy: 300, capacity: 600, occupancyRatio: 0.5 },
  { id: "south", name: "South Zone", occupancy: 480, capacity: 600, occupancyRatio: 0.8 },
];

const mockMatchState = {
  minute: 55,
  phase: "second-half" as const,
  score: "2-1",
  homeTeam: "Iran",
  awayTeam: "Japan",
};

const mockHistory: ChatMessage[] = [
  {
    id: "1",
    role: "user",
    content: "Where's my gate?",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    role: "assistant",
    content: "Gate C is closest.",
    timestamp: new Date().toISOString(),
  },
];

describe("buildChatPrompt", () => {
  it("prompt contains zone occupancy info", () => {
    const prompt = buildChatPrompt(mockZones, mockMatchState, []);
    expect(prompt).toMatch(/North Zone|300\/600|50%/);
  });

  it("prompt contains match state context", () => {
    const prompt = buildChatPrompt(mockZones, mockMatchState, []);
    expect(prompt).toMatch(/55|second-half|2-1/);
    expect(prompt).toMatch(/Iran|Japan/);
  });

  it("prompt contains JSON schema instruction", () => {
    const prompt = buildChatPrompt(mockZones, mockMatchState, []);
    expect(prompt).toMatch(/Respond ONLY with a valid JSON/i);
  });

  it("prompt contains conversation history oldest-first", () => {
    const prompt = buildChatPrompt(mockZones, mockMatchState, mockHistory);
    expect(prompt).toContain("Where's my gate?");
    expect(prompt).toContain("Gate C is closest.");
    // history older messages should appear before newer ones
    const gateIdx = prompt.indexOf("Where's my gate?");
    const responseIdx = prompt.indexOf("Gate C is closest.");
    expect(gateIdx).toBeLessThan(responseIdx);
  });

  it("prompt contains context-aware phrasing", () => {
    const prompt = buildChatPrompt(mockZones, mockMatchState, []);
    expect(prompt).toMatch(/stadium|zone|navigation/i);
  });
});

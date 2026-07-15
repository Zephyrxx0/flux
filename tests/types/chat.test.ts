import { describe, it, expect } from "vitest";
import { ChatResponseSchema, ChatRequestSchema, ChatMessageSchema } from "@/types/chat";

describe("ChatResponseSchema", () => {
  it("validates complete response with all fields", () => {
    const result = ChatResponseSchema.safeParse({
      text: "Gate C is the closest to your seat.",
      suggestedGate: "C",
      walkingTime: "2 min",
      zoneInfo: { zoneId: "north", name: "North Zone", occupancyRatio: 0.5 },
    });
    expect(result.success).toBe(true);
  });

  it("validates response with all optional fields null", () => {
    const result = ChatResponseSchema.safeParse({
      text: "Head to the nearest exit.",
      suggestedGate: null,
      walkingTime: null,
      zoneInfo: null,
    });
    expect(result.success).toBe(true);
  });

  it("fails when required text field is missing", () => {
    const result = ChatResponseSchema.safeParse({
      suggestedGate: "A",
      walkingTime: "3 min",
    });
    expect(result.success).toBe(false);
  });
});

describe("ChatRequestSchema", () => {
  it("accepts messages as empty array (default)", () => {
    const result = ChatRequestSchema.safeParse({ messages: [] });
    expect(result.success).toBe(true);
  });

  it("accepts messages with up to 10 items", () => {
    const msg = ChatMessageSchema.parse({
      id: "1",
      role: "user",
      content: "Hello",
      timestamp: new Date().toISOString(),
    });
    const result = ChatRequestSchema.safeParse({ messages: Array(10).fill(msg) });
    expect(result.success).toBe(true);
  });

  it("rejects messages array with more than 10 items", () => {
    const msg = {
      id: "1",
      role: "user",
      content: "Hello",
      timestamp: new Date().toISOString(),
    };
    const result = ChatRequestSchema.safeParse({ messages: Array(11).fill(msg) });
    expect(result.success).toBe(false);
  });
});

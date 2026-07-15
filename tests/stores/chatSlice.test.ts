import { describe, it, expect } from "vitest";
import { createStore } from "zustand";
import { createChatSlice, ChatSlice } from "@/stores/slices/chatSlice";
import type { ChatMessage } from "@/types/chat";

const createMockStore = () =>
  createStore<ChatSlice>((set, get, store) =>
    createChatSlice(set as any, get as any, store as any)
  );

const makeMsg = (id: string, role: "user" | "assistant" = "user"): ChatMessage => ({
  id,
  role,
  content: `Message ${id}`,
  timestamp: new Date().toISOString(),
});

describe("chatSlice", () => {
  it("initial state has empty messages and isStreaming false", () => {
    const store = createMockStore();
    expect(store.getState().messages).toHaveLength(0);
    expect(store.getState().isStreaming).toBe(false);
  });

  it("addMessage appends a single message", () => {
    const store = createMockStore();
    store.getState().addMessage(makeMsg("1"));
    expect(store.getState().messages).toHaveLength(1);
    expect(store.getState().messages[0].id).toBe("1");
  });

  it("max 10 count — adding 11 messages keeps count at 10", () => {
    const store = createMockStore();
    for (let i = 1; i <= 11; i++) {
      store.getState().addMessage(makeMsg(i.toString()));
    }
    expect(store.getState().messages.length).toBeLessThanOrEqual(10);
  });

  it("FIFO eviction drops oldest — 12 messages removes first", () => {
    const store = createMockStore();
    for (let i = 1; i <= 12; i++) {
      store.getState().addMessage(makeMsg(i.toString()));
    }
    const ids = store.getState().messages.map((m) => m.id);
    expect(ids).not.toContain("1");
  });

  it("clearMessages resets messages to empty array", () => {
    const store = createMockStore();
    store.getState().addMessage(makeMsg("1"));
    store.getState().clearMessages();
    expect(store.getState().messages).toHaveLength(0);
  });

  it("clearMessages sets isStreaming to false", () => {
    const store = createMockStore();
    store.getState().setStreaming(true);
    store.getState().clearMessages();
    expect(store.getState().isStreaming).toBe(false);
  });

  it("setStreaming toggles isStreaming state", () => {
    const store = createMockStore();
    store.getState().setStreaming(true);
    expect(store.getState().isStreaming).toBe(true);
    store.getState().setStreaming(false);
    expect(store.getState().isStreaming).toBe(false);
  });
});

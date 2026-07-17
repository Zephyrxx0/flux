import { type StateCreator } from "zustand";
import type { LiveStore } from "../liveStore";
import type { ChatMessage } from "@/types";

export interface ChatSlice {
  messages: ChatMessage[];
  isStreaming: boolean;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, update: Partial<ChatMessage>) => void;
  setStreaming: (isStreaming: boolean) => void;
  clearMessages: () => void;
}

export const createChatSlice: StateCreator<LiveStore, [], [], ChatSlice> = (set) => ({
  messages: [],
  isStreaming: false,
  addMessage: (message) =>
    set((state) => {
      const newMessages = [...state.messages, message];
      if (newMessages.length > 10) {
        return { messages: newMessages.slice(-9) };
      }
      return { messages: newMessages };
    }),
  updateMessage: (id, update) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...update } : msg
      ),
    })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  clearMessages: () => set({ messages: [], isStreaming: false }),
});

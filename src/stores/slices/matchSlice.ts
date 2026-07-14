import { type StateCreator } from "zustand";
import type { LiveStore } from "../liveStore";
import { type MatchState } from "@/types/match";

export interface MatchSlice {
  match: MatchState | null;
  setMatch: (match: MatchState | null) => void;
}

export const createMatchSlice: StateCreator<LiveStore, [], [], MatchSlice> = (set) => ({
  match: null,
  setMatch: (match) => set({ match }),
});

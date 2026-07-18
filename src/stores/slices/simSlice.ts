import { type StateCreator } from "zustand";
import type { LiveStore } from "../liveStore";
import type { SimulationInput } from "@/simulation/contracts/input.schema";

export interface SimSlice {
  simConfig: SimulationInput | null;
  initialized: boolean;
  initializeSim: (data: SimulationInput) => void;
  reset: () => void;
}

export const createSimSlice: StateCreator<LiveStore, [], [], SimSlice> = (set) => ({
  simConfig: null,
  initialized: false,
  initializeSim: (data) => set({ simConfig: data, initialized: true }),
  reset: () => set({ simConfig: null, initialized: false }),
});

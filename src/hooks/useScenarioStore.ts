import { z } from "zod"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { useComparisonStore } from "@/hooks/useComparisonStore"
import { useRiskReportStore } from "@/hooks/useRiskReportStore"
import { SimulationInputSchema, type SimulationInput } from "@/simulation/contracts/input.schema"
import type { SimulationOutput } from "@/simulation/contracts/output.schema"
import { presets, type PresetName } from "@/simulation/presets"

const STORE_KEY = "scenario-store"

const PersistedStateSchema = z.object({
  currentInput: SimulationInputSchema,
  savedScenarios: z.record(z.string(), SimulationInputSchema),
})

type ScenarioStateSnapshot = z.infer<typeof PersistedStateSchema>

type ScenarioState = ScenarioStateSnapshot & {
  latestSimulationOutput: SimulationOutput | null
  updateInput: (input: SimulationInput) => void
  setLatestSimulationOutput: (output: SimulationOutput | null) => void
  saveScenario: (name: string, input?: SimulationInput) => void
  loadScenario: (name: string) => void
  applyPreset: (preset: PresetName) => void
}

const defaultInput = presets.normal

export function validatePersistedScenarioState(payload: unknown): ScenarioStateSnapshot | null {
  const parsed = PersistedStateSchema.safeParse(payload)
  return parsed.success ? parsed.data : null
}

function parsePersistedStorageEntry(value: string | null): string | null {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(value) as { state?: unknown; version?: number }
    const validatedState = validatePersistedScenarioState(parsed.state)
    if (!validatedState) {
      return null
    }

    return JSON.stringify({
      state: validatedState,
      version: parsed.version ?? 0,
    })
  } catch {
    return null
  }
}

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get) => ({
      currentInput: defaultInput,
      savedScenarios: {},
      latestSimulationOutput: null,
      updateInput: (input) => set({ currentInput: SimulationInputSchema.parse(input) }),
      setLatestSimulationOutput: (output) => {
        set({ latestSimulationOutput: output })
        if (output) {
          useComparisonStore.getState().appendRun(output)
          void useRiskReportStore.getState().generateFromSimulation(output)
        }
      },
      saveScenario: (name, input) => {
        const trimmedName = name.trim()
        if (!trimmedName) {
          return
        }

        const scenario = SimulationInputSchema.parse(input ?? get().currentInput)
        set((state) => ({
          savedScenarios: {
            ...state.savedScenarios,
            [trimmedName]: scenario,
          },
        }))
      },
      loadScenario: (name) => {
        const scenario = get().savedScenarios[name]
        if (scenario) {
          set({ currentInput: SimulationInputSchema.parse(scenario) })
        }
      },
      applyPreset: (presetName) => {
        set({ currentInput: SimulationInputSchema.parse(presets[presetName]) })
      },
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => ({
        getItem: (name) => parsePersistedStorageEntry(window.localStorage.getItem(name)),
        setItem: (name, value) => window.localStorage.setItem(name, value),
        removeItem: (name) => window.localStorage.removeItem(name),
      })),
      partialize: (state) => ({
        currentInput: state.currentInput,
        savedScenarios: state.savedScenarios,
      }),
    },
  ),
)

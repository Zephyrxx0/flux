import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useComparisonStore } from "@/hooks/useComparisonStore"
import { simulationOutputFixture } from "../fixtures/simulationOutput"

function outputWithHash(hash: string) {
  return {
    ...simulationOutputFixture,
    runDeterministicHash: hash,
  }
}

describe("useComparisonStore", () => {
  beforeEach(() => {
    localStorage.clear()
    useComparisonStore.getState().reset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    useComparisonStore.getState().reset()
  })

  it("appends runs and auto-selects candidate/latest pair", () => {
    useComparisonStore.getState().appendRun(outputWithHash("hash-a"), "normal")
    useComparisonStore.getState().appendRun(outputWithHash("hash-b"), "rush")

    const state = useComparisonStore.getState()
    expect(state.runHistory).toHaveLength(2)
    expect(state.candidateRunId).toContain("hash-b")
    expect(state.baselineRunId).toContain("hash-a")
  })

  it("allows explicit baseline and candidate selection", () => {
    useComparisonStore.getState().appendRun(outputWithHash("hash-a"), "normal")
    useComparisonStore.getState().appendRun(outputWithHash("hash-b"), "rush")

    const [first, second] = useComparisonStore.getState().runHistory
    if (!first || !second) {
      throw new Error("Expected runs to exist")
    }

    useComparisonStore.getState().selectBaselineRun(second.id)
    useComparisonStore.getState().selectCandidateRun(first.id)

    const state = useComparisonStore.getState()
    expect(state.baselineRunId).toBe(second.id)
    expect(state.candidateRunId).toBe(first.id)
  })

  it("clears conflicting selection when the same run is chosen for both sides", () => {
    useComparisonStore.getState().appendRun(outputWithHash("hash-a"), "normal")
    useComparisonStore.getState().appendRun(outputWithHash("hash-b"), "rush")

    const [first] = useComparisonStore.getState().runHistory
    if (!first) {
      throw new Error("Expected run to exist")
    }

    useComparisonStore.getState().selectBaselineRun(first.id)
    useComparisonStore.getState().selectCandidateRun(first.id)

    expect(useComparisonStore.getState().baselineRunId).toBeNull()
    expect(useComparisonStore.getState().candidateRunId).toBe(first.id)
  })
})

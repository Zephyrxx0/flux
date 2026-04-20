import React from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { ScenarioForm } from "../../src/components/config/ScenarioForm"
import { presets } from "../../src/simulation/presets"
import { useScenarioStore } from "../../src/hooks/useScenarioStore"

describe("ScenarioForm", () => {
  beforeEach(() => {
    localStorage.clear()
    useScenarioStore.setState({
      currentInput: presets.normal,
      savedScenarios: {},
    })
  })

  it("renders nested arrays and syncs when preset state changes", async () => {
    render(React.createElement(ScenarioForm))

    expect(screen.getAllByTestId("zones-row").length).toBeGreaterThan(0)
    expect(screen.getByDisplayValue("1200")).toBeInTheDocument()

    act(() => {
      useScenarioStore.getState().applyPreset("crisis")
    })

    await waitFor(() => {
      expect(screen.getByDisplayValue("1250")).toBeInTheDocument()
    })
  })
})

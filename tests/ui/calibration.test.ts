import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { ScenarioForm } from "../../src/components/config/ScenarioForm"
import { presets } from "../../src/simulation/presets"
import { useScenarioStore } from "../../src/hooks/useScenarioStore"

describe("ScenarioForm calibration accordion", () => {
  beforeEach(() => {
    localStorage.clear()
    useScenarioStore.setState({
      currentInput: presets.normal,
      savedScenarios: {},
    })
  })

  it("renders collapsible advanced calibration controls", () => {
    render(React.createElement(ScenarioForm))

    const trigger = screen.getByTestId("advanced-calibration-trigger")
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)

    expect(screen.getByTestId("advanced-calibration-content")).toBeInTheDocument()
  })
})

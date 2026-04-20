import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PresetsToolbar } from "../../src/components/config/PresetsToolbar"

const applyPreset = vi.fn()

vi.mock("../../src/hooks/useScenarioStore", () => ({
  useScenarioStore: (selector: (state: { applyPreset: (key: "normal" | "rush" | "crisis") => void }) => unknown) =>
    selector({ applyPreset }),
}))

describe("PresetsToolbar", () => {
  beforeEach(() => {
    applyPreset.mockReset()
  })

  it("triggers store applyPreset action from each button", () => {
    render(React.createElement(PresetsToolbar))

    fireEvent.click(screen.getByTestId("preset-normal"))
    fireEvent.click(screen.getByTestId("preset-rush"))
    fireEvent.click(screen.getByTestId("preset-crisis"))

    expect(applyPreset).toHaveBeenNthCalledWith(1, "normal")
    expect(applyPreset).toHaveBeenNthCalledWith(2, "rush")
    expect(applyPreset).toHaveBeenNthCalledWith(3, "crisis")
  })
})

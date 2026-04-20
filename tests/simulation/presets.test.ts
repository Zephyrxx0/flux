import { describe, expect, it } from "vitest"

import { SimulationInputSchema } from "../../src/simulation/contracts/input.schema"
import { presets } from "../../src/simulation/presets"

describe("presets", () => {
  it("exposes normal, rush, and crisis presets", () => {
    expect(Object.keys(presets).sort()).toEqual(["crisis", "normal", "rush"])
  })

  it("validates each preset against SimulationInputSchema", () => {
    for (const [name, preset] of Object.entries(presets)) {
      expect(() => SimulationInputSchema.parse(preset), `preset ${name}`).not.toThrow()
    }
  })
})

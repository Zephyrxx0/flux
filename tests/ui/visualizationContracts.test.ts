import { afterEach, describe, expect, it, vi } from "vitest"

import { PREFERS_REDUCED_MOTION, VISUALIZATION_EASE, VISUALIZATION_TRANSITION_MS } from "@/visualization/contracts/motionPolicy"
import { RISK_BAND_ORDER, riskBandFromRatio } from "@/visualization/contracts/riskEncoding"
import { buildVisualizationModel } from "@/visualization/selectors/buildVisualizationModel"
import { simulationOutputFixture } from "./fixtures/simulationOutput"

describe("visualization contracts", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("maps occupancy ratios to locked risk bands", () => {
    expect(riskBandFromRatio(0.79)).toBe("green")
    expect(riskBandFromRatio(0.8)).toBe("amber")
    expect(riskBandFromRatio(0.949)).toBe("amber")
    expect(riskBandFromRatio(0.95)).toBe("red")
    expect(RISK_BAND_ORDER).toEqual(["green", "amber", "red", "critical"])
  })

  it("exports transition constants within D-08 range", () => {
    expect(VISUALIZATION_TRANSITION_MS).toBeGreaterThanOrEqual(150)
    expect(VISUALIZATION_TRANSITION_MS).toBeLessThanOrEqual(250)
    expect(VISUALIZATION_EASE.length).toBeGreaterThan(0)
  })

  it("builds deterministic phase ordering and zone-keyed series", () => {
    const model = buildVisualizationModel(simulationOutputFixture)

    expect(model.phaseOrder).toEqual(["phase-1", "phase-2"])
    expect(Object.keys(model.zoneSeries)).toEqual(["zone-a", "zone-b"])
    expect(model.zoneSeries["zone-a"].points.map((point) => point.phaseId)).toEqual(["phase-1", "phase-2"])
    expect(model.latestZoneRisk["zone-b"]).toMatchObject({
      phaseId: "phase-2",
      occupancyRatio: 0.97,
      riskBand: "red",
    })
  })

  it("supports reduced-motion fallback via reusable policy", () => {
    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    })

    expect(PREFERS_REDUCED_MOTION()).toBe(true)
  })
})

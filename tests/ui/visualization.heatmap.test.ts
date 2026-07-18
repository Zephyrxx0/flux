import React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { RiskLegend } from "@/visualization/components/RiskLegend"
import { StadiumHeatmap } from "@/visualization/components/StadiumHeatmap"
import { RISK_LEGEND } from "@/visualization/contracts/riskEncoding"
import type { LatestZoneRisk } from "@/visualization/selectors/buildVisualizationModel"

function buildLatestZoneRiskFixture(): Record<string, LatestZoneRisk> {
  return {
    "north": {
      zoneId: "north",
      phaseId: "phase-2",
      occupancyRatio: 0.74,
      riskBand: "green",
    },
    "south": {
      zoneId: "south",
      phaseId: "phase-2",
      occupancyRatio: 0.84,
      riskBand: "amber",
    },
    "east": {
      zoneId: "east",
      phaseId: "phase-2",
      occupancyRatio: 0.97,
      riskBand: "red",
    },
    "zone-x": {
      zoneId: "zone-x",
      phaseId: "phase-2",
      occupancyRatio: 0.99,
      riskBand: "red",
    },
  }
}

describe("StadiumHeatmap and RiskLegend", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders stadium polygon regions keyed by zoneId", () => {
    render(React.createElement(StadiumHeatmap, { latestZoneRisk: buildLatestZoneRiskFixture() }))

    expect(screen.getByTestId("stadium-heatmap-svg")).toBeInTheDocument()
    expect(screen.getByTestId("heatmap-zone-north")).toBeInTheDocument()
    expect(screen.getByTestId("heatmap-zone-south")).toBeInTheDocument()
    expect(screen.getByTestId("heatmap-zone-east")).toBeInTheDocument()
  })

  it("uses shared threshold semantics for heatmap fills and legend", () => {
    render(
      React.createElement("div", {}, [
        React.createElement(StadiumHeatmap, {
          key: "map",
          latestZoneRisk: buildLatestZoneRiskFixture(),
        }),
        React.createElement(RiskLegend, { key: "legend" }),
      ]),
    )

    const green = RISK_LEGEND.find((entry) => entry.band === "green")
    const amber = RISK_LEGEND.find((entry) => entry.band === "amber")
    const red = RISK_LEGEND.find((entry) => entry.band === "red")

    expect(screen.getByTestId("heatmap-zone-north")).toHaveAttribute("data-risk-band", "green")
    expect(screen.getByTestId("heatmap-zone-north")).toHaveAttribute("fill", green?.color ?? "")

    expect(screen.getByTestId("heatmap-zone-south")).toHaveAttribute("data-risk-band", "amber")
    expect(screen.getByTestId("heatmap-zone-south")).toHaveAttribute("fill", amber?.color ?? "")

    expect(screen.getByTestId("heatmap-zone-east")).toHaveAttribute("data-risk-band", "red")
    expect(screen.getByTestId("heatmap-zone-east")).toHaveAttribute("fill", red?.color ?? "")

    expect(screen.getByTestId("risk-legend-green")).toHaveTextContent("Low")
    expect(screen.getByTestId("risk-legend-amber")).toHaveTextContent("Elevated")
    expect(screen.getByTestId("risk-legend-red")).toHaveTextContent("High")
  })

  it("degrades gracefully for missing and unmapped zones", () => {
    render(React.createElement(StadiumHeatmap, { latestZoneRisk: buildLatestZoneRiskFixture() }))

    expect(screen.getByTestId("heatmap-zone-west")).toHaveAttribute("data-risk-band", "no-data")
    expect(screen.getByTestId("heatmap-zone-west")).toHaveAttribute("fill", "#cbd5e1")
    expect(screen.getByTestId("heatmap-unmapped-zones")).toHaveTextContent("zone-x")
  })
})
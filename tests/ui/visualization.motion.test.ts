import React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { SimulationOutput } from "@/simulation/contracts/output.schema"
import { VISUALIZATION_TRANSITION_MS } from "@/visualization/contracts/motionPolicy"
import { VisualizationWorkspace } from "@/visualization/components/VisualizationWorkspace"
import { useScenarioStore } from "../../src/hooks/useScenarioStore"

function buildOutput(runDeterministicHash: string, southRatio: number): SimulationOutput {
  return {
    schemaVersion: "1.1.0",
    runDeterministicHash,
    mode: "zone",
    phaseZoneMatrix: [
      {
        phaseId: "phase-1",
        zoneId: "north",
        occupancyFans: 75,
        occupancyRatio: 0.75,
        occupancySeverity: "green",
        carryInFans: 0,
        arrivalsFans: 75,
        availableThroughput: 120,
        processedFans: 75,
        overflowCarryFans: 0,
        blockedByDelay: false,
      },
      {
        phaseId: "phase-2",
        zoneId: "north",
        occupancyFans: 88,
        occupancyRatio: 0.88,
        occupancySeverity: "amber",
        carryInFans: 0,
        arrivalsFans: 88,
        availableThroughput: 120,
        processedFans: 88,
        overflowCarryFans: 0,
        blockedByDelay: false,
      },
      {
        phaseId: "phase-1",
        zoneId: "south",
        occupancyFans: 84,
        occupancyRatio: 0.84,
        occupancySeverity: "amber",
        carryInFans: 0,
        arrivalsFans: 84,
        availableThroughput: 120,
        processedFans: 84,
        overflowCarryFans: 0,
        blockedByDelay: false,
      },
      {
        phaseId: "phase-2",
        zoneId: "south",
        occupancyFans: Math.round(southRatio * 100),
        occupancyRatio: southRatio,
        occupancySeverity: southRatio >= 0.95 ? "red" : "amber",
        carryInFans: 0,
        arrivalsFans: Math.round(southRatio * 100),
        availableThroughput: 120,
        processedFans: Math.round(southRatio * 100),
        overflowCarryFans: 0,
        blockedByDelay: false,
      },
    ],
    peakSummaries: [
      {
        zoneId: "north",
        phaseId: "phase-2",
        peakOccupancyFans: 88,
        peakOccupancyRatio: 0.88,
        peakSeverity: "amber",
      },
      {
        zoneId: "south",
        phaseId: "phase-2",
        peakOccupancyFans: Math.round(southRatio * 100),
        peakOccupancyRatio: southRatio,
        peakSeverity: southRatio >= 0.95 ? "red" : "amber",
      },
    ],
    invariants: {
      deterministicReplay: true,
      nonNegativeOccupancy: true,
      throughputBoundRespected: true,
      carryOverConservation: true,
      matrixComplete: true,
    },
    warnings: [],
  }
}

describe("Visualization motion policy", () => {
  afterEach(() => {
    cleanup()
    useScenarioStore.setState({ latestSimulationOutput: null })
  })

  it("uses shared transition duration across chart and heatmap", async () => {
    const user = userEvent.setup()
    useScenarioStore.setState({ latestSimulationOutput: buildOutput("run-a", 0.9) })

    const { rerender } = render(React.createElement(VisualizationWorkspace, { activeTab: "simulate" }))

    await user.click(screen.getByRole("tab", { name: /Risk Chart/i }))
    await user.click(screen.getByRole("button", { name: /show all zones/i }))

    useScenarioStore.setState({ latestSimulationOutput: buildOutput("run-b", 0.97) })
    rerender(React.createElement(VisualizationWorkspace, { activeTab: "simulate" }))

    expect(screen.getByTestId("risk-line-north")).toHaveStyle(
      `transition-duration: ${VISUALIZATION_TRANSITION_MS}ms`,
    )
    
    await user.click(screen.getByRole("tab", { name: /Heatmap/i }))
    expect(screen.getByTestId("heatmap-zone-south")).toHaveStyle(
      `transition-duration: ${VISUALIZATION_TRANSITION_MS}ms`,
    )
    expect(screen.getByTestId("stadium-heatmap-svg")).toHaveAttribute(
      "data-transition-ms",
      String(VISUALIZATION_TRANSITION_MS),
    )
  })

  it("uses reduced-motion fallback while preserving deterministic final state", async () => {
    const defaultMatchMedia = window.matchMedia

    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    })

    useScenarioStore.setState({ latestSimulationOutput: buildOutput("run-c", 0.97) })
    render(React.createElement(VisualizationWorkspace, { activeTab: "simulate" }))

    await userEvent.click(screen.getByRole("tab", { name: /Risk Chart/i }))
    expect(screen.getByTestId("risk-line-svg")).toHaveAttribute("data-reduced-motion", "true")

    await userEvent.click(screen.getByRole("tab", { name: /Heatmap/i }))
    expect(screen.getByTestId("stadium-heatmap-svg")).toHaveAttribute("data-reduced-motion", "true")
    expect(screen.getByTestId("heatmap-zone-south")).toHaveAttribute("data-risk-band", "red")

    window.matchMedia = defaultMatchMedia
  })
})
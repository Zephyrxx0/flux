import React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { SimulationOutput } from "@/simulation/contracts/output.schema"
import { VISUALIZATION_TRANSITION_MS } from "@/visualization/contracts/motionPolicy"
import { VisualizationWorkspace } from "@/visualization/components/VisualizationWorkspace"
import { useScenarioStore } from "../../src/hooks/useScenarioStore"

function buildOutput(runDeterministicHash: string, zoneBRatio: number): SimulationOutput {
  return {
    schemaVersion: "1.0.0",
    runDeterministicHash,
    mode: "zone",
    phaseZoneMatrix: [
      {
        phaseId: "phase-1",
        zoneId: "zone-a",
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
        zoneId: "zone-a",
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
        zoneId: "zone-b",
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
        zoneId: "zone-b",
        occupancyFans: Math.round(zoneBRatio * 100),
        occupancyRatio: zoneBRatio,
        occupancySeverity: zoneBRatio >= 0.95 ? "red" : "amber",
        carryInFans: 0,
        arrivalsFans: Math.round(zoneBRatio * 100),
        availableThroughput: 120,
        processedFans: Math.round(zoneBRatio * 100),
        overflowCarryFans: 0,
        blockedByDelay: false,
      },
    ],
    peakSummaries: [
      {
        zoneId: "zone-a",
        phaseId: "phase-2",
        peakOccupancyFans: 88,
        peakOccupancyRatio: 0.88,
        peakSeverity: "amber",
      },
      {
        zoneId: "zone-b",
        phaseId: "phase-2",
        peakOccupancyFans: Math.round(zoneBRatio * 100),
        peakOccupancyRatio: zoneBRatio,
        peakSeverity: zoneBRatio >= 0.95 ? "red" : "amber",
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

    const { rerender } = render(React.createElement(VisualizationWorkspace))

    await user.click(screen.getByRole("button", { name: /show all zones/i }))

    useScenarioStore.setState({ latestSimulationOutput: buildOutput("run-b", 0.97) })
    rerender(React.createElement(VisualizationWorkspace))

    expect(screen.getByTestId("risk-line-zone-a")).toHaveStyle(
      `transition-duration: ${VISUALIZATION_TRANSITION_MS}ms`,
    )
    expect(screen.getByTestId("heatmap-zone-zone-b")).toHaveStyle(
      `transition-duration: ${VISUALIZATION_TRANSITION_MS}ms`,
    )
    expect(screen.getByTestId("stadium-heatmap-svg")).toHaveAttribute(
      "data-transition-ms",
      String(VISUALIZATION_TRANSITION_MS),
    )
  })

  it("uses reduced-motion fallback while preserving deterministic final state", () => {
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
    render(React.createElement(VisualizationWorkspace))

    expect(screen.getByTestId("risk-line-svg")).toHaveAttribute("data-reduced-motion", "true")
    expect(screen.getByTestId("stadium-heatmap-svg")).toHaveAttribute("data-reduced-motion", "true")
    expect(screen.getByTestId("workspace-kino-progress")).toHaveAttribute("data-reduced-motion", "true")
    expect(screen.getByTestId("heatmap-zone-zone-b")).toHaveAttribute("data-risk-band", "red")

    window.matchMedia = defaultMatchMedia
  })
})
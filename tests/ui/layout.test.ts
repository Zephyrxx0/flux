import React from "react"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import App from "../../src/App"
import { useScenarioStore } from "../../src/hooks/useScenarioStore"
import { simulationOutputFixture } from "./fixtures/simulationOutput"

const originalMatchMedia = window.matchMedia
const originalScrollIntoView = Element.prototype.scrollIntoView

describe("AppLayout", () => {
  afterEach(() => {
    cleanup()
    window.matchMedia = originalMatchMedia
    Element.prototype.scrollIntoView = originalScrollIntoView
  })

  beforeEach(() => {
    useScenarioStore.setState({
      latestSimulationOutput: null,
    })

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  it("renders a persistent sidebar container", () => {
    render(React.createElement(App))

    expect(screen.getByTestId("app-layout")).toBeInTheDocument()
    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument()
    expect(screen.getByTestId("app-main-content")).toBeInTheDocument()
  })

  it("mounts visualization workspace components in main content", () => {
    useScenarioStore.setState({
      latestSimulationOutput: simulationOutputFixture,
    })

    render(React.createElement(App))

    expect(screen.getByTestId("visualization-workspace")).toBeInTheDocument()
    expect(screen.getByTestId("risk-line-chart")).toBeInTheDocument()
    expect(screen.getByTestId("stadium-heatmap")).toBeInTheDocument()
    expect(screen.getByTestId("risk-legend")).toBeInTheDocument()
  })

  it("shows workspace empty state when no simulation output is available", () => {
    render(React.createElement(App))

    expect(screen.getByTestId("visualization-empty-state")).toHaveTextContent("Run a scenario")
  })

  it("renders kino orientation shell while preserving accessibility labels", () => {
    useScenarioStore.setState({
      latestSimulationOutput: simulationOutputFixture,
    })

    render(React.createElement(App))

    expect(screen.getByTestId("workspace-kino-progress")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Visualization Workspace" })).toBeInTheDocument()
  })

  it("uses reduced-motion dock behavior when system preference is enabled", async () => {
    const user = userEvent.setup()
    const scrollSpy = vi.fn()
    Element.prototype.scrollIntoView = scrollSpy

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(React.createElement(App))

    const dock = screen.getByRole("navigation", { name: "Section navigation" })
    expect(dock).toHaveAttribute("data-reduced-motion", "true")

    await user.click(screen.getByRole("button", { name: "Simulate" }))

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "auto", block: "start" })
  })
})
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import * as liveStore from "@/stores/liveStore";

vi.mock("@/stores/liveStore", () => ({
  useLiveStore: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

const makeWeather = (overrides = {}) => ({
  temperature: 22,
  conditions: "Clouds",
  humidity: 65,
  windSpeed: 12,
  impact: "none" as const,
  ...overrides,
});

describe("WeatherCard", () => {
  it("Test 1: renders skeleton loading state when isLoading=true and no weather", () => {
    vi.mocked(liveStore.useLiveStore).mockImplementation((selector: any) =>
      selector({ weather: null })
    );
    const { container } = render(<WeatherCard isLoading={true} />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("Test 2: renders TriangleAlert + error message when error and no data", () => {
    vi.mocked(liveStore.useLiveStore).mockImplementation((selector: any) =>
      selector({ weather: null })
    );
    render(<WeatherCard error="Weather data unavailable — retrying..." />);
    expect(
      screen.getByText("Weather data unavailable — retrying...")
    ).toBeInTheDocument();
    // Should not show temperature
    expect(screen.queryByText(/°C/)).not.toBeInTheDocument();
  });

  it("Test 3: renders no-impact state with Sun icon label, temperature, and 'No Impact' badge", () => {
    vi.mocked(liveStore.useLiveStore).mockImplementation((selector: any) =>
      selector({ weather: makeWeather({ conditions: "Clear", impact: "none" }) })
    );
    render(<WeatherCard />);
    expect(screen.getByText("22°C")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
    expect(screen.getByText("No Impact")).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
  });

  it("Test 4: renders rain impact with 'Rain' chip and impact note", () => {
    vi.mocked(liveStore.useLiveStore).mockImplementation((selector: any) =>
      selector({ weather: makeWeather({ conditions: "Rain", impact: "rain" }) })
    );
    render(<WeatherCard />);
    // "Rain" appears in both conditions span and badge chip
    const rainElements = screen.getAllByText("Rain");
    expect(rainElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Rain: Gate throughput -15%")).toBeInTheDocument();
  });

  it("Test 5: renders heat impact with 'Heat' chip and impact note", () => {
    vi.mocked(liveStore.useLiveStore).mockImplementation((selector: any) =>
      selector({
        weather: makeWeather({ conditions: "Clear", impact: "heat", temperature: 38 }),
      })
    );
    render(<WeatherCard />);
    expect(screen.getByText("Heat")).toBeInTheDocument();
    expect(screen.getByText("Heat: Zone capacity -15%")).toBeInTheDocument();
  });

  it("Test 6: renders storm impact with 'Storm' chip and impact note", () => {
    vi.mocked(liveStore.useLiveStore).mockImplementation((selector: any) =>
      selector({
        weather: makeWeather({ conditions: "Thunderstorm", impact: "storm" }),
      })
    );
    render(<WeatherCard />);
    expect(screen.getByText("Storm")).toBeInTheDocument();
    expect(
      screen.getByText("Storm: Throughput & capacity -25%")
    ).toBeInTheDocument();
  });

  it("Test 7: renders loaded card + amber warning bar when error with prior data", () => {
    vi.mocked(liveStore.useLiveStore).mockImplementation((selector: any) =>
      selector({ weather: makeWeather() })
    );
    render(<WeatherCard error="Stale data — connection lost" />);
    expect(screen.getByText("Stale data — connection lost")).toBeInTheDocument();
    // Also shows weather data (not purely error state)
    expect(screen.getByText("22°C")).toBeInTheDocument();
  });

  it("Test 8: loading skeleton takes priority when both isLoading and error are true (no data)", () => {
    vi.mocked(liveStore.useLiveStore).mockImplementation((selector: any) =>
      selector({ weather: null })
    );
    const { container } = render(
      <WeatherCard isLoading={true} error="Something went wrong" />
    );
    // Should render loading skeleton, not TriangleAlert error
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("Test 9: renders 'No weather data available' placeholder when no weather/loading/error", () => {
    vi.mocked(liveStore.useLiveStore).mockImplementation((selector: any) =>
      selector({ weather: null })
    );
    render(<WeatherCard />);
    expect(screen.getByText("No weather data available")).toBeInTheDocument();
  });
});

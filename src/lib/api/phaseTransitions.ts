import type { SimulationInput } from "@/simulation/contracts/input.schema";

export type TransitionEvent = "goal" | "halftime" | "full-time" | "second-half-start" | "kickoff";

export function applyPhaseTransitionDeltas(
  base: SimulationInput,
  eventType: TransitionEvent,
  zoneDeltas?: { zoneId: string; deltaPercent: number }[]
): SimulationInput {
  if (eventType === "goal" && zoneDeltas && zoneDeltas.length > 0) {
    return {
      ...base,
      arrivals: base.arrivals.map((arrival) => {
        const delta = zoneDeltas.find((zd) => zd.zoneId === arrival.zoneId);
        if (delta) {
          return {
            ...arrival,
            demandFans: Math.round(arrival.demandFans * (1 + delta.deltaPercent / 100)),
          };
        }
        return arrival;
      }),
    };
  }

  if (eventType === "halftime") {
    // Halftime reduces all zone capacities by 10%
    return {
      ...base,
      zones: base.zones.map((zone) => ({
        ...zone,
        capacity: Math.round(zone.capacity * 0.9),
      })),
    };
  }

  if (eventType === "full-time") {
    // Full-time reduces all demandFans by 80%
    return {
      ...base,
      arrivals: base.arrivals.map((arrival) => ({
        ...arrival,
        demandFans: Math.round(arrival.demandFans * 0.2),
      })),
    };
  }

  return base;
}

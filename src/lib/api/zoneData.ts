import { presets } from "@/simulation/presets";
import { simulateDeterministic } from "@/simulation/core/simulateDeterministic";
import type { MatchState } from "@/types/match";

type ZoneEntry = { id: string; name: string; occupancy: number; capacity: number; occupancyRatio: number };

// Module-level cache — the deterministic simulation output is pure/stable for a given preset,
// so we only need to compute it once per server process rather than on every API request.
let _zoneDataCache: ZoneEntry[] | null = null;

export function getZoneData(): ZoneEntry[] {
  if (_zoneDataCache) return _zoneDataCache;

  const input = presets.normal;
  const output = simulateDeterministic(input);
  const zoneCapacities = new Map(input.zones.map((z) => [z.id, z.capacity]));

  _zoneDataCache = Array.from(
    output.phaseZoneMatrix
      .reduce((acc, row) => {
        if (!acc.has(row.zoneId) || row.occupancyFans > acc.get(row.zoneId)!.occupancy) {
          acc.set(row.zoneId, {
            id: row.zoneId,
            name: row.zoneId,
            occupancy: row.occupancyFans,
            capacity: zoneCapacities.get(row.zoneId) ?? 0,
            occupancyRatio: row.occupancyRatio,
          });
        }
        return acc;
      }, new Map<string, ZoneEntry>())
      .values()
  );

  return _zoneDataCache;
}

/** Exposed for tests that need to invalidate the cache between runs */
export function _resetZoneDataCache() {
  _zoneDataCache = null;
}


export function extractMatchState(searchParams: URLSearchParams): MatchState {
  const minuteParam = searchParams.get("minute");
  return {
    minute: minuteParam ? parseInt(minuteParam, 10) : null,
    phase: (searchParams.get("phase") as MatchState["phase"]) ?? "first-half",
    score: searchParams.get("score") ?? "0-0",
    homeTeam: searchParams.get("homeTeam") ?? "Home",
    awayTeam: searchParams.get("awayTeam") ?? "Away",
  };
}

"use client";

import { useEffect, useRef } from "react";
import { liveStore } from "@/stores/liveStore";
import { applyPhaseTransitionDeltas } from "@/lib/api/phaseTransitions";
import type { DemoEvent } from "@/types/demo";
import { presets } from "@/simulation/presets";

export function usePhaseTransitionWatcher(currentDemoEvent?: DemoEvent | null) {
  const previousPhaseRef = useRef<string | null>(null);
  const previousScoreRef = useRef<string | null>(null);
  const currentDemoEventRef = useRef(currentDemoEvent);

  useEffect(() => {
    currentDemoEventRef.current = currentDemoEvent;
  }, [currentDemoEvent]);

  useEffect(() => {
    const unsubPhase = liveStore.subscribe(
      (state) => state.match?.phase ?? null,
      (phase) => {
        if (!previousPhaseRef.current) {
          previousPhaseRef.current = phase;
          return;
        }

        if (phase && previousPhaseRef.current && phase !== previousPhaseRef.current) {
          if (currentDemoEventRef.current?.zoneDeltas) {
            previousPhaseRef.current = phase;
            return;
          }

          let eventType: string;
          if (phase === "half-time") eventType = "halftime";
          else if (phase === "full-time") eventType = "full-time";
          else if (previousPhaseRef.current === "first-half" && phase === "second-half") eventType = "second-half-start";
          else {
            previousPhaseRef.current = phase;
            return;
          }

          const state = liveStore.getState();
          const baseInput = state.v1ZoneData ?? presets.normal;
          const adjusted = applyPhaseTransitionDeltas(baseInput, eventType);
          state.initializeSim(adjusted);

          previousPhaseRef.current = phase;
        }
      }
    );

    const unsubScore = liveStore.subscribe(
      (state) => state.match?.score ?? null,
      (score) => {
        if (!previousScoreRef.current) {
          previousScoreRef.current = score;
          return;
        }

        if (score && previousScoreRef.current && score !== previousScoreRef.current) {
          if (currentDemoEventRef.current?.zoneDeltas) {
            previousScoreRef.current = score;
            return;
          }

          const state = liveStore.getState();
          const baseInput = state.v1ZoneData ?? presets.normal;
          const adjusted = applyPhaseTransitionDeltas(baseInput, "goal", [
            { zoneId: "north", deltaPercent: 20 },
            { zoneId: "south", deltaPercent: 20 },
            { zoneId: "east", deltaPercent: 20 },
          ]);
          state.initializeSim(adjusted);

          previousScoreRef.current = score;
        }
      }
    );

    return () => {
      unsubPhase();
      unsubScore();
    };
  }, []);
}

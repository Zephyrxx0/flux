"use client";

import { useEffect, useRef } from "react";
import { liveStore } from "@/stores/liveStore";
import { applyPhaseTransitionDeltas, type TransitionEvent } from "@/lib/api/phaseTransitions";
import type { DemoEvent } from "@/types/demo";
import { presets } from "@/simulation/presets";

function resolvePhaseEvent(from: string, to: string): TransitionEvent | null {
  if (to === "half-time") return "halftime";
  if (to === "full-time") return "full-time";
  if (from === "first-half" && to === "second-half") return "second-half-start";
  return null;
}

export function usePhaseTransitionWatcher(currentDemoEvent?: DemoEvent | null) {
  const previousPhaseRef = useRef<string | null>(null);
  const previousScoreRef = useRef<string | null>(null);
  const currentDemoEventRef = useRef(currentDemoEvent);

  useEffect(() => {
    currentDemoEventRef.current = currentDemoEvent;
  }, [currentDemoEvent]);

  useEffect(() => {
    const unsubPhase = liveStore.subscribe(
      (state, prevState) => {
        const phase = state.match?.phase ?? null;
        const prevPhase = prevState.match?.phase ?? null;
        
        if (phase !== prevPhase) {
          if (!previousPhaseRef.current) {
            previousPhaseRef.current = phase;
            return;
          }

          if (phase && previousPhaseRef.current && phase !== previousPhaseRef.current) {
            if (currentDemoEventRef.current?.zoneDeltas) {
              previousPhaseRef.current = phase;
              return;
            }

            const eventType = resolvePhaseEvent(previousPhaseRef.current, phase);
            previousPhaseRef.current = phase;
            if (!eventType) {
              return;
            }

            const currentState = liveStore.getState();
            const baseInput = currentState.simConfig ?? presets.normal;
            const adjusted = applyPhaseTransitionDeltas(baseInput, eventType);
            currentState.initializeSim(adjusted);
          }
        }
      }
    );

    const unsubScore = liveStore.subscribe(
      (state, prevState) => {
        const score = state.match?.score ?? null;
        const prevScore = prevState.match?.score ?? null;
        
        if (score !== prevScore) {
          if (!previousScoreRef.current) {
            previousScoreRef.current = score;
            return;
          }

          if (score && previousScoreRef.current && score !== previousScoreRef.current) {
            if (currentDemoEventRef.current?.zoneDeltas) {
              previousScoreRef.current = score;
              return;
            }

            const currentState = liveStore.getState();
            const baseInput = currentState.simConfig ?? presets.normal;
            const adjusted = applyPhaseTransitionDeltas(baseInput, "goal", [
              { zoneId: "north", deltaPercent: 20 },
              { zoneId: "south", deltaPercent: 20 },
              { zoneId: "east", deltaPercent: 20 },
            ]);
            currentState.initializeSim(adjusted);

            previousScoreRef.current = score;
          }
        }
      }
    );

    return () => {
      unsubPhase();
      unsubScore();
    };
  }, []);
}

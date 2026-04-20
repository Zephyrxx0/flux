import { animate } from "animejs"
import { useEffect, useRef } from "react"

import type { LatestZoneRisk } from "@/visualization/selectors/buildVisualizationModel"
import {
  PREFERS_REDUCED_MOTION,
  VISUALIZATION_EASE,
  VISUALIZATION_TRANSITION_MS,
} from "@/visualization/contracts/motionPolicy"
import { riskBandFromRatio, RISK_LEGEND } from "@/visualization/contracts/riskEncoding"
import { STADIUM_ZONE_POLYGONS } from "@/visualization/contracts/stadiumPolygons"

type StadiumHeatmapProps = {
  latestZoneRisk: Record<string, LatestZoneRisk>
}

const NO_DATA_FILL = "#cbd5e1"

function colorForBand(band: "green" | "amber" | "red") {
  return RISK_LEGEND.find((entry) => entry.band === band)?.color ?? NO_DATA_FILL
}

export function StadiumHeatmap({ latestZoneRisk }: StadiumHeatmapProps) {
  const polygonRefs = useRef(new Map<string, SVGPolygonElement>())
  const reducedMotion = PREFERS_REDUCED_MOTION()
  const polygonZoneIds = Object.keys(STADIUM_ZONE_POLYGONS)
  const unmappedZones = Object.keys(latestZoneRisk)
    .filter((zoneId) => !STADIUM_ZONE_POLYGONS[zoneId])
    .sort((left, right) => left.localeCompare(right))

  useEffect(() => {
    const duration = reducedMotion ? 0 : VISUALIZATION_TRANSITION_MS

    for (const zoneId of polygonZoneIds) {
      const node = polygonRefs.current.get(zoneId)
      if (!node) {
        continue
      }

      const isNoData = !latestZoneRisk[zoneId]
      if (reducedMotion) {
        node.style.opacity = isNoData ? "0.78" : "1"
        node.style.strokeWidth = isNoData ? "1.5" : "2"
        node.style.transitionDuration = "0ms"
        continue
      }

      node.style.transitionDuration = `${duration}ms`
      animate(node, {
        opacity: [0.45, isNoData ? 0.78 : 1],
        strokeWidth: [1, isNoData ? 1.5 : 2],
        duration,
        ease: VISUALIZATION_EASE,
      })
    }
  }, [latestZoneRisk, polygonZoneIds, reducedMotion])

  return (
    <section className="space-y-3" data-testid="stadium-heatmap">
      <h3 className="text-base font-semibold text-slate-900">Stadium Risk Heatmap</h3>

      <svg
        viewBox="0 0 600 380"
        role="img"
        aria-label="Stadium silhouette heatmap"
        data-testid="stadium-heatmap-svg"
        data-transition-ms={VISUALIZATION_TRANSITION_MS}
        data-reduced-motion={String(reducedMotion)}
      >
        <rect x="10" y="40" width="580" height="330" rx="36" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        {polygonZoneIds.map((zoneId) => {
          const polygon = STADIUM_ZONE_POLYGONS[zoneId]
          const latest = latestZoneRisk[zoneId]

          if (!latest) {
            return (
              <polygon
                key={zoneId}
                points={polygon}
                fill={NO_DATA_FILL}
                stroke="#94a3b8"
                strokeWidth="2"
                data-testid={`heatmap-zone-${zoneId}`}
                data-zone-id={zoneId}
                data-risk-band="no-data"
                ref={(node) => {
                  if (node) {
                    polygonRefs.current.set(zoneId, node)
                  } else {
                    polygonRefs.current.delete(zoneId)
                  }
                }}
              />
            )
          }

          const riskBand = riskBandFromRatio(latest.occupancyRatio)
          return (
            <polygon
              key={zoneId}
              points={polygon}
              fill={colorForBand(riskBand)}
              stroke="#0f172a"
              strokeWidth="2"
              data-testid={`heatmap-zone-${zoneId}`}
              data-zone-id={zoneId}
              data-risk-band={riskBand}
              ref={(node) => {
                if (node) {
                  polygonRefs.current.set(zoneId, node)
                } else {
                  polygonRefs.current.delete(zoneId)
                }
              }}
            />
          )
        })}
      </svg>

      <p className="text-xs text-slate-500">Grey regions indicate no current simulation data for that zone.</p>

      <div data-testid="heatmap-unmapped-zones" className="text-xs text-slate-600" aria-live="polite">
        {unmappedZones.length > 0 ? `Unmapped zones: ${unmappedZones.join(", ")}` : "All zones are mapped to the stadium silhouette."}
      </div>
    </section>
  )
}
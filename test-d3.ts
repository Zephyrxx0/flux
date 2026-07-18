import { scaleLinear, scalePoint, line } from "d3"
import { presets } from "./src/simulation/presets"
import { StadiumSim } from "./src/simulation/adapters/StadiumSim"
import { buildVisualizationModel } from "./src/visualization/selectors/buildVisualizationModel"
import { SimulationInputSchema } from "./src/simulation/contracts/input.schema"

const input = SimulationInputSchema.parse(presets.crisis)
const output = StadiumSim.run(input)
const model = buildVisualizationModel(output)

const CHART_SIZE = {
  width: 500,
  height: 500,
  marginTop: 24,
  marginRight: 20,
  marginBottom: 48,
  marginLeft: 52,
}

const allZoneIds = Object.keys(model.zoneSeries)
const topZoneIds = model.topZoneIds.slice(0, 5)

const xScale = scalePoint<string>()
  .domain(model.phaseOrder)
  .range([
    CHART_SIZE.marginLeft,
    CHART_SIZE.width - CHART_SIZE.marginRight,
  ])

let max = 1.0
for (const zone of topZoneIds) {
  const points = model.zoneSeries[zone]?.points || []
  for (const pt of points) {
    if (pt.occupancyRatio > max) {
      max = pt.occupancyRatio
    }
  }
}
const maxY = Math.ceil(max * 2) / 2

const yScale = scaleLinear()
  .domain([0, maxY])
  .range([
    CHART_SIZE.height - CHART_SIZE.marginBottom,
    CHART_SIZE.marginTop,
  ])

const lineBuilder = line<{ phaseId: string; occupancyRatio: number }>()
  .x((point) => xScale(point.phaseId) ?? CHART_SIZE.marginLeft)
  .y((point) => yScale(point.occupancyRatio))

for (const zoneId of topZoneIds) {
  const series = model.zoneSeries[zoneId]
  const path = lineBuilder(series.points)
  console.log(`Zone: ${zoneId}`)
  console.log(`Points:`, series.points.map(p => ({ phaseId: p.phaseId, occupancyRatio: p.occupancyRatio })))
  console.log(`Path: ${path}\n`)
}

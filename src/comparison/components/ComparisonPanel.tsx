import { useMemo } from "react"

import { SensitivityNarrative } from "@/comparison/components/SensitivityNarrative"
import { useComparisonStore } from "@/hooks/useComparisonStore"
import { useRiskReportStore } from "@/hooks/useRiskReportStore"
import { buildComparisonViewModel } from "@/comparison/selectors/buildComparisonViewModel"
import { ExportActions } from "@/export/components/ExportActions"

export function ComparisonPanel() {
  const runHistory = useComparisonStore((state) => state.runHistory)
  const baselineRunId = useComparisonStore((state) => state.baselineRunId)
  const candidateRunId = useComparisonStore((state) => state.candidateRunId)
  const selectBaselineRun = useComparisonStore((state) => state.selectBaselineRun)
  const selectCandidateRun = useComparisonStore((state) => state.selectCandidateRun)
  const report = useRiskReportStore((state) => state.report)

  const baseline = useMemo(() => runHistory.find((run) => run.id === baselineRunId) ?? null, [runHistory, baselineRunId])
  const candidate = useMemo(() => runHistory.find((run) => run.id === candidateRunId) ?? null, [runHistory, candidateRunId])
  const model = useMemo(() => buildComparisonViewModel(baseline, candidate), [baseline, candidate])

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4" data-testid="comparison-panel">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Scenario Comparison</h2>
        <p className="text-sm text-slate-600">Select baseline and candidate runs to quantify intervention impact.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-xs text-slate-600">
          <span className="font-medium">Baseline run</span>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={baselineRunId ?? ""}
            onChange={(event) => selectBaselineRun(event.target.value || null)}
          >
            <option value="">Select baseline</option>
            {runHistory.map((run) => (
              <option key={run.id} value={run.id}>
                {run.scenarioLabel} | {new Date(run.createdAt).toLocaleTimeString()} | {run.runDeterministicHash}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-xs text-slate-600">
          <span className="font-medium">Candidate run</span>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={candidateRunId ?? ""}
            onChange={(event) => selectCandidateRun(event.target.value || null)}
          >
            <option value="">Select candidate</option>
            {runHistory.map((run) => (
              <option key={run.id} value={run.id}>
                {run.scenarioLabel} | {new Date(run.createdAt).toLocaleTimeString()} | {run.runDeterministicHash}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!model ? (
        <p className="text-xs text-slate-600" data-testid="comparison-empty-state">
          Run and select two different simulations to see top-zone deltas.
        </p>
      ) : (
        <div className="space-y-2" data-testid="comparison-results">
          <p className="text-xs text-slate-700">
            Overall peak change: {(model.overall.baselinePeakRatio * 100).toFixed(1)}% {"->"} {(model.overall.candidatePeakRatio * 100).toFixed(1)}%
            {' '}({model.overall.absoluteDelta >= 0 ? "+" : ""}{(model.overall.absoluteDelta * 100).toFixed(1)} pts, {model.overall.percentDelta >= 0 ? "+" : ""}{model.overall.percentDelta.toFixed(1)}%)
          </p>
          <ul className="space-y-1 text-xs text-slate-700">
            {model.topZoneDeltas.map((zone) => (
              <li key={zone.zoneId}>
                <strong>{zone.zoneId}</strong>: {(zone.baselinePeakRatio * 100).toFixed(1)}% {"->"} {(zone.candidatePeakRatio * 100).toFixed(1)}%
                {' '}({zone.absoluteDelta >= 0 ? "+" : ""}{(zone.absoluteDelta * 100).toFixed(1)} pts, {zone.percentDelta >= 0 ? "+" : ""}{zone.percentDelta.toFixed(1)}%)
                {' '}| {zone.severityTransition}
              </li>
            ))}
          </ul>
          <SensitivityNarrative model={model} />
          <ExportActions model={model} report={report} />
        </div>
      )}
    </section>
  )
}

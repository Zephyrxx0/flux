import type { RiskReport } from "@/reporting"

type ReportSectionsProps = {
  report: RiskReport
}

export function ReportSections({ report }: ReportSectionsProps) {
  return (
    <div className="space-y-4" data-testid="risk-report-sections">
      <section className="space-y-1" aria-label="overall-risk">
        <h3 className="text-sm font-semibold text-slate-900">Overall Risk</h3>
        <p className="text-sm text-slate-700">
          {report.overall.riskLevel.toUpperCase()} ({Math.round(report.overall.confidence * 100)}% confidence)
        </p>
        <p className="text-xs text-slate-600">{report.overall.rationale}</p>
      </section>

      <section className="space-y-1" aria-label="critical-zones">
        <h3 className="text-sm font-semibold text-slate-900">Critical Zones</h3>
        <ul className="space-y-1 text-xs text-slate-700">
          {report.criticalZones.map((zone) => (
            <li key={`${zone.zoneId}-${zone.phaseId}`}>
              <strong>{zone.zoneId}</strong> in {zone.phaseId} at {(zone.peakOccupancyRatio * 100).toFixed(1)}% - {zone.recommendedAction}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-1" aria-label="staffing-recommendations">
        <h3 className="text-sm font-semibold text-slate-900">Staffing Recommendations</h3>
        <ul className="space-y-1 text-xs text-slate-700">
          {report.staffingRecommendations.map((item) => (
            <li key={`${item.zoneId}-${item.phaseId}-${item.priority}`}>
              <strong>{item.priority.toUpperCase()}</strong>: {item.action} ({item.expectedImpact})
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-1" aria-label="assumptions-limitations">
        <h3 className="text-sm font-semibold text-slate-900">Assumptions and Limitations</h3>
        <ul className="space-y-1 text-xs text-slate-700">
          {report.assumptionsLimitations.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-1" aria-label="evidence-block">
        <h3 className="text-sm font-semibold text-slate-900">Evidence</h3>
        <p className="text-xs text-slate-700">Run hash: {report.evidence.runDeterministicHash}</p>
        <p className="text-xs text-slate-700">Rows analyzed: {report.evidence.rowsAnalyzed}</p>
      </section>

      <section className="space-y-1" aria-label="executive-summary">
        <h3 className="text-sm font-semibold text-slate-900">Executive Summary</h3>
        <p className="text-xs text-slate-700">{report.executiveSummary}</p>
      </section>
    </div>
  )
}

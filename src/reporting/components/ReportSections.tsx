import type { RiskReport } from "@/reporting"

type ReportSectionsProps = {
  report: RiskReport
}

export function ReportSections({ report }: ReportSectionsProps) {
  return (
    <div className="space-y-6" data-testid="risk-report-sections">
      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-black/40 p-4 rounded-lg border border-white/10 space-y-2" aria-label="overall-risk">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Overall Risk</h3>
          <p className="text-lg font-mono text-white">
            <span className={(report.overall.riskLevel === 'red' || report.overall.riskLevel === 'critical') ? "text-red-400" : report.overall.riskLevel === 'amber' ? "text-yellow-400" : "text-green-400"}>
              {report.overall.riskLevel.toUpperCase()}
            </span> 
            <span className="text-muted-foreground text-sm ml-2">({Math.round(report.overall.confidence * 100)}% confidence)</span>
          </p>
          <p className="text-sm text-foreground/80">{report.overall.rationale}</p>
        </section>

        <section className="bg-black/40 p-4 rounded-lg border border-white/10 space-y-2" aria-label="executive-summary">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Executive Summary</h3>
          <p className="text-sm text-foreground/80">{report.executiveSummary}</p>
        </section>
      </div>

      <section className="space-y-2" aria-label="critical-zones">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Critical Zones</h3>
        <ul className="space-y-2 text-sm text-foreground/80">
          {report.criticalZones.map((zone) => (
            <li key={`${zone.zoneId}-${zone.phaseId}`} className="bg-black/40 p-3 rounded-lg border border-white/5 flex flex-col md:flex-row md:items-center gap-2">
              <div><strong className="text-primary uppercase">{zone.zoneId}</strong> in <span className="text-white">{zone.phaseId}</span></div>
              <div className="text-red-400 font-mono">{(zone.peakOccupancyRatio * 100).toFixed(1)}%</div>
              <div className="hidden md:block text-white/20">|</div>
              <div className="text-foreground/60">{zone.recommendedAction}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2" aria-label="staffing-recommendations">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Staffing Recommendations</h3>
        <ul className="space-y-2 text-sm text-foreground/80">
          {report.staffingRecommendations.map((item) => (
            <li key={`${item.zoneId}-${item.phaseId}-${item.priority}`} className="bg-black/40 p-3 rounded-lg border border-white/5 flex flex-col md:flex-row gap-2">
              <strong className={item.priority === 'high' ? 'text-red-400 uppercase' : item.priority === 'medium' ? 'text-yellow-400 uppercase' : 'text-green-400 uppercase'}>{item.priority}</strong>
              <div className="hidden md:block text-white/20">|</div>
              <span className="text-white">{item.action}</span>
              <span className="text-muted-foreground italic">({item.expectedImpact})</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2" aria-label="assumptions-limitations">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Assumptions and Limitations</h3>
        <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
          {report.assumptionsLimitations.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2 border-t border-white/10 pt-4" aria-label="evidence-block">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Evidence</h3>
        <div className="flex gap-4">
          <p className="text-xs font-mono text-muted-foreground bg-black/40 px-2 py-1 rounded">Run hash: <span className="text-white">{report.evidence.runDeterministicHash}</span></p>
          <p className="text-xs font-mono text-muted-foreground bg-black/40 px-2 py-1 rounded">Rows analyzed: <span className="text-white">{report.evidence.rowsAnalyzed}</span></p>
        </div>
      </section>
    </div>
  )
}

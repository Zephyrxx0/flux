import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRiskReportStore } from "@/hooks/useRiskReportStore"
import { ReportSections } from "./ReportSections"

export function RiskReportPanel() {
  const status = useRiskReportStore((state) => state.status)
  const report = useRiskReportStore((state) => state.report)
  const errorMessage = useRiskReportStore((state) => state.errorMessage)
  const retryReportGeneration = useRiskReportStore((state) => state.retryReportGeneration)

  return (
    <section className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-xl relative overflow-hidden" data-testid="risk-report-panel">
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-bold tracking-widest uppercase text-foreground">Risk Report</h2>
        <p className="text-sm text-muted-foreground mt-2">Structured AI report with deterministic fallback resilience.</p>
      </div>

      {status === "idle" && !report ? (
        <Alert data-testid="report-idle-state" className="bg-muted border-border text-foreground">
          <AlertTitle>Run a scenario to generate risk reporting</AlertTitle>
          <AlertDescription className="text-muted-foreground">Report generation starts automatically after a valid simulation run.</AlertDescription>
        </Alert>
      ) : null}

      {status === "loading" ? (
        <Alert data-testid="report-loading-state" className="bg-primary/20 border-primary/50 text-primary">
          <AlertTitle>Generating report</AlertTitle>
          <AlertDescription className="text-primary/70">Analyzing latest simulation output and validating response schema.</AlertDescription>
        </Alert>
      ) : null}

      {status === "fallback" ? (
        <Alert data-testid="report-fallback-state" className="bg-red-900/20 border-red-500/50 text-red-400">
          <AlertTitle>AI generation failed - deterministic fallback shown</AlertTitle>
          <AlertDescription className="text-red-400/70">{errorMessage ?? "Unknown AI generation error."}</AlertDescription>
        </Alert>
      ) : null}

      {report ? <ReportSections report={report} /> : null}

      {(status === "fallback" || (status === "success" && errorMessage)) ? (
        <div className="flex justify-end pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => void retryReportGeneration()} data-testid="report-retry-button">
            Retry Report Generation
          </Button>
        </div>
      ) : null}
    </section>
  )
}

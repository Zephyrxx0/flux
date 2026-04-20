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
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4" data-testid="risk-report-panel">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Risk Report</h2>
        <p className="text-sm text-slate-600">Structured AI report with deterministic fallback resilience.</p>
      </div>

      {status === "idle" && !report ? (
        <Alert data-testid="report-idle-state">
          <AlertTitle>Run a scenario to generate risk reporting</AlertTitle>
          <AlertDescription>Report generation starts automatically after a valid simulation run.</AlertDescription>
        </Alert>
      ) : null}

      {status === "loading" ? (
        <Alert data-testid="report-loading-state">
          <AlertTitle>Generating report</AlertTitle>
          <AlertDescription>Analyzing latest simulation output and validating response schema.</AlertDescription>
        </Alert>
      ) : null}

      {status === "fallback" ? (
        <Alert data-testid="report-fallback-state" variant="destructive">
          <AlertTitle>AI generation failed - deterministic fallback shown</AlertTitle>
          <AlertDescription>{errorMessage ?? "Unknown AI generation error."}</AlertDescription>
        </Alert>
      ) : null}

      {report ? <ReportSections report={report} /> : null}

      {(status === "fallback" || (status === "success" && errorMessage)) ? (
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => void retryReportGeneration()} data-testid="report-retry-button">
            Retry Report Generation
          </Button>
        </div>
      ) : null}
    </section>
  )
}

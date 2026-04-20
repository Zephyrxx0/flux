import type { ComparisonViewModel } from "@/comparison/selectors/buildComparisonViewModel"
import type { RiskReport } from "@/reporting"
import { buildBriefingExport } from "@/export/buildBriefingExport"
import { renderBriefingHtml } from "@/export/renderBriefingHtml"

type ExportActionsProps = {
  model: ComparisonViewModel
  report: RiskReport | null
}

function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ExportActions({ model, report }: ExportActionsProps) {
  const briefing = buildBriefingExport(model, report)

  return (
    <div className="flex flex-wrap gap-2" data-testid="export-actions">
      <button
        type="button"
        className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700"
        onClick={() => downloadFile(JSON.stringify(briefing, null, 2), "scenario-briefing.json", "application/json")}
      >
        Export JSON
      </button>
      <button
        type="button"
        className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700"
        onClick={() => {
          const html = renderBriefingHtml(briefing)
          const opened = window.open("", "_blank")
          if (!opened) {
            return
          }
          opened.document.write(html)
          opened.document.close()
        }}
      >
        Open Print Summary
      </button>
    </div>
  )
}

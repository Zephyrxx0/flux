import type { ComparisonViewModel } from "@/comparison/selectors/buildComparisonViewModel"
import type { RiskReport } from "@/reporting"
import { buildBriefingExport } from "@/export/buildBriefingExport"
import { renderBriefingHtml } from "@/export/renderBriefingHtml"
import { Download, Printer } from "lucide-react"

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
    <div className="flex flex-wrap gap-3" data-testid="export-actions">
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded bg-[#ff3300] hover:bg-[#e62e00] px-4 py-2 text-sm font-bold text-black transition-colors"
        onClick={() => downloadFile(JSON.stringify(briefing, null, 2), "scenario-briefing.json", "application/json")}
      >
        <Download className="h-4 w-4" />
        Export JSON
      </button>
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded bg-[#ff3300] hover:bg-[#e62e00] px-4 py-2 text-sm font-bold text-black transition-colors"
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
        <Printer className="h-4 w-4" />
        Open Print Summary
      </button>
    </div>
  )
}

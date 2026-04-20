import type { BriefingExport } from "@/export/contracts/briefingExport.schema"

export function renderBriefingHtml(briefing: BriefingExport): string {
  const topChanges = briefing.topChanges
    .map(
      (zone) =>
        `<li><strong>${zone.zoneId}</strong>: ${(zone.baselinePeakRatio * 100).toFixed(1)}% -> ${(zone.candidatePeakRatio * 100).toFixed(
          1,
        )}% (${(zone.absoluteDelta * 100).toFixed(1)} pts, ${zone.percentDelta.toFixed(1)}%), ${zone.severityTransition}</li>`,
    )
    .join("")

  const recommendations = briefing.recommendations.map((item) => `<li>${item}</li>`).join("")
  const assumptions = briefing.assumptionsLimitations.map((item) => `<li>${item}</li>`).join("")

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Scenario Briefing Export</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; margin: 24px; color: #0f172a; }
    h1, h2 { margin: 0 0 8px; }
    p, li { line-height: 1.4; }
    .muted { color: #475569; font-size: 12px; }
    .section { margin-top: 16px; }
  </style>
</head>
<body>
  <h1>Scenario Comparison Briefing</h1>
  <p class="muted">Generated: ${briefing.generatedAt}</p>

  <div class="section">
    <h2>Run Metadata</h2>
    <p>Baseline: ${briefing.metadata.baseline.scenarioLabel} (${briefing.metadata.baseline.runDeterministicHash})</p>
    <p>Candidate: ${briefing.metadata.candidate.scenarioLabel} (${briefing.metadata.candidate.runDeterministicHash})</p>
  </div>

  <div class="section">
    <h2>Overall Change</h2>
    <p>${(briefing.overall.baselinePeakRatio * 100).toFixed(1)}% -> ${(briefing.overall.candidatePeakRatio * 100).toFixed(1)}% (${(
      briefing.overall.absoluteDelta * 100
    ).toFixed(1)} pts, ${briefing.overall.percentDelta.toFixed(1)}%)</p>
  </div>

  <div class="section">
    <h2>Top Zone Changes</h2>
    <ul>${topChanges}</ul>
  </div>

  <div class="section">
    <h2>Action Recommendations</h2>
    <ul>${recommendations}</ul>
  </div>

  <div class="section">
    <h2>Assumptions and Limitations</h2>
    <ul>${assumptions}</ul>
  </div>
</body>
</html>`
}

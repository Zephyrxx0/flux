export type SeverityTier = "green" | "amber" | "red" | "critical"

export function severityFromRatio(occupancyRatio: number): SeverityTier {
  if (occupancyRatio < 0.8) return "green"
  if (occupancyRatio < 1.0) return "amber"
  if (occupancyRatio < 1.2) return "red"
  return "critical"
}

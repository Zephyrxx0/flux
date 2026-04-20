import { Button } from "@/components/ui/button"

type TopZonesToggleProps = {
  showAllZones: boolean
  topCount: number
  totalCount: number
  onShowAllZonesChange: (showAll: boolean) => void
}

export function TopZonesToggle({
  showAllZones,
  topCount,
  totalCount,
  onShowAllZonesChange,
}: TopZonesToggleProps) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Zone visibility scope">
      <Button
        type="button"
        variant={showAllZones ? "outline" : "default"}
        size="sm"
        onClick={() => onShowAllZonesChange(false)}
      >
        Show top {topCount} zones
      </Button>
      <Button
        type="button"
        variant={showAllZones ? "default" : "outline"}
        size="sm"
        onClick={() => onShowAllZonesChange(true)}
      >
        Show all zones ({totalCount})
      </Button>
    </div>
  )
}
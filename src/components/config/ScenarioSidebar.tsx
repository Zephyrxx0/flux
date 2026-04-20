import { ScenarioForm } from "./ScenarioForm"

export function ScenarioSidebar() {
  return (
    <div className="space-y-3" data-testid="scenario-sidebar">
      <h2 className="text-sm font-semibold">Scenario Panel</h2>
      <ScenarioForm />
    </div>
  )
}

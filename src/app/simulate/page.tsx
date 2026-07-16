import { VisualizationWorkspace } from "@/visualization/components/VisualizationWorkspace"
import { ScenarioSidebar } from "@/components/config/ScenarioSidebar"
import { PresetsToolbar } from "@/components/config/PresetsToolbar"

export default function SimulatePage() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 md:px-8 pb-24">
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <section id="simulate" className="flex-1 w-full max-w-sm rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden" data-route-surface="simulate">
          <div className="absolute inset-0 z-[-1] opacity-30 dot-grid pointer-events-none" />
          <div className="mb-6 border-b border-white/10 pb-6">
            <h2 className="text-xl font-bold tracking-widest text-primary uppercase">Scenario Config</h2>
            <p className="text-sm text-foreground/60 mt-2 mb-5">
              Configure and run scenarios to drive visualization.
            </p>
            <PresetsToolbar />
          </div>
          <div className="space-y-4">
            <div className="text-sm">
              <ScenarioSidebar />
            </div>
          </div>
        </section>

        <section className="flex-[3] w-full min-w-0" data-testid="app-main-content">
          <VisualizationWorkspace activeTab="simulate" />
        </section>
      </div>
    </main>
  )
}

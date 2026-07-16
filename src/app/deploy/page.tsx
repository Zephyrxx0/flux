export default function DeployPage() {
  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto py-6 px-4">
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 z-[-1] opacity-20 dot-grid pointer-events-none" />
        <h2 className="text-xl font-bold tracking-tight text-white uppercase mb-4">Deployment Surface</h2>
        <p>
          This flow is deployment-ready for Cloud Run static hosting. Use the deployment runbook to publish the latest build while preserving
          deterministic simulation behavior.
        </p>
      </div>
    </div>
  );
}

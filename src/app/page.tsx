import { CTASection } from "@/components/ui/hero-card"
import ThreeStadium from "@/components/three-stadium"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <CTASection />
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-6">
        <ThreeStadium />
      </section>
    </main>
  )
}

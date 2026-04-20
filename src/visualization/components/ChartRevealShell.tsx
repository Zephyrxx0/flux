import type { ReactNode } from "react"
import { Kino, Reveal, Scene } from "react-kino"

type ChartRevealShellProps = {
  label: string
  children: ReactNode
  className?: string
}

export function ChartRevealShell({ label, children, className }: ChartRevealShellProps) {
  return (
    <section className={className} aria-label={label} data-testid="chart-reveal-shell">
      <Kino>
        <Scene duration="160vh" pin={false}>
          <Reveal animation="fade-up" at={0} progress={1} duration={180}>
            {children}
          </Reveal>
        </Scene>
      </Kino>
    </section>
  )
}
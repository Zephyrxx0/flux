import type { ReactNode } from "react"
import { Kino, Progress, Reveal, Scene } from "react-kino"
import { PREFERS_REDUCED_MOTION } from "@/visualization/contracts/motionPolicy"

type WorkspaceKinoProgressProps = {
  children: ReactNode
}

export function WorkspaceKinoProgress({ children }: WorkspaceKinoProgressProps) {
  const reducedMotion = PREFERS_REDUCED_MOTION()

  if (reducedMotion) {
    return (
      <section
        data-testid="workspace-kino-progress"
        data-reduced-motion="true"
        aria-label="Visualization workspace progress shell"
        className="space-y-4"
      >
        <div>{children}</div>
      </section>
    )
  }

  return (
    <section
      data-testid="workspace-kino-progress"
      data-reduced-motion="false"
      aria-label="Visualization workspace progress shell"
      className="space-y-4"
    >
      <Kino>
        <Progress type="dots" position="top" color="#0f172a" progress={1} dotCount={3} />
        <Scene duration="120vh" pin={false}>
          <Reveal animation="fade-up" at={0} progress={1} duration={180}>
            <div>{children}</div>
          </Reveal>
        </Scene>
      </Kino>
    </section>
  )
}
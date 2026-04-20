export const VISUALIZATION_TRANSITION_MS = 200
export const VISUALIZATION_EASE = "easeOutCubic"

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

export const PREFERS_REDUCED_MOTION = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false
  }

  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

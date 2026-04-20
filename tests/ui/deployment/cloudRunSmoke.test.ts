import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

describe("cloud run smoke", () => {
  it("defines nginx SPA fallback and health endpoint", () => {
    const nginx = readFileSync(resolve(process.cwd(), "nginx.conf"), "utf8")

    expect(nginx).toContain("try_files $uri $uri/ /index.html")
    expect(nginx).toContain("location /healthz")
    expect(nginx).toContain("listen 8080")
  })

  it("defines a two-stage Dockerfile for static build and nginx runtime", () => {
    const dockerfile = readFileSync(resolve(process.cwd(), "Dockerfile"), "utf8")

    expect(dockerfile).toContain("FROM node")
    expect(dockerfile).toContain("npm run build")
    expect(dockerfile).toContain("FROM nginx")
    expect(dockerfile).toContain("EXPOSE 8080")
  })

  it("documents deployment acceptance criteria", () => {
    const runbook = readFileSync(resolve(process.cwd(), "docs/deployment/cloud-run.md"), "utf8")

    expect(runbook).toContain("run.app URL")
    expect(runbook).toContain("SPA route refresh")
    expect(runbook).toContain("run -> compare -> export")
  })
})

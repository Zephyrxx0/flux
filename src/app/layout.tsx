import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

export const metadata: Metadata = {
  title: "Predictive Fan Flow Simulator",
  description: "Scenario-driven crowd risk simulation and planning",
}

import { MagneticDock } from "@/components/layout/MagneticDock"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <MagneticDock />
        </ThemeProvider>
      </body>
    </html>
  )
}

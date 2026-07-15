"use client";

import { MatchBanner } from "@/components/dashboard/MatchBanner";
import { WeatherCard } from "@/components/dashboard/WeatherCard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="w-full px-4 pt-4 md:px-6 md:pt-6 space-y-3">
        <MatchBanner />
        <WeatherCard />
      </header>
      <main className="flex-1 px-4 pb-6 md:px-6">
        {children}
      </main>
    </div>
  );
}


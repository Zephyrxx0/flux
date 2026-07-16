"use client";

import { ComparisonPanel } from "@/comparison/components/ComparisonPanel";

export default function ComparePage() {
  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto py-6 px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <ComparisonPanel />
    </div>
  );
}

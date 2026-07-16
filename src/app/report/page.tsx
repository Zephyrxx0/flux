"use client";

import { RiskReportPanel } from "@/reporting/components/RiskReportPanel";

export default function ReportPage() {
  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto py-6 px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <RiskReportPanel />
    </div>
  );
}

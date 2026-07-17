"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ChatResponse } from "@/types/chat";

interface StreamingContentProps {
  text: string;
  structured?: ChatResponse | null;
}

export function StreamingContent({ text, structured }: StreamingContentProps) {
  return (
    <div className="space-y-3">
      {text && (
        <p className="text-[15px] font-normal leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
          {text}
        </p>
      )}

      {structured?.suggestedGate && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Gate {structured.suggestedGate}</span>
              {structured.walkingTime && (
                <Badge variant="secondary">{structured.walkingTime} walk</Badge>
              )}
            </div>
            {structured.zoneInfo && (
              <Badge variant="outline">
                {structured.zoneInfo.name} — {Math.round(structured.zoneInfo.occupancyRatio * 100)}% full
              </Badge>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

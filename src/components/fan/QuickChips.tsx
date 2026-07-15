"use client";
import { Button } from "@/components/ui/button";

const QUICK_QUESTIONS = [
  "Where's my gate?",
  "Best exit after the match?",
  "Where's the nearest concession?",
  "How crowded is my section?",
] as const;

interface QuickChipsProps {
  onSelect: (question: string) => void;
}

export function QuickChips({ onSelect }: QuickChipsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {QUICK_QUESTIONS.map((question) => (
        <Button
          key={question}
          variant="outline"
          size="sm"
          onClick={() => onSelect(question)}
          className="rounded-full text-[13px] font-semibold"
        >
          {question}
        </Button>
      ))}
    </div>
  );
}

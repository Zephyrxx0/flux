"use client";
import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ChatInterface } from "./ChatInterface";

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/60 transition-transform active:scale-95"
        aria-label="Open Stadium Assistant"
      >
        <MessageSquare className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] p-0 sm:max-w-[400px]" showCloseButton={false}>
        <div className="absolute right-4 top-4 z-50">
           <button onClick={() => setOpen(false)} className="rounded-full bg-background/50 p-2 hover:bg-background/80 text-foreground">
             <X className="h-4 w-4" />
           </button>
        </div>
        <SheetTitle className="sr-only">Stadium Assistant</SheetTitle>
        <ChatInterface />
      </SheetContent>
    </Sheet>
  );
}

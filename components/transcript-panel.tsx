"use client";

import { useEffect, useRef, useCallback } from "react";
import { Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface TranscriptPanelProps {
  label: string;
  languageName?: string;
  index?: number;
  children: React.ReactNode;
  variant?: "source" | "translation";
  wordCount?: number;
  onCopy?: () => void;
  onClear?: () => void;
}

export function TranscriptPanel({
  label,
  languageName,
  index,
  children,
  variant = "source",
  wordCount = 0,
  onCopy,
  onClear,
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  });

  const handleCopy = useCallback(() => {
    onCopy?.();
  }, [onCopy]);

  return (
    <div
      className={cn(
        "animate-fade-in relative flex min-h-0 flex-1 flex-col border p-px",
        variant === "translation"
          ? "border-[#E8651A]/15 bg-[#CEC9C0]"
          : "border-[#1a1a1a]/10 bg-[#D4D0C8]"
      )}
    >
      {/* Corner brackets */}
      <div
        className={cn(
          "absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2",
          variant === "translation" ? "border-[#E8651A]/60" : "border-[#E8651A]"
        )}
      />
      <div
        className={cn(
          "absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2",
          variant === "translation" ? "border-[#E8651A]/60" : "border-[#E8651A]"
        )}
      />
      <div
        className={cn(
          "absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2",
          variant === "translation" ? "border-[#E8651A]/60" : "border-[#E8651A]"
        )}
      />
      <div
        className={cn(
          "absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2",
          variant === "translation" ? "border-[#E8651A]/60" : "border-[#E8651A]"
        )}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <div className="flex items-center gap-2">
          {index !== undefined && (
            <span className="font-mono text-[10px] font-bold text-[#E8651A]/40">
              {String(index).padStart(2, "0")}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40">
            {label}
          </span>
          {languageName && (
            <>
              <span className="text-[10px] text-[#1a1a1a]/15">|</span>
              <span className="text-[10px] font-semibold text-[#1a1a1a]/30">
                {languageName}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {wordCount > 0 && (
            <span className="mr-2 font-mono text-[10px] text-[#E8651A]/60">
              {String(wordCount).padStart(3, "0")} W
            </span>
          )}
          {onCopy && (
            <button
              onClick={handleCopy}
              className="rounded p-1.5 text-[#1a1a1a]/30 transition-colors hover:text-[#E8651A]"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
          {onClear && (
            <button
              onClick={onClear}
              className="rounded p-1.5 text-[#1a1a1a]/30 transition-colors hover:text-[#E8651A]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-3">
        {children}
      </div>
    </div>
  );
}

export function TranscriptText({
  text,
  dimmed,
  streaming,
}: {
  text: string;
  dimmed?: boolean;
  streaming?: boolean;
}) {
  if (!text) return null;
  return (
    <span
      className={cn(
        "text-sm leading-relaxed",
        dimmed && "italic text-[#1a1a1a]/30",
        streaming && "text-[#E8651A]",
        !dimmed && !streaming && "text-[#1a1a1a]/80"
      )}
    >
      {text}{" "}
    </span>
  );
}

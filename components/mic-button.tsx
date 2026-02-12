"use client";

import { Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface MicButtonProps {
  isRecording: boolean;
  isConnecting: boolean;
  onClick: () => void;
}

export function MicButton({
  isRecording,
  isConnecting,
  onClick,
}: MicButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isConnecting}
      className={cn(
        "relative flex items-center gap-3 rounded-full px-8 py-4 font-semibold text-base transition-all duration-300 active:scale-95 shadow-lg",
        isRecording
          ? "bg-red-500 text-white shadow-red-500/30"
          : "bg-white text-indigo-600 shadow-white/30",
        isConnecting && "opacity-80"
      )}
    >
      {/* Pulse rings when recording */}
      {isRecording && (
        <>
          <span className="pulse-ring absolute inset-0 rounded-full bg-red-500" />
          <span
            className="pulse-ring absolute inset-0 rounded-full bg-red-500"
            style={{ animationDelay: "0.5s" }}
          />
        </>
      )}

      {isConnecting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : isRecording ? (
        <>
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
          <span className="relative">Speak now</span>
        </>
      ) : (
        <>
          <Mic className="h-5 w-5" />
          <span>Tap to speak</span>
        </>
      )}
    </button>
  );
}

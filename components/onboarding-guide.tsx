"use client";

import { useEffect, useState } from "react";
import { useOnboarding, TOTAL_STEPS } from "@/hooks/use-onboarding";
import type { OnboardingStep } from "@/hooks/use-onboarding";

const STEPS: Record<
  OnboardingStep,
  { title: string; body: string; button: string }
> = {
  0: {
    title: "Welcome to Espik",
    body: "Real-time speech translation in your pocket. Please enable microphone permissions when prompted — we need it to hear you! Let me show you around.",
    button: "Show me →",
  },
  1: {
    title: "Pick your language",
    body: "Select the language you'll be speaking in.",
    button: "Next →",
  },
  2: {
    title: "Tap here to record",
    body: "Press the disc, then speak naturally. We'll transcribe and translate your words in real-time.",
    button: "Next →",
  },
  3: {
    title: "Voice output — not a text input",
    body: "Your spoken words appear here automatically. No typing needed!",
    button: "Next →",
  },
  4: {
    title: "You're all set!",
    body: "Tap the disc whenever you're ready to translate.",
    button: "Got it!",
  },
};

const PADDING = 8;
const TOOLTIP_GAP = 12;
const BORDER_RADIUS = 8;

export function OnboardingGuide() {
  const { step, isActive, targetRect, nextStep, skipOnboarding } =
    useOnboarding();
  const [tooltipKey, setTooltipKey] = useState(0);

  // Re-trigger tooltip animation on step change
  useEffect(() => {
    setTooltipKey((k) => k + 1);
  }, [step]);

  if (!isActive) return null;

  const info = STEPS[step];
  const isWelcome = step === 0;
  const isPulsing = step === 2;
  const stepNumber = step; // Steps 1-4 map to indicators 1-4

  // Spotlight position (only for steps 1-4)
  const spot = targetRect
    ? {
        top: targetRect.top - PADDING,
        left: targetRect.left - PADDING,
        width: targetRect.width + PADDING * 2,
        height: targetRect.height + PADDING * 2,
      }
    : null;

  // Tooltip positioning
  let tooltipStyle: React.CSSProperties = {};
  if (isWelcome || !spot) {
    // Centered card
    tooltipStyle = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  } else {
    const screenH = window.innerHeight;
    const spotCenterX = spot.left + spot.width / 2;
    const isTopHalf = spot.top + spot.height / 2 < screenH / 2;

    // Horizontal: centered on spotlight, clamped to screen
    const tooltipWidth = Math.min(280, window.innerWidth - 32);
    let tooltipLeft = spotCenterX - tooltipWidth / 2;
    tooltipLeft = Math.max(16, Math.min(tooltipLeft, window.innerWidth - tooltipWidth - 16));

    if (isTopHalf) {
      // Tooltip below spotlight
      tooltipStyle = {
        top: spot.top + spot.height + TOOLTIP_GAP,
        left: tooltipLeft,
        width: tooltipWidth,
      };
    } else {
      // Tooltip above spotlight
      tooltipStyle = {
        bottom: screenH - spot.top + TOOLTIP_GAP,
        left: tooltipLeft,
        width: tooltipWidth,
      };
    }
  }

  // Arrow positioning
  const arrowUp = spot
    ? spot.top + spot.height / 2 < window.innerHeight / 2
    : false;

  const arrowLeft = spot
    ? Math.max(
        20,
        Math.min(
          spot.left + spot.width / 2 - (tooltipStyle.left as number || 0),
          (tooltipStyle.width as number || 280) - 20
        )
      )
    : 0;

  return (
    <div
      className="fixed inset-0 z-[100]"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Dim overlay for welcome step (no spotlight cutout) */}
      {isWelcome && (
        <div className="absolute inset-0 bg-[#1a1a1a]/85" />
      )}

      {/* Spotlight cutout (steps 1-4) */}
      {spot && (
        <div
          className={isPulsing ? "animate-spotlight-pulse" : ""}
          style={{
            position: "absolute",
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            borderRadius: BORDER_RADIUS,
            boxShadow: "0 0 0 9999px rgba(26,26,26,0.85)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        key={tooltipKey}
        className="animate-tooltip-in absolute"
        style={{
          ...tooltipStyle,
          maxWidth: isWelcome ? 300 : undefined,
        }}
      >
        {/* Arrow pointing to target */}
        {spot && (
          <div
            style={{
              position: "absolute",
              left: arrowLeft,
              ...(arrowUp
                ? { top: -6 }
                : { bottom: -6 }),
              width: 12,
              height: 12,
              background: "#1a1a1a",
              transform: "translateX(-50%) rotate(45deg)",
            }}
          />
        )}

        <div className="relative border border-[#E8651A]/30 bg-[#1a1a1a] p-4">
          {/* Corner brackets */}
          <div className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-[#E8651A]" />
          <div className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-[#E8651A]" />
          <div className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-[#E8651A]" />
          <div className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-[#E8651A]" />

          <h3 className="mb-1 text-sm font-bold uppercase tracking-[0.15em] text-white">
            {info.title}
          </h3>
          <p className="mb-4 text-xs leading-relaxed text-white/60">
            {info.body}
          </p>

          <div className="flex items-center justify-between">
            {!isWelcome ? (
              <div className="flex items-center gap-1">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 w-1 rounded-full ${
                      i + 1 <= stepNumber
                        ? "bg-[#E8651A]"
                        : "bg-white/20"
                    }`}
                  />
                ))}
                <span className="ml-1.5 text-[10px] text-white/30">
                  {stepNumber}/{TOTAL_STEPS}
                </span>
              </div>
            ) : (
              <div />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextStep();
              }}
              className="rounded bg-[#E8651A] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-[#E8651A]/90 active:scale-95"
            >
              {info.button}
            </button>
          </div>
        </div>
      </div>

      {/* Skip button */}
      {step < 4 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            skipOnboarding();
          }}
          className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] text-[10px] font-medium uppercase tracking-[0.1em] text-white/40 transition-colors hover:text-white/70"
        >
          Skip
        </button>
      )}
    </div>
  );
}

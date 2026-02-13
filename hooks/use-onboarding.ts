"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePersistentState } from "./use-persistent-state";

export type OnboardingStep = 0 | 1 | 2 | 3 | 4;

const STEP_TARGETS: Record<OnboardingStep, string | null> = {
  0: null, // Welcome card, no spotlight
  1: "source-lang",
  2: "recording-disc",
  3: "source-panel",
  4: "recording-disc",
};

export const TOTAL_STEPS = 4; // Welcome doesn't count in the indicator

export function useOnboarding() {
  const [onboarded, setOnboarded] = usePersistentState("espik-onboarded", false);
  const [step, setStep] = useState<OnboardingStep>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const isActive = !onboarded;

  const updateRect = useCallback(() => {
    const target = STEP_TARGETS[step];
    if (!target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(`[data-onboarding="${target}"]`);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [step]);

  // Recalculate rect when step changes, on resize, or on scroll
  useEffect(() => {
    if (!isActive) return;

    updateRect();

    const target = STEP_TARGETS[step];
    if (!target) return;

    const el = document.querySelector(`[data-onboarding="${target}"]`);
    if (!el) return;

    // ResizeObserver for layout changes
    const ro = new ResizeObserver(() => updateRect());
    ro.observe(el);
    observerRef.current = ro;

    // Scroll and resize listeners
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      ro.disconnect();
      observerRef.current = null;
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isActive, step, updateRect]);

  const nextStep = useCallback(() => {
    setStep((prev) => {
      const next = prev + 1;
      if (next > 4) {
        setOnboarded(true);
        return prev;
      }
      return next as OnboardingStep;
    });
  }, [setOnboarded]);

  const skipOnboarding = useCallback(() => {
    setOnboarded(true);
  }, [setOnboarded]);

  const resetOnboarding = useCallback(() => {
    setOnboarded(false);
    setStep(0);
  }, [setOnboarded]);

  return {
    step,
    isActive,
    targetRect,
    nextStep,
    skipOnboarding,
    resetOnboarding,
  };
}

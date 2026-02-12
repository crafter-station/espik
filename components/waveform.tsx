"use client";

import { useMemo } from "react";
import { Mic, Loader2, Square } from "lucide-react";

interface RecordingDiscProps {
  isRecording: boolean;
  isConnecting: boolean;
  audioLevel: number;
  onClick: () => void;
  size?: number;
}

const BAR_COUNT = 48;

export function RecordingDisc({
  isRecording,
  isConnecting,
  audioLevel,
  onClick,
  size = 224,
}: RecordingDiscProps) {
  const center = size / 2;
  const innerRadius = size * 0.214;
  const maxBarHeight = size * 0.17;
  const btnSize = size * 0.268;
  const pulseSize = btnSize + 8;
  const iconSize = size * 0.107;

  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, () => ({
        factor: 0.3 + Math.random() * 0.7,
      })),
    []
  );

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* Main circle */}
      <div className="absolute inset-0 rounded-full bg-[#1a1a1a]" />

      {/* Groove rings */}
      {[0.92, 0.78, 0.64].map((ratio, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-[#2a2a2a]"
          style={{
            width: size * ratio,
            height: size * ratio,
            left: center - (size * ratio) / 2,
            top: center - (size * ratio) / 2,
          }}
        />
      ))}

      {/* Radial waveform bars */}
      {bars.map((bar, i) => {
        const angle = (i / BAR_COUNT) * 360;
        const scale = isRecording
          ? 0.2 + audioLevel * 0.8 * bar.factor
          : 0.12;

        return (
          <div
            key={i}
            className="absolute"
            style={{
              width: 2,
              height: maxBarHeight,
              left: center - 1,
              top: center - innerRadius - maxBarHeight,
              transformOrigin: `1px ${innerRadius + maxBarHeight}px`,
              transform: `rotate(${angle}deg)`,
            }}
          >
            <div
              className="h-full w-full rounded-full"
              style={{
                backgroundColor: "#E8651A",
                transformOrigin: "bottom center",
                transform: `scaleY(${scale})`,
                transition: "transform 0.15s ease-out, opacity 0.3s",
                opacity: isRecording ? 0.9 : 0.3,
              }}
            />
          </div>
        );
      })}

      {/* Center mic button */}
      <button
        onClick={onClick}
        disabled={isConnecting}
        className="absolute z-10 flex items-center justify-center rounded-full bg-[#E8651A] text-white transition-all active:scale-95 disabled:opacity-70"
        style={{
          width: btnSize,
          height: btnSize,
          left: center - btnSize / 2,
          top: center - btnSize / 2,
        }}
      >
        {isConnecting ? (
          <Loader2 style={{ width: iconSize, height: iconSize }} className="animate-spin" />
        ) : isRecording ? (
          <Square style={{ width: iconSize * 0.85, height: iconSize * 0.85 }} className="fill-white" />
        ) : (
          <Mic style={{ width: iconSize, height: iconSize }} />
        )}
      </button>

      {/* Pulse ring when recording */}
      {isRecording && (
        <div
          className="pulse-ring absolute z-[5] rounded-full border-2 border-[#E8651A]"
          style={{
            width: pulseSize,
            height: pulseSize,
            left: center - pulseSize / 2,
            top: center - pulseSize / 2,
          }}
        />
      )}
    </div>
  );
}

"use client";

import { useCallback, useMemo } from "react";
import { ArrowLeftRight, Mic, Volume2 } from "lucide-react";
import { OnboardingGuide } from "./onboarding-guide";
import { LanguageSelector } from "./language-selector";
import { RecordingDisc } from "./waveform";
import { TranscriptPanel, TranscriptText } from "./transcript-panel";
import { useSpeechTranslation } from "@/hooks/use-speech-translation";
import { getLanguage } from "@/lib/languages";
import { CrafterStationLogo } from "./logos/crafter-station";
import { GithubLogo } from "./logos/github";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function Translator() {
  const {
    sourceLanguage,
    targetLanguage,
    setSourceLanguage,
    setTargetLanguage,
    swapLanguages,
    isConnecting,
    isRecording,
    transcripts,
    translations,
    partialTranscript,
    partialTranslation,
    error,
    elapsedTime,
    audioLevel,
    startRecording,
    stopRecording,
  } = useSpeechTranslation();

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const transcriptText = useMemo(
    () => [...transcripts, partialTranscript].filter(Boolean).join(" "),
    [transcripts, partialTranscript]
  );

  const translationText = useMemo(
    () => [...translations, partialTranslation].filter(Boolean).join(" "),
    [translations, partialTranslation]
  );

  const transcriptWordCount = useMemo(
    () =>
      transcriptText.trim() ? transcriptText.trim().split(/\s+/).length : 0,
    [transcriptText]
  );

  const translationWordCount = useMemo(
    () =>
      translationText.trim()
        ? translationText.trim().split(/\s+/).length
        : 0,
    [translationText]
  );

  const handleCopyTranscript = useCallback(() => {
    if (transcriptText) navigator.clipboard.writeText(transcriptText);
  }, [transcriptText]);

  const handleCopyTranslation = useCallback(() => {
    if (translationText) navigator.clipboard.writeText(translationText);
  }, [translationText]);

  return (
    <div className="flex h-[100dvh] justify-center bg-[#1a1a1a]">
      <OnboardingGuide />
      {/* Mobile container */}
      <div className="relative flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-[#C8C4BC]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pb-1 pt-[calc(1rem+env(safe-area-inset-top))]">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-[#1a1a1a]">
                Espik
              </h1>
              <span className="text-[9px] uppercase tracking-[0.1em] text-[#1a1a1a]/40">
                Real-time translation
              </span>
            </div>
            <a
              href="https://crafterstation.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#1a1a1a]/40 transition-colors hover:text-[#E8651A]"
            >
              <span className="text-[9px] tracking-[0.05em]">
                by
              </span>
              <CrafterStationLogo className="h-3 w-auto" />
              <span className="text-[9px] font-semibold tracking-[0.05em]">
                Crafter Station
              </span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            {(isRecording || elapsedTime > 0) && (
              <span className="font-mono text-xs tabular-nums text-[#E8651A]">
                {formatTime(elapsedTime)}
              </span>
            )}
            <a
              href="https://github.com/crafter-station/espik"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1a1a1a]/35 transition-colors hover:text-[#1a1a1a]/60"
            >
              <GithubLogo className="h-4 w-auto" />
            </a>
            {/* Dot grid decoration */}
            <div className="grid grid-cols-3 gap-[3px]">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[3px] w-[3px] rounded-full bg-[#1a1a1a]/15"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Decorative orange bars */}
        <div className="mx-5 mb-3 mt-2 flex gap-1">
          <div className="h-[2px] w-6 bg-[#E8651A]" />
          <div className="h-[2px] w-3 bg-[#E8651A]" />
        </div>

        {/* Error toast */}
        {error && (
          <div className="mb-2 px-5">
            <p className="animate-toast border-l-2 border-[#E8651A] bg-[#1a1a1a] px-3 py-2 text-xs text-white/70">
              {error}
            </p>
          </div>
        )}

        {/* Content area */}
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-2">
          {/* Original transcript */}
          <TranscriptPanel
            label="Original"
            languageName={getLanguage(sourceLanguage)?.name}
            index={1}
            variant="source"
            wordCount={transcriptWordCount}
            onCopy={transcriptText ? handleCopyTranscript : undefined}
            data-onboarding="source-panel"
          >
            <p>
              {transcripts.length > 0 || partialTranscript ? (
                <>
                  {transcripts.map((t, i) => (
                    <TranscriptText key={i} text={t + " "} />
                  ))}
                  {partialTranscript && (
                    <TranscriptText text={partialTranscript} streaming />
                  )}
                </>
              ) : isRecording ? (
                <span className="text-xs italic text-[#1a1a1a]/30">
                  Listening...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-[#1a1a1a]/25">
                  <Mic className="h-3 w-3" />
                  Tap the disc below to start speaking
                </span>
              )}
            </p>
          </TranscriptPanel>

          {/* Center control hub */}
          <div className="flex flex-col items-center py-1.5">
            {/* Source language — left aligned */}
            <div data-onboarding="source-lang" className="flex w-full items-center gap-2 pr-[30%]">
              <LanguageSelector
                value={sourceLanguage}
                onChange={setSourceLanguage}
                label="01"
                disabled={isRecording}
              />
              <div className="h-px flex-1 bg-[#1a1a1a]/10" />
              <div className="h-2 w-px bg-[#1a1a1a]/10" />
            </div>

            {/* Disc — centered */}
            <div data-onboarding="recording-disc" className="py-1.5">
              <RecordingDisc
                isRecording={isRecording}
                isConnecting={isConnecting}
                audioLevel={audioLevel}
                onClick={handleMicClick}
                size={90}
              />
            </div>

            {/* Swap + status — centered */}
            <div className="flex items-center gap-2 py-1">
              <div className="h-px w-6 bg-[#1a1a1a]/8" />
              <button
                onClick={swapLanguages}
                disabled={isRecording}
                className="rounded-full border border-[#E8651A]/30 p-1.5 text-[#E8651A] transition-all active:scale-90 disabled:opacity-50"
              >
                <ArrowLeftRight className="h-3 w-3" />
              </button>
              <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]/25">
                {isRecording
                  ? "Recording"
                  : isConnecting
                    ? "Connecting"
                    : "Tap to record"}
              </p>
              <div className="h-px w-6 bg-[#1a1a1a]/8" />
            </div>

            {/* Target language — right aligned (mirror of source) */}
            <div className="flex w-full items-center gap-2 pl-[30%]">
              <div className="h-2 w-px bg-[#1a1a1a]/10" />
              <div className="h-px flex-1 bg-[#1a1a1a]/10" />
              <LanguageSelector
                value={targetLanguage}
                onChange={setTargetLanguage}
                label="02"
                disabled={isRecording}
              />
            </div>
          </div>

          {/* Translation transcript */}
          <TranscriptPanel
            label="Translation"
            languageName={getLanguage(targetLanguage)?.name}
            index={2}
            variant="translation"
            wordCount={translationWordCount}
            onCopy={translationText ? handleCopyTranslation : undefined}
          >
            <p>
              {translations.length > 0 || partialTranslation ? (
                <>
                  {translations.map((t, i) => (
                    <TranscriptText key={i} text={t + " "} />
                  ))}
                  {partialTranslation && (
                    <TranscriptText text={partialTranslation} streaming />
                  )}
                </>
              ) : isRecording ? (
                <span className="text-xs italic text-[#1a1a1a]/30">
                  Waiting for translation...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-[#1a1a1a]/25">
                  <Volume2 className="h-3 w-3" />
                  Your translation will stream here
                </span>
              )}
            </p>
          </TranscriptPanel>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-1">
          <a
            href="https://crafterstation.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#1a1a1a]/40 transition-colors hover:text-[#E8651A]"
          >
            <span className="text-[9px] uppercase tracking-[0.1em]">
              Made by
            </span>
            <CrafterStationLogo className="h-3.5 w-auto" />
            <span className="text-[9px] font-semibold tracking-[0.05em]">
              Crafter Station
            </span>
          </a>
          <div className="flex items-center gap-2.5">
            <a
              href="https://github.com/crafter-station/espik"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#1a1a1a]/35 transition-colors hover:text-[#1a1a1a]/60"
            >
              <GithubLogo className="h-3.5 w-auto" />
              <span className="text-[9px] font-medium">Star</span>
            </a>
            <div className="h-px w-3 bg-[#1a1a1a]/10" />
            <span className="font-mono text-[9px] text-[#E8651A]/40">
              v0.1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

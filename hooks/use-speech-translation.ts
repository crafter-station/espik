"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLanguage } from "@/lib/languages";
import { log } from "@/lib/logger";
import { suppressVendorLogs } from "@/lib/suppress-vendor-logs";
import { usePersistentState } from "./use-persistent-state";

suppressVendorLogs();

export function useSpeechTranslation() {
  const [sourceLanguage, _setSourceLanguage] = usePersistentState(
    "espik-source-lang",
    "es"
  );
  const [targetLanguage, _setTargetLanguage] = usePersistentState(
    "espik-target-lang",
    "ja"
  );

  // Prevent selecting the same language for both source and target
  const setSourceLanguage = useCallback(
    (code: string) => {
      if (code === targetLanguage) {
        _setTargetLanguage(sourceLanguage);
      }
      _setSourceLanguage(code);
    },
    [targetLanguage, sourceLanguage, _setSourceLanguage, _setTargetLanguage]
  );

  const setTargetLanguage = useCallback(
    (code: string) => {
      if (code === sourceLanguage) {
        _setSourceLanguage(targetLanguage);
      }
      _setTargetLanguage(code);
    },
    [sourceLanguage, targetLanguage, _setSourceLanguage, _setTargetLanguage]
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [translations, setTranslations] = useState<string[]>([]);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [partialTranslation, setPartialTranslation] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioLevelRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      try { clientRef.current?.cleanup(); } catch { /* ignore */ }
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioLevelRef.current) clearInterval(audioLevelRef.current);
    };
  }, []);

  // Elapsed time counter
  useEffect(() => {
    if (isRecording) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Simulated audio level
  useEffect(() => {
    if (isRecording) {
      audioLevelRef.current = setInterval(() => {
        setAudioLevel(0.3 + Math.random() * 0.7);
      }, 150);
    } else {
      setAudioLevel(0);
      if (audioLevelRef.current) {
        clearInterval(audioLevelRef.current);
        audioLevelRef.current = null;
      }
    }
    return () => {
      if (audioLevelRef.current) clearInterval(audioLevelRef.current);
    };
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    setTranscripts([]);
    setTranslations([]);
    setPartialTranscript("");
    setPartialTranslation("");

    try {
      // Fetch credentials from server (secrets never in client bundle)
      const authRes = await fetch("/api/auth");
      if (!authRes.ok) throw new Error("Failed to fetch auth credentials");
      const { clientId, clientSecret } = await authRes.json();

      const { PalabraClient, getLocalAudioTrack } = await import(
        "@palabra-ai/translator"
      );

      const targetLang = getLanguage(targetLanguage);

      const from = sourceLanguage;
      const to = targetLang?.targetCode ?? targetLanguage;
      log.info("Languages:", { from, to });

      const client = new PalabraClient({
        auth: { clientId, clientSecret },
        translateFrom: from as never,
        translateTo: to as never,
        handleOriginalTrack: () => getLocalAudioTrack(),
      });

      client.on("roomConnected", () => {
        log.info("Connected");
        setIsConnecting(false);
        setIsRecording(true);
      });

      client.on("roomDisconnected", () => {
        log.info("Disconnected");
        setIsRecording(false);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client.on("transcriptionReceived", (data: any) => {
        const text = data?.transcription?.text;
        if (text) {
          setTranscripts((prev) => [...prev, text]);
          setPartialTranscript("");
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client.on("translationReceived", (data: any) => {
        const text = data?.transcription?.text;
        if (text) {
          setTranslations((prev) => [...prev, text]);
          setPartialTranslation("");
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client.on("partialTranscriptionReceived", (data: any) => {
        const text = data?.transcription?.text;
        if (text) setPartialTranscript(text);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client.on("partialTranslatedTranscriptionReceived", (data: any) => {
        const text = data?.transcription?.text;
        if (text) setPartialTranslation(text);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client.on("errorReceived", (data: any) => {
        log.error("errorReceived:", JSON.stringify(data));
        setError(data?.description || "Translation error");
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client.on("connectionStateChanged", (state: any) => {
        log.info("connectionState:", state);
      });

      // Tune pipeline for lower latency
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cm = (client as any).getConfigManager?.();
        if (cm) {
          cm.setValue?.("preprocessing.vad_threshold", 0.3);
          cm.setValue?.("preprocessing.vad_right_padding", 0.3);
          cm.setValue?.("preprocessing.vad_left_padding", 0.3);
          cm.setValue?.(
            "transcription.segment_confirmation_silence_threshold",
            0.3
          );
          cm.setValue?.(
            "translation_queue_configs.global.desired_queue_level_ms",
            2000
          );
          cm.setValue?.(
            "translation_queue_configs.global.max_queue_level_ms",
            8000
          );
          log.info("Pipeline tuned for low latency");
        }
      } catch (e) {
        log.warn("Config tuning failed:", e);
      }

      clientRef.current = client;

      const started = await client.startTranslation();
      if (!started) throw new Error("Failed to start translation");

      client.startPlayback();
    } catch (err) {
      log.error("Start failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        msg.includes("Permission") || msg.includes("NotAllowed")
          ? "Microphone access denied."
          : `Failed to start: ${msg}`
      );
      setIsConnecting(false);
    }
  }, [sourceLanguage, targetLanguage]);

  const stopRecording = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    clientRef.current = null;
    setIsRecording(false);
    setPartialTranscript("");
    setPartialTranslation("");

    log.info("Stopping");
    try {
      client.stopPlayback();
      await client.stopTranslation();
    } catch (e) {
      log.warn("Stop warning:", e);
    }
    // cleanup() throws "No session data found" after stopTranslation
    // already disconnected the room — safe to ignore
    try { client.cleanup(); } catch { /* expected */ }
  }, []);

  const swapLanguages = useCallback(() => {
    _setSourceLanguage(targetLanguage);
    _setTargetLanguage(sourceLanguage);
    setTranscripts([]);
    setTranslations([]);
    setPartialTranscript("");
    setPartialTranslation("");
  }, [sourceLanguage, targetLanguage, _setSourceLanguage, _setTargetLanguage]);

  return {
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
  };
}

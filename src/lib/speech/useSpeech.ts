"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { getLocaleTag, type Locale } from "../i18n/index.ts";
import { pickVoice, voiceAvailability, type VoiceAvailability } from "./voice.ts";
import {
  getServerVoiceSnapshot,
  getVoiceSnapshot,
  subscribeVoices,
} from "./voiceStore.ts";

interface SpeechState {
  /** The browser exposes the Web Speech synthesis API at all. */
  supported: boolean;
  /** Whether a voice exists for the active locale. */
  availability: VoiceAvailability;
  speaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
}

const noopSubscribe = () => () => {};
const isSupportedOnClient = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;
const isSupportedOnServer = () => false;

/**
 * Thin wrapper over `speechSynthesis`.
 *
 * Speech is always user-initiated — this hook never speaks on mount or
 * when the result changes. Everything runs locally; no calculation data
 * leaves the device.
 */
export function useSpeech(locale: Locale): SpeechState {
  const supported = useSyncExternalStore(
    noopSubscribe,
    isSupportedOnClient,
    isSupportedOnServer,
  );

  const { voices, loaded } = useSyncExternalStore(
    subscribeVoices,
    getVoiceSnapshot,
    getServerVoiceSnapshot,
  );

  const [speaking, setSpeaking] = useState(false);

  const stop = useCallback(() => {
    if (!isSupportedOnClient()) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupportedOnClient()) return;
      const synth = window.speechSynthesis;

      // Always clear the queue first, so a new result replaces the previous
      // one instead of being read out after it.
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLocaleTag(locale);

      // getVoices() returns real SpeechSynthesisVoice objects; VoiceLike is
      // the structural subset we match on.
      const voice = pickVoice(synth.getVoices(), locale);
      if (voice) utterance.voice = voice as SpeechSynthesisVoice;

      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      synth.speak(utterance);
    },
    [locale],
  );

  // Switching language mid-sentence would leave the wrong voice talking.
  // Cancelling is an external-system call; the resulting state is synced on
  // the next frame (rather than synchronously here) because not every engine
  // fires `end` when a queue is cancelled.
  useEffect(() => {
    if (!isSupportedOnClient()) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const frame = window.requestAnimationFrame(() => setSpeaking(synth.speaking));
    return () => {
      window.cancelAnimationFrame(frame);
      synth.cancel();
    };
  }, [locale]);

  return {
    supported,
    availability: voiceAvailability(voices, locale, loaded),
    speaking,
    speak,
    stop,
  };
}

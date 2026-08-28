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
  /**
   * Speak `text` in the active locale. Returns `false` and does nothing
   * if the browser has no voice for that locale's language — the text is
   * never read with a wrong-language voice.
   */
  speak: (text: string) => boolean;
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
    (text: string): boolean => {
      if (!isSupportedOnClient()) return false;
      const synth = window.speechSynthesis;

      // Pick the voice from the *live* list, then refuse to speak at all
      // if there is no voice for this locale's language. Leaving
      // `utterance.voice` unset would let the browser fall back to its
      // default voice — for Hindi text that is almost always an English
      // voice, which reads Devanagari as gibberish. No voice, no speech.
      const voice = pickVoice(synth.getVoices(), locale);
      if (!voice) return false;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLocaleTag(locale);
      // getVoices() returns real SpeechSynthesisVoice objects; VoiceLike is
      // the structural subset we match on.
      try {
        utterance.voice = voice as SpeechSynthesisVoice;
      } catch {
        // Some engines reject a voice object; fall through to the guard.
      }
      // Only ever speak with an explicitly-bound voice. If binding did not
      // take, `utterance.voice` stays null and the engine would use its
      // default — for Hindi that is an English voice reading Devanagari.
      if (!utterance.voice) return false;

      // Clear the queue, so a new result replaces the previous one instead
      // of being read out after it.
      synth.cancel();

      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      synth.speak(utterance);
      return true;
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

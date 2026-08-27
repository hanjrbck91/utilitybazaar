import { getLocaleTag, type Locale } from "../i18n/index.ts";

/** The part of `SpeechSynthesisVoice` we need. Keeps this file DOM-free and testable. */
export interface VoiceLike {
  lang: string;
  name: string;
}

/** "hi_IN" / "HI-in" -> "hi-in" */
function normalise(lang: string): string {
  return lang.replace(/_/g, "-").toLowerCase();
}

/** Primary subtag: "hi-in" -> "hi" */
function primary(lang: string): string {
  return normalise(lang).split("-")[0];
}

/**
 * Pick the best available voice for a locale.
 *
 * 1. exact region match (hi-IN, en-IN)
 * 2. any voice sharing the language (hi-*, en-*)
 * 3. null — the caller decides how to degrade
 *
 * Never falls back across languages: reading Hindi with an English voice
 * produces gibberish, so no voice is better than the wrong voice.
 */
export function pickVoice(
  voices: ReadonlyArray<VoiceLike>,
  locale: Locale,
): VoiceLike | null {
  const tag = normalise(getLocaleTag(locale));
  const lang = primary(tag);

  const exact = voices.find((voice) => normalise(voice.lang) === tag);
  if (exact) return exact;

  const sameLanguage = voices.find((voice) => primary(voice.lang) === lang);
  return sameLanguage ?? null;
}

export type VoiceAvailability = "ready" | "unknown" | "missing";

/**
 * Whether we can speak this locale.
 *
 * `voicesLoaded` matters because `speechSynthesis.getVoices()` returns an
 * empty list until the engine populates it. Until then the answer is
 * "unknown" and the caller should stay optimistic rather than disabling
 * a button that is about to work.
 */
export function voiceAvailability(
  voices: ReadonlyArray<VoiceLike>,
  locale: Locale,
  voicesLoaded: boolean,
): VoiceAvailability {
  if (pickVoice(voices, locale)) return "ready";
  if (!voicesLoaded || voices.length === 0) return "unknown";
  return "missing";
}

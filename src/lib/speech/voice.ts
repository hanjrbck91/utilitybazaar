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
 * Priority, per language:
 *   1. exact region match — `hi-IN` for Hindi, `en-IN` for English
 *      (so an Indian English voice always wins over `en-US` / `en-GB`)
 *   2. any other voice of the same language — `hi-*` for Hindi,
 *      `en-*` for English
 *   3. `null` — the caller must then disable audio for this locale
 *
 * It never crosses a language boundary. Reading Devanagari with an
 * English voice produces gibberish, so for Hindi the choice is a Hindi
 * voice or nothing — an English voice is never substituted, and vice
 * versa.
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

/** True when {@link pickVoice} would return a usable voice for `locale`. */
export function hasVoiceForLocale(
  voices: ReadonlyArray<VoiceLike>,
  locale: Locale,
): boolean {
  return pickVoice(voices, locale) !== null;
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

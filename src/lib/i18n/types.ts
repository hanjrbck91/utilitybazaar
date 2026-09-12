import { en, enPercentage } from "../../translations/en/index.ts";

/**
 * The translation contract, derived from the English dictionary.
 * Every other locale is typed against this, so a missing key is a
 * build error rather than an untranslated string at runtime.
 */
export type Dictionary = typeof en;

/** Same contract, for the Percentage Calculator's own dictionary. */
export type PercentageDictionary = typeof enPercentage;

/** Supported locales. `en` is the default. */
export const LOCALES = ["en", "hi"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/**
 * BCP 47 tag per locale — used for `<html lang>`, speech synthesis and
 * (in a later milestone) hreflang.
 */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en-IN",
  hi: "hi-IN",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

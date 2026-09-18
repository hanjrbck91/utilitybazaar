import { en, enHome, enPercentage } from "../../translations/en/index.ts";
import { hi, hiHome, hiPercentage } from "../../translations/hi/index.ts";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_TAGS,
  isLocale,
  type Dictionary,
  type HomeDictionary,
  type Locale,
  type PercentageDictionary,
} from "./types.ts";

export { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, isLocale };
export type { Dictionary, HomeDictionary, Locale, PercentageDictionary };

const DICTIONARIES: Record<Locale, Dictionary> = { en, hi };

/**
 * Look up a dictionary. Unknown values fall back to the default locale,
 * so a bad route segment can never render an empty interface.
 */
export function getDictionary(locale: unknown): Dictionary {
  return DICTIONARIES[isLocale(locale) ? locale : DEFAULT_LOCALE];
}

const PERCENTAGE_DICTIONARIES: Record<Locale, PercentageDictionary> = {
  en: enPercentage,
  hi: hiPercentage,
};

/** Same lookup as {@link getDictionary}, for the Percentage Calculator's own dictionary. */
export function getPercentageDictionary(locale: unknown): PercentageDictionary {
  return PERCENTAGE_DICTIONARIES[isLocale(locale) ? locale : DEFAULT_LOCALE];
}

const HOME_DICTIONARIES: Record<Locale, HomeDictionary> = {
  en: enHome,
  hi: hiHome,
};

/** Same lookup as {@link getDictionary}, for the homepage's own dictionary. */
export function getHomeDictionary(locale: unknown): HomeDictionary {
  return HOME_DICTIONARIES[isLocale(locale) ? locale : DEFAULT_LOCALE];
}

/** BCP 47 tag for a locale, with the same safe fallback. */
export function getLocaleTag(locale: unknown): string {
  return LOCALE_TAGS[isLocale(locale) ? locale : DEFAULT_LOCALE];
}

/**
 * Fill `{name}` placeholders in a translated string.
 *
 * Values are inserted verbatim — pass already-formatted currency and
 * rates so number formatting stays owned by the GST engine.
 * An unknown placeholder is left untouched rather than blanked, which
 * makes a missing value obvious instead of silently losing text.
 */
export function interpolate(
  template: string,
  params: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

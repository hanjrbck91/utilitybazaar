import { LOCALES, LOCALE_TAGS, type Locale } from "./i18n/index.ts";

/**
 * Route map for the site.
 *
 * Paths live here rather than being spelled out in components, so the
 * sitemap, the canonical URLs, the hreflang alternates and the links in
 * the interface can never drift apart.
 */

/** The homepage / tools hub, localized. */
export function homePath(locale: Locale): string {
  return `/${locale}`;
}

/** The GST calculator, localized. */
export function calculatorPath(locale: Locale): string {
  return `/${locale}/gst-calculator`;
}

/** The Percentage Calculator, localized. */
export function percentageCalculatorPath(locale: Locale): string {
  return `/${locale}/percentage-calculator`;
}

/** Supporting pages. Not localized — they are short and English-only for now. */
export const STATIC_PATHS = {
  about: "/about",
  privacy: "/privacy",
  terms: "/terms",
} as const;

export type StaticPath = (typeof STATIC_PATHS)[keyof typeof STATIC_PATHS];

/** Every path that should be indexable, in sitemap order. */
export function indexablePaths(): string[] {
  return [
    ...LOCALES.map(homePath),
    ...LOCALES.map(calculatorPath),
    ...LOCALES.map(percentageCalculatorPath),
    ...Object.values(STATIC_PATHS),
  ];
}

/**
 * hreflang map for the GST calculator: every locale plus `x-default`.
 *
 * `x-default` points at English because that is the default experience
 * for a visitor whose language we cannot match.
 */
export function calculatorLanguageAlternates(): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of LOCALES) {
    alternates[LOCALE_TAGS[locale]] = calculatorPath(locale);
  }
  alternates["x-default"] = calculatorPath("en");
  return alternates;
}

/** Same hreflang map as {@link calculatorLanguageAlternates}, for the Percentage Calculator. */
export function percentageCalculatorLanguageAlternates(): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of LOCALES) {
    alternates[LOCALE_TAGS[locale]] = percentageCalculatorPath(locale);
  }
  alternates["x-default"] = percentageCalculatorPath("en");
  return alternates;
}

/** Same hreflang map as {@link calculatorLanguageAlternates}, for the homepage. */
export function homeLanguageAlternates(): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of LOCALES) {
    alternates[LOCALE_TAGS[locale]] = homePath(locale);
  }
  alternates["x-default"] = homePath("en");
  return alternates;
}

import { SITE_URL, absoluteUrl } from "../config.ts";
import { LOCALE_TAGS, getDictionary, getPercentageDictionary, type Locale } from "../i18n/index.ts";
import {
  calculatorLanguageAlternates,
  calculatorPath,
  percentageCalculatorLanguageAlternates,
  percentageCalculatorPath,
} from "../routes.ts";

/**
 * Framework-free description of a page's head.
 *
 * Kept as plain data so the whole of it — canonicals, hreflang, Open
 * Graph — is assertable in tests without rendering anything.
 */
export interface PageSeo {
  title: string;
  description: string;
  /** Absolute canonical URL. */
  canonical: string;
  /** hreflang code -> absolute URL. Empty for pages with no translations. */
  languages: Record<string, string>;
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    locale: string;
    alternateLocales: string[];
    type: "website";
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
  };
}

export const SITE_NAME = "GST Calculator";

/** Open Graph wants underscored locale tags: `en-IN` -> `en_IN`. */
export function toOpenGraphLocale(tag: string): string {
  return tag.replace("-", "_");
}

/** SEO for the calculator at a given locale. */
export function buildCalculatorSeo(locale: Locale): PageSeo {
  const d = getDictionary(locale);
  const canonical = absoluteUrl(calculatorPath(locale));

  const languages: Record<string, string> = {};
  for (const [code, path] of Object.entries(calculatorLanguageAlternates())) {
    languages[code] = absoluteUrl(path);
  }

  const alternateLocales = Object.values(LOCALE_TAGS)
    .filter((tag) => tag !== LOCALE_TAGS[locale])
    .map(toOpenGraphLocale);

  return {
    title: d.seo.title,
    description: d.seo.description,
    canonical,
    languages,
    openGraph: {
      title: d.seo.title,
      description: d.seo.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: toOpenGraphLocale(LOCALE_TAGS[locale]),
      alternateLocales,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: d.seo.title,
      description: d.seo.description,
    },
  };
}

/** SEO for the Percentage Calculator at a given locale. Same shape as {@link buildCalculatorSeo}. */
export function buildPercentageCalculatorSeo(locale: Locale): PageSeo {
  const d = getPercentageDictionary(locale);
  const canonical = absoluteUrl(percentageCalculatorPath(locale));

  const languages: Record<string, string> = {};
  for (const [code, path] of Object.entries(percentageCalculatorLanguageAlternates())) {
    languages[code] = absoluteUrl(path);
  }

  const alternateLocales = Object.values(LOCALE_TAGS)
    .filter((tag) => tag !== LOCALE_TAGS[locale])
    .map(toOpenGraphLocale);

  return {
    title: d.seo.title,
    description: d.seo.description,
    canonical,
    languages,
    openGraph: {
      title: d.seo.title,
      description: d.seo.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: toOpenGraphLocale(LOCALE_TAGS[locale]),
      alternateLocales,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: d.seo.title,
      description: d.seo.description,
    },
  };
}

/**
 * SEO for a supporting page. These exist in English only, so they carry
 * a canonical but no language alternates — claiming hreflang for pages
 * that have no translation would be a lie to the crawler.
 */
export function buildStaticPageSeo(options: {
  path: string;
  title: string;
  description: string;
}): PageSeo {
  const canonical = absoluteUrl(options.path);
  const fullTitle = `${options.title} — ${SITE_NAME}`;

  return {
    title: fullTitle,
    description: options.description,
    canonical,
    languages: {},
    openGraph: {
      title: fullTitle,
      description: options.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: toOpenGraphLocale(LOCALE_TAGS.en),
      alternateLocales: [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: options.description,
    },
  };
}

/** Base URL used by Next to resolve relative metadata URLs. */
export function metadataBase(): URL {
  return new URL(SITE_URL);
}

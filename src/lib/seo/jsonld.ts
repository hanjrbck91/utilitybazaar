import { absoluteUrl } from "../config.ts";
import { LOCALE_TAGS, getDictionary, type Locale } from "../i18n/index.ts";
import { calculatorPath } from "../routes.ts";
import { SITE_NAME } from "./metadata.ts";

/**
 * Structured data for the calculator.
 *
 * Deliberately minimal and literally true. There are no ratings, no
 * reviews, no prices and no organization claims, because none of those
 * exist — a fabricated `aggregateRating` would earn a rich result and a
 * manual action to go with it. What is asserted is only what the page
 * demonstrably is: a free browser-based finance utility, in a stated
 * language, at a stated URL.
 */
export interface WebApplicationJsonLd {
  "@context": "https://schema.org";
  "@type": "WebApplication";
  name: string;
  url: string;
  description: string;
  applicationCategory: "FinanceApplication";
  operatingSystem: "Any";
  browserRequirements: string;
  inLanguage: string;
  isAccessibleForFree: true;
}

export function buildCalculatorJsonLd(locale: Locale): WebApplicationJsonLd {
  const d = getDictionary(locale);

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: d.seo.title,
    url: absoluteUrl(calculatorPath(locale)),
    description: d.seo.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    inLanguage: LOCALE_TAGS[locale],
    isAccessibleForFree: true,
  };
}

/**
 * Serialize for a `<script type="application/ld+json">` body.
 *
 * `<` is escaped so a string in the payload can never close the script
 * element early.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export { SITE_NAME };

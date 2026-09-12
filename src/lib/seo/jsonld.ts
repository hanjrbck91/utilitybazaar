import { absoluteUrl } from "../config.ts";
import { LOCALE_TAGS, getDictionary, getPercentageDictionary, type Locale } from "../i18n/index.ts";
import { calculatorPath, percentageCalculatorPath } from "../routes.ts";
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

/** Same shape as {@link buildCalculatorJsonLd}, for the Percentage Calculator. */
export function buildPercentageCalculatorJsonLd(locale: Locale): WebApplicationJsonLd {
  const d = getPercentageDictionary(locale);

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: d.seo.title,
    url: absoluteUrl(percentageCalculatorPath(locale)),
    description: d.seo.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    inLanguage: LOCALE_TAGS[locale],
    isAccessibleForFree: true,
  };
}

/**
 * Site-level structured data.
 *
 * A `WebSite` node and nothing more. Every field is verifiable on the
 * page: the site's name, its canonical origin and the two languages it
 * is published in. Deliberately omitted:
 *   - `potentialAction` / `SearchAction` — there is no site search.
 *   - `Organization` / `publisher` — no logo, no legal entity details
 *     and no brand shown on the page yet; an entry now would be thin
 *     and partly unverifiable.
 */
export interface WebSiteJsonLd {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  inLanguage: string[];
}

export function buildWebSiteJsonLd(): WebSiteJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    inLanguage: Object.values(LOCALE_TAGS),
  };
}

/**
 * FAQ structured data.
 *
 * Built straight from the same dictionary the page renders, so every
 * question and answer in the markup is also visible on the page — the
 * only form of `FAQPage` that current search-engine guidance allows.
 * No `author`, `dateCreated`, vote counts or other invented fields.
 */
export interface FaqJsonLd {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }>;
}

export function buildFaqJsonLd(locale: Locale): FaqJsonLd {
  const d = getDictionary(locale);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: d.content.faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** Same shape as {@link buildFaqJsonLd}, for the Percentage Calculator. */
export function buildPercentageFaqJsonLd(locale: Locale): FaqJsonLd {
  const d = getPercentageDictionary(locale);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: d.content.faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
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

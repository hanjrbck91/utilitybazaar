import { absoluteUrl, isSiteUrlConfigured } from "../config.ts";
import { LOCALE_TAGS, LOCALES } from "../i18n/index.ts";
import { STATIC_PATHS, calculatorPath, percentageCalculatorPath } from "../routes.ts";

export interface SitemapEntry {
  url: string;
  /**
   * ISO date the page's content last changed — taken from the Git
   * history of the sources that render it, not the build clock, so a
   * rebuild that changes nothing does not re-date the page.
   * Update the matching value in {@link LAST_MODIFIED} when the content
   * of a route actually changes.
   */
  lastModified: string;
  changeFrequency: "monthly" | "yearly";
  priority: number;
  alternates?: { languages: Record<string, string> };
}

/**
 * Truthful last-modified dates per route.
 *
 * `calculator` covers `/en/gst-calculator` and `/hi/gst-calculator`,
 * whose text lives in the shared translation dictionaries.
 * `percentageCalculator` covers `/en/percentage-calculator` and
 * `/hi/percentage-calculator`. `supporting` covers `/about`, `/privacy`
 * and `/terms`. Values reflect the last commit that touched the relevant
 * sources; bump them only on a real content change.
 */
const LAST_MODIFIED = {
  calculator: "2026-08-28",
  percentageCalculator: "2026-09-12",
  supporting: "2026-08-27",
} as const;

export interface RobotsRules {
  rules: { userAgent: string; allow?: string; disallow?: string };
  sitemap?: string;
}

/**
 * Every indexable URL, absolute, with hreflang alternates on the
 * localized calculator pages.
 *
 * Only real routes appear here: no preview paths, no duplicates, and no
 * entry for `/`, which is a permanent redirect to the English calculator
 * rather than a page of its own.
 */
export function buildSitemap(): SitemapEntry[] {
  const gstLanguages: Record<string, string> = {};
  const percentageLanguages: Record<string, string> = {};
  for (const locale of LOCALES) {
    gstLanguages[LOCALE_TAGS[locale]] = absoluteUrl(calculatorPath(locale));
    percentageLanguages[LOCALE_TAGS[locale]] = absoluteUrl(percentageCalculatorPath(locale));
  }

  const calculators: SitemapEntry[] = LOCALES.map((locale) => ({
    url: absoluteUrl(calculatorPath(locale)),
    lastModified: LAST_MODIFIED.calculator,
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages: gstLanguages },
  }));

  const percentageCalculators: SitemapEntry[] = LOCALES.map((locale) => ({
    url: absoluteUrl(percentageCalculatorPath(locale)),
    lastModified: LAST_MODIFIED.percentageCalculator,
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages: percentageLanguages },
  }));

  const supporting: SitemapEntry[] = Object.values(STATIC_PATHS).map((path) => ({
    url: absoluteUrl(path),
    lastModified: LAST_MODIFIED.supporting,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...calculators, ...percentageCalculators, ...supporting];
}

/**
 * robots.txt rules.
 *
 * When no site URL has been configured, every URL this build could emit
 * would be wrong, so the whole deployment is disallowed instead. That
 * keeps a preview or a misconfigured deploy from being indexed under a
 * placeholder origin, and it fixes itself the moment the URL is set.
 */
export function buildRobots(): RobotsRules {
  if (!isSiteUrlConfigured) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

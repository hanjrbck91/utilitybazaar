import { absoluteUrl, isSiteUrlConfigured } from "../config.ts";
import { LOCALE_TAGS, LOCALES } from "../i18n/index.ts";
import { STATIC_PATHS, calculatorPath } from "../routes.ts";

export interface SitemapEntry {
  url: string;
  changeFrequency: "monthly" | "yearly";
  priority: number;
  alternates?: { languages: Record<string, string> };
}

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
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[LOCALE_TAGS[locale]] = absoluteUrl(calculatorPath(locale));
  }

  const calculators: SitemapEntry[] = LOCALES.map((locale) => ({
    url: absoluteUrl(calculatorPath(locale)),
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
  }));

  const supporting: SitemapEntry[] = Object.values(STATIC_PATHS).map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...calculators, ...supporting];
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

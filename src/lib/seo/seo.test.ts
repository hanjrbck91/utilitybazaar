import assert from "node:assert/strict";
import test from "node:test";

import { SITE_URL } from "../config.ts";
import { LOCALES, getDictionary } from "../i18n/index.ts";
import {
  STATIC_PATHS,
  calculatorLanguageAlternates,
  calculatorPath,
  indexablePaths,
} from "../routes.ts";
import {
  buildCalculatorJsonLd,
  buildWebSiteJsonLd,
  serializeJsonLd,
} from "./jsonld.ts";
import { buildCalculatorSeo, buildStaticPageSeo, toOpenGraphLocale } from "./metadata.ts";
import { buildRobots, buildSitemap } from "./sitemap.ts";

// --- routes -----------------------------------------------------------

test("localized calculator routes", () => {
  assert.equal(calculatorPath("en"), "/en/gst-calculator");
  assert.equal(calculatorPath("hi"), "/hi/gst-calculator");
});

test("indexable paths are unique and rooted", () => {
  const paths = indexablePaths();
  assert.deepEqual(paths, [
    "/en/gst-calculator",
    "/hi/gst-calculator",
    "/about",
    "/privacy",
    "/terms",
  ]);
  assert.equal(new Set(paths).size, paths.length, "duplicate path");
  for (const path of paths) assert.ok(path.startsWith("/"), path);
});

test("hreflang map covers every locale plus x-default pointing at English", () => {
  const alternates = calculatorLanguageAlternates();
  assert.deepEqual(alternates, {
    "en-IN": "/en/gst-calculator",
    "hi-IN": "/hi/gst-calculator",
    "x-default": "/en/gst-calculator",
  });
});

// --- metadata ---------------------------------------------------------

test("English metadata targets the primary intent", () => {
  const seo = buildCalculatorSeo("en");
  assert.equal(seo.title, "GST Calculator — Calculate GST Online");
  for (const term of ["Add GST", "remove GST", "CGST", "SGST", "IGST", "India"]) {
    assert.match(seo.description, new RegExp(term, "i"), `description missing ${term}`);
  }
});

test("Hindi metadata is genuinely Hindi", () => {
  const seo = buildCalculatorSeo("hi");
  assert.match(seo.title, /कैलकुलेटर/);
  assert.match(seo.title, /GST/);
  assert.notEqual(seo.title, buildCalculatorSeo("en").title);
  assert.match(seo.description, /[ऀ-ॿ]/, "description has no Devanagari");
});

test("descriptions are a sensible length and not keyword-stuffed", () => {
  for (const locale of LOCALES) {
    const seo = buildCalculatorSeo(locale);
    assert.ok(seo.title.length <= 65, `${locale} title too long: ${seo.title.length}`);
    assert.ok(seo.description.length >= 80, `${locale} description too short`);
    assert.ok(seo.description.length <= 220, `${locale} description too long`);
    // "GST" is unavoidable in a GST calculator, but it should read as
    // prose. Counted standalone, so CGST/SGST/IGST are not double-charged.
    const gstCount = (seo.description.match(/\bGST\b/g) ?? []).length;
    assert.ok(gstCount <= 4, `${locale} repeats GST ${gstCount} times`);
  }
});

test("canonicals are absolute and self-referencing", () => {
  for (const locale of LOCALES) {
    const seo = buildCalculatorSeo(locale);
    assert.equal(seo.canonical, `${SITE_URL}${calculatorPath(locale)}`);
    assert.ok(seo.canonical.startsWith("http"), "canonical must be absolute");
    assert.equal(seo.canonical, seo.openGraph.url, "og:url must match canonical");
  }
});

test("every locale advertises the same alternate set", () => {
  const en = buildCalculatorSeo("en");
  const hi = buildCalculatorSeo("hi");
  assert.deepEqual(en.languages, hi.languages, "hreflang must be reciprocal");
  assert.deepEqual(Object.keys(en.languages).sort(), ["en-IN", "hi-IN", "x-default"]);
  for (const url of Object.values(en.languages)) {
    assert.ok(url.startsWith(`${SITE_URL}/`), `alternate not absolute: ${url}`);
  }
  assert.equal(en.languages["x-default"], `${SITE_URL}/en/gst-calculator`);
});

test("Open Graph locale uses underscores and lists the other language", () => {
  assert.equal(toOpenGraphLocale("hi-IN"), "hi_IN");
  assert.equal(buildCalculatorSeo("en").openGraph.locale, "en_IN");
  assert.deepEqual(buildCalculatorSeo("en").openGraph.alternateLocales, ["hi_IN"]);
  assert.deepEqual(buildCalculatorSeo("hi").openGraph.alternateLocales, ["en_IN"]);
});

test("Twitter card mirrors the page", () => {
  const seo = buildCalculatorSeo("en");
  assert.equal(seo.twitter.card, "summary_large_image");
  assert.equal(seo.twitter.title, seo.title);
  assert.equal(seo.twitter.description, seo.description);
});

test("supporting pages carry a canonical but claim no translations", () => {
  const d = getDictionary("en");
  const seo = buildStaticPageSeo({
    path: STATIC_PATHS.privacy,
    title: d.privacy.title,
    description: d.privacy.description,
  });
  assert.equal(seo.canonical, `${SITE_URL}/privacy`);
  assert.deepEqual(seo.languages, {}, "must not claim hreflang it does not have");
  assert.match(seo.title, /GST Calculator$/);
});

// --- structured data --------------------------------------------------

test("JSON-LD describes the tool honestly", () => {
  for (const locale of LOCALES) {
    const data = buildCalculatorJsonLd(locale);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "WebApplication");
    assert.equal(data.applicationCategory, "FinanceApplication");
    assert.equal(data.isAccessibleForFree, true);
    assert.equal(data.url, `${SITE_URL}${calculatorPath(locale)}`);
    assert.equal(data.inLanguage, locale === "en" ? "en-IN" : "hi-IN");
    assert.ok(data.name.length > 0);
    assert.ok(data.description.length > 0);
  }
});

test("JSON-LD invents no ratings, reviews, prices or organization", () => {
  const keys = Object.keys(buildCalculatorJsonLd("en"));
  for (const banned of [
    "aggregateRating",
    "review",
    "ratingValue",
    "offers",
    "price",
    "publisher",
    "author",
    "organization",
    "faqPage",
  ]) {
    assert.ok(!keys.includes(banned), `fabricated ${banned}`);
  }
});

test("JSON-LD serializes to valid JSON and cannot close its script tag", () => {
  const serialized = serializeJsonLd(buildCalculatorJsonLd("hi"));
  assert.doesNotMatch(serialized, /</, "unescaped < would break out of <script>");
  const parsed = JSON.parse(serialized);
  assert.equal(parsed["@type"], "WebApplication");
  assert.equal(parsed.inLanguage, "hi-IN");

  const nasty = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
  assert.doesNotMatch(nasty, /<\/script>/);
  assert.equal(JSON.parse(nasty).name, "</script><script>alert(1)</script>");
});

test("WebSite JSON-LD states only what the page verifies", () => {
  const data = buildWebSiteJsonLd();
  assert.equal(data["@type"], "WebSite");
  assert.equal(data.url, `${SITE_URL}/`);
  assert.ok(data.name.length > 0);
  assert.deepEqual(data.inLanguage, ["en-IN", "hi-IN"]);
  for (const banned of [
    "potentialAction",
    "publisher",
    "author",
    "organization",
    "sameAs",
    "aggregateRating",
  ]) {
    assert.ok(!(banned in data), `fabricated ${banned}`);
  }
  assert.equal(JSON.parse(serializeJsonLd(data))["@type"], "WebSite");
});

// --- sitemap and robots -----------------------------------------------

test("sitemap lists every indexable route once, absolutely", () => {
  const entries = buildSitemap();
  const urls = entries.map((entry) => entry.url);

  assert.deepEqual(urls, indexablePaths().map((path) => `${SITE_URL}${path}`));
  assert.equal(new Set(urls).size, urls.length, "duplicate URL in sitemap");
  for (const url of urls) assert.ok(url.startsWith("http"), url);
});

test("every sitemap entry carries a truthful ISO last-modified date", () => {
  for (const entry of buildSitemap()) {
    assert.match(
      entry.lastModified,
      /^\d{4}-\d{2}-\d{2}$/,
      `${entry.url} lastModified is not an ISO date`,
    );
    assert.ok(
      !Number.isNaN(Date.parse(entry.lastModified)),
      `${entry.url} lastModified is not a real date`,
    );
    assert.ok(
      Date.parse(entry.lastModified) <= Date.now(),
      `${entry.url} lastModified is in the future`,
    );
  }
});

test("sitemap excludes the root redirect and any internal route", () => {
  const urls = buildSitemap().map((entry) => entry.url);
  assert.ok(!urls.includes(`${SITE_URL}/`), "root is a redirect, not a page");
  for (const url of urls) {
    assert.doesNotMatch(url, /\/_next|\/api\/|sitemap\.xml|robots\.txt/, url);
  }
});

test("sitemap carries hreflang alternates on the calculator pages only", () => {
  const entries = buildSitemap();
  const calculators = entries.filter((entry) => entry.url.includes("gst-calculator"));
  const supporting = entries.filter((entry) => !entry.url.includes("gst-calculator"));

  assert.equal(calculators.length, 2);
  for (const entry of calculators) {
    assert.deepEqual(Object.keys(entry.alternates?.languages ?? {}), ["en-IN", "hi-IN"]);
    assert.equal(entry.priority, 1);
  }
  for (const entry of supporting) {
    assert.equal(entry.alternates, undefined);
    assert.ok(entry.priority < 1);
  }
});

test("robots allows crawling and points at the sitemap once configured", () => {
  // The suite runs with NEXT_PUBLIC_SITE_URL unset, so this asserts the
  // safe default: an unconfigured deployment is not indexable.
  const robots = buildRobots();
  assert.equal(robots.rules.userAgent, "*");
  assert.equal(robots.rules.disallow, "/");
  assert.equal(robots.sitemap, undefined, "must not advertise a placeholder sitemap");
});

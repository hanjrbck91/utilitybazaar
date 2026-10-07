# UtilityBazaar — Architecture

A bilingual (English/Hindi) collection of small calculator tools for
Indian users. There is no backend: every calculation runs in the browser,
and every page is prerendered at build time.

The original product spec for the GST Calculator is in
[BLUEPRINT_V1.0.md](BLUEPRINT_V1.0.md). This document describes the code
as it is now.

## 🔒 Frozen foundation (2026-10-06)
These decisions are accepted. Change them only with an explicit
milestone that says so:
- Locale-prefixed routes (`/en/...`, `/hi/...`); `/` → `/en` (308).
- One folder set per tool (the calculator-module pattern below).
- `routes.ts` is the only place paths are defined.
- Metadata is built as plain data (`PageSeo`). JSON-LD is minimal and
  true. Hand-maintained sitemap `LAST_MODIFIED`.
- Static pages are English-only, rendered by `StaticPage.tsx`.
- No backend; user values never leave the browser; analytics uses an
  allowlist.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3.8 (App Router) — see `AGENTS.md`: this version differs from older Next.js; read `node_modules/next/dist/docs/` before changing framework-level code |
| UI | React 19.2, Tailwind CSS 4, `lucide-react` icons |
| Language | TypeScript |
| Tests | `node:test` running `.ts` directly (`npm test`), **Node ≥ 22.6** (verified on 22.23.3); 149 tests |
| Hosting | Vercel, deployed from GitHub `main` |

## Directory map

```
src/
├── app/
│   ├── [locale]/                 # localized pages; owns <html lang>
│   │   ├── layout.tsx            # validates locale, prerenders en + hi
│   │   ├── page.tsx              # tools hub (homepage)
│   │   ├── gst-calculator/       # page.tsx + opengraph-image.tsx
│   │   └── percentage-calculator/
│   ├── (site)/                   # English-only static pages
│   │   ├── layout.tsx
│   │   └── about/ privacy/ terms/
│   ├── sitemap.ts, robots.ts     # thin wrappers over lib/seo/sitemap.ts
│   └── favicon.ico, icon.svg, apple-icon.png
├── components/
│   ├── gst-calculator/           # GST-only UI
│   ├── percentage-calculator/    # Percentage-only UI
│   ├── home/ToolsList.tsx        # homepage catalogue
│   ├── StaticPage.tsx            # shell for about/privacy/terms
│   └── …                         # shared: Faq, CopyButton, AdSlot, Analytics,
│                                 #   LanguageToggle, LocaleProvider, OtherCalculators, …
├── lib/
│   ├── gst/, percentage/         # per-tool engine, math, validate, format (+ tests)
│   ├── i18n/                     # locales, dictionary lookup, interpolate()
│   ├── seo/                      # metadata.ts, jsonld.ts, sitemap.ts (+ tests)
│   ├── routes.ts                 # every path in one place
│   ├── config.ts                 # NEXT_PUBLIC_* env handling
│   ├── analytics/                # allowlisted event contract
│   ├── share/, speech/           # generic share + Indian-language speech
│   └── copy.ts, fonts.ts, cn.ts
└── translations/{en,hi}/
    ├── shell.ts                  # nav, About/Privacy/Terms, language switcher
    ├── home.ts                   # homepage
    ├── gst-calculator.ts
    ├── percentage-calculator.ts
    └── index.ts                  # composes the dictionaries
```

## Core patterns

### Calculator module pattern (since `074f8aa`)
Each tool keeps its own code in parallel folders:
`lib/<tool>/` (engine, math, validation, formatting, tests),
`components/<tool>/` (UI), `translations/{en,hi}/<tool>.ts` (strings) and
`app/[locale]/<tool>/` (page + OG image). `components/` and `lib/` hold
only code that more than one tool actually shares.

### Routing
`src/lib/routes.ts` is the only place paths are defined. Pages, the
sitemap, canonicals, hreflang maps and in-app links all import from it.
`/` permanently redirects to `/en` (`next.config.ts`).

### i18n
- `LOCALES = ["en", "hi"]`, with `en` as the default and `x-default`.
- Each locale has separate dictionaries for the GST tool, the
  Percentage tool, the Salary tool and the homepage (`getDictionary`,
  `getPercentageDictionary`, `getSalaryDictionary`, `getHomeDictionary`).
  An unknown locale falls back to English. The Salary dictionary exists,
  but no page uses it yet (M15.2).
- Static pages are English-only, so they get a canonical URL but no
  hreflang alternates.

### SEO
- `SITE_NAME = "UtilityBazaar"` (`lib/seo/metadata.ts`).
- `PageSeo` builders return metadata as plain data, so tests can check
  it without rendering: `buildHomeSeo`, `buildCalculatorSeo`,
  `buildPercentageCalculatorSeo`, `buildStaticPageSeo` (title format
  `"<Title> — UtilityBazaar"`).
- JSON-LD includes `WebSite` (site name) and `WebApplication` plus
  `FAQPage` on each calculator. It is kept minimal and true: no
  ratings, prices or Organization claims.
- `LAST_MODIFIED` in `lib/seo/sitemap.ts` is set by hand from git
  history. Update it only when a route's content actually changes.
- If `NEXT_PUBLIC_SITE_URL` is not set, `robots.txt` disallows the
  whole site.

### Privacy
- User-entered values never leave the browser.
- Analytics events use an allowlist (`lib/analytics/events.ts`):
  amounts and results can never be sent, only the mode, locale and
  preset rates.
- GA and AdSense render nothing unless their environment variables are
  set. Both are currently unset in production.

## Adding a new tool (e.g. M15 Salary Calculator)

The touch points as the code stands today:

1. `lib/<tool>/`: engine, validation, formatting, tests.
2. `components/<tool>/`: Calculator, ResultCard, SupportingContent,
   OtherCalculators.
3. `translations/{en,hi}/<tool>.ts`, wired into `translations/*/index.ts`.
   Add its dictionary type and getter in `lib/i18n/`.
4. `app/[locale]/<tool>/page.tsx` and `opengraph-image.tsx`.
5. `lib/routes.ts`: `<tool>Path()`, a language-alternates map, and an
   entry in `indexablePaths()`.
6. `lib/seo/metadata.ts` and `jsonld.ts`: SEO, WebApplication and FAQ
   builders.
7. `lib/seo/sitemap.ts`: entries and a `LAST_MODIFIED` key.
8. The homepage `ToolsList.tsx` and every existing tool's
   `OtherCalculators.tsx` cross-links, plus the About page copy in
   `shell.ts`.
9. Optionally, analytics events in `lib/analytics/events.ts`. Its
   schema is GST-oriented today.

Each tool currently has its own copy of the builders, alternates maps
and cross-link lists; there is no tool registry. A third tool is the
natural point to decide whether to merge them.

## Environment

| Variable | Purpose | Production |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Origin for canonicals, OG, sitemap, robots | `https://utilitybazaar.in` |
| `NEXT_PUBLIC_GA_ID` | GA4; empty = no script, no cookies | unset |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense; empty = no ad markup | unset |

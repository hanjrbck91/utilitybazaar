# UtilityBazaar — Current State

> Read this first in a new session. Update it whenever production changes.
> History: [milestones/UTILITYBAZAAR_MILESTONES.md](milestones/UTILITYBAZAAR_MILESTONES.md) ·
> Code structure: [UTILITYBAZAAR_ARCHITECTURE.md](UTILITYBAZAAR_ARCHITECTURE.md)

**Updated:** 2026-10-07 · **Status:** 🔒 **FOUNDATION FROZEN** (+ M14.5 security maintenance) · **Next:** M15 — Salary Calculator

## What UtilityBazaar is
An India-focused, bilingual (English/Hindi) site of small, free calculators.
Everything runs in the browser: no accounts and no backend, and values
users enter are never sent to a server.

## Source of truth
| | |
|---|---|
| GitHub | https://github.com/hanjrbck91/utilitybazaar, branch `main` (only branch, no tags) |
| Production | https://utilitybazaar.in (Vercel project `utility-bazaar`; every push to `main` deploys to Production) |
| Production verified at | `3376302` (2026-10-07, deployment "success"; live client reports Next 16.3.8). Later commits are documentation only. |
| Last code change | `3376302` (M14.5, `next` 16.3.3 → 16.3.8) |

The previous working copy (office laptop) and the Drive ZIP backup were
lost. The repo was re-cloned on 2026-10-06; GitHub and production
matched, and nothing newer was found.

## Product snapshot
- **Locales:** `en` (default, `x-default`), `hi`
- **Tools:** GST Calculator, Percentage Calculator (both EN + HI)
- **Pages:** `/en`, `/hi` (tools hub) · `/{en,hi}/gst-calculator` ·
  `/{en,hi}/percentage-calculator` · `/about`, `/privacy`, `/terms` (English only)
- **`/`:** 308 redirect to `/en`
- **Sitemap:** 9 URLs (everything above except `/`) · **robots:** allow all + sitemap
- **Site name:** `UtilityBazaar` (titles, `og:site_name`, WebSite JSON-LD)
- **Analytics / AdSense:** both off (env vars unset; no scripts or markup served)

## Verification baseline (re-run at M14.5, 2026-10-07)
| Check | Result |
|---|---|
| `npm ci` | pass (lockfile consistent) |
| `npm test` | **149/149 pass** |
| `npm run lint` | pass (0 problems) |
| `npm run build` | pass, 20 static pages, no warnings |
| Production | all routes 200, `/` → `/en`, both calculators correct in EN/HI, copy + FAQ work, SEO/hreflang/JSON-LD/sitemap/robots unchanged, no console errors |

Environment: Node 22.23.3, npm 10.9.9, **Next 16.3.8** (Turbopack),
`eslint-config-next` 16.3.3 (left as-is on purpose).

- **Node ≥ 22.6 is required.** `npm test` runs `node --test` on `.ts`
  files and needs native type stripping. Node 20 cannot run it. The repo
  has no `.nvmrc` or `engines` field.
- The real test count is **149**. A "156" reported for M14.1 was a
  miscount: git shows 142 → 149 at M14.1 and 149 at M14.2.
- **Lockfile caution (Windows):** `npm install` on Windows strips the
  `"libc": ["glibc"|"musl"]` fields from Linux optional packages (`sharp`,
  `lightningcss`, `@tailwindcss/oxide`, `@next/swc`, `@unrs/resolver`).
  Vercel builds on Linux and needs those fields. After any dependency
  change, check the lockfile diff and keep the `libc` lines.

## Known limitations (non-blocking)
- **Stale Google listing:** "Terms — GST Calculator - Utility Bazaar" comes
  from the pre-M14.1 `SITE_NAME = "GST Calculator"`. Production serves
  "Terms — UtilityBazaar". Leave it for Google to recrawl; don't change
  code for it.
- **Copy button in embedded/automated browsers:** where clipboard-write
  permission is denied, the button shows "Couldn't copy". This is
  intended behaviour, not a bug.
- **OG image routes accept any locale segment:**
  `/zz/gst-calculator/opengraph-image` returns 200 with the same static card.
- **Static pages are English-only** and have no hreflang (by design).

## Deferred work (explicit, not part of the frozen foundation)
1. Remaining `npm audit` items: 8 high, 0 critical, all in dev tooling or
   transitive packages: the `eslint-config-next` chain (`braces`,
   `micromatch`, `fast-glob`, `@next/eslint-plugin-next`), `sharp`,
   `source-map-js`, `brace-expansion`. Most have non-breaking fixes
   (`sharp` 0.35.5, `source-map-js` 1.2.2, `brace-expansion`, and
   `eslint-config-next` 16.3.8). For the `braces` issue reached through
   `fast-glob`, no patched release exists.
2. `npm ci` warns that `eslint@9.39.5` is deprecated. This predates M14.5.
3. **Sitemap `LAST_MODIFIED.calculator`** is `2026-08-28`, but the GST
   sources last changed on 2026-09-12. This predates M14.2 and was left
   out of M14.4.1 on purpose.
4. Add `.nvmrc` / `engines` pinning Node 22.
5. `README.md` is still the create-next-app boilerplate.
6. A shared tool registry, to replace the per-tool copies of route, SEO and
   cross-link code. Decide this when adding the third tool.

**Completed from this list:** `next` 16.3.3 → 16.3.8 fixing critical
GHSA-vcvr-r3jv-pc5j (RCE in `next/og` `ImageResponse`). Done in M14.5,
`3376302`.

## Next milestone
**M15 — Salary Calculator.** Follow "Adding a new tool" in the
architecture doc.

# UtilityBazaar — Current State

> Read this first in a new session. Update it whenever production changes.
> History: [milestones/UTILITYBAZAAR_MILESTONES.md](milestones/UTILITYBAZAAR_MILESTONES.md) ·
> Code structure: [UTILITYBAZAAR_ARCHITECTURE.md](UTILITYBAZAAR_ARCHITECTURE.md)

**Updated:** 2026-10-08 · **Status:** 🔒 **FOUNDATION FROZEN** (+ M14.5 security maintenance) · ✅ **M15 Salary Calculator live** (M15.6, `3840520`) · 🔄 **M15.7** nav fix committed locally (`3c38736`, not pushed) + SEO diagnostic · **Next:** release M15.7, then Search Console baseline

## What UtilityBazaar is
An India-focused, bilingual (English/Hindi) site of small, free calculators.
Everything runs in the browser: no accounts and no backend, and values
users enter are never sent to a server.

## Source of truth
| | |
|---|---|
| GitHub | https://github.com/hanjrbck91/utilitybazaar, branch `main` (only branch, no tags). **Source of truth** for production. |
| Production | https://utilitybazaar.in (Vercel project `utility-bazaar`; every push to `main` deploys to Production) |
| Production verified at | **`3840520`** (M15.6, 2026-10-07): CI success, Vercel automatic Production deployment "success", full smoke + SEO check on utilitybazaar.in. Later commits, if any, are documentation only. |
| Last code change | `240b039` (M15.4, salary SEO + integration). `3840520` added CI only. |

The previous working copy (office laptop) and the Drive ZIP backup were
lost. The repo was re-cloned on 2026-10-06; GitHub and production
matched, and nothing newer was found.

## Deployment pipeline (M15.5, verified 2026-10-07)
```
feature branch → push → CI (GitHub Actions) + Vercel Preview
   → (optional PR) → merge / push main → CI + Vercel Production
```
- **Local, before every commit:** `npm test`, `npm run lint`,
  `npm run build` (Node 22). `npx tsc --noEmit` is optional locally;
  `next build` already runs the full type check.
- **GitHub `main` = production source.** Vercel's GitHub integration
  deploys every push to `main` to Production and every other branch to a
  Preview (`*.vercel.app`, `X-Robots-Tag: noindex`).
- **CI = verification only:** `.github/workflows/ci.yml` runs on every
  branch push (and on fork PRs): `npm ci` → `npm test` → `npm run lint`
  → `npm run build`. No secrets, never deploys.
- **Rule: no manual Vercel deployments** (no dashboard "Deploy"/"Redeploy",
  no `vercel` CLI deploys). Production changes only by pushing `main`.
- **Not a gate yet:** CI does **not** block Vercel. A push to `main`
  deploys even if CI fails (no branch protection; Vercel does not wait
  for Actions). Vercel's own build does fail on type/build errors, so a
  broken build never goes live, but failing tests or lint would. Run the
  local checks (or wait for green CI on a branch) before pushing `main`.
- Details and evidence: [UTILITYBAZAAR_ARCHITECTURE.md](UTILITYBAZAAR_ARCHITECTURE.md) → "Deployment pipeline".

## Product snapshot
> **Repo = production** since M15.6 (`3840520`, 2026-10-07).

- **Locales:** `en` (default, `x-default`), `hi`
- **Tools:** GST Calculator, Percentage Calculator, Salary Calculator
  (CTC → in-hand), all EN + HI
- **Pages:** `/en`, `/hi` (tools hub) · `/{en,hi}/gst-calculator` ·
  `/{en,hi}/percentage-calculator` · `/{en,hi}/salary-calculator` ·
  `/about`, `/privacy`, `/terms` (English only)
- **`/`:** 308 redirect to `/en`
- **Sitemap:** **11** URLs (everything above except `/`) · **robots:** allow all + sitemap
- **Site name:** `UtilityBazaar` (titles, `og:site_name`, WebSite JSON-LD)
- **Analytics / AdSense:** both off (env vars unset; no scripts or markup served)

## Verification baseline (re-run at M15.6, 2026-10-07)
| Check | Result |
|---|---|
| `npm ci` | pass (lockfile consistent) |
| `npm test` | **250/250 pass** |
| `npm run lint` | pass (0 problems) |
| `npm run build` | pass, 24 static pages |
| GitHub Actions | `CI` run 37579286191 on `3840520`: success |
| Production | all routes 200, `/` → `/en`, unknown locale 404; all three calculators correct in EN/HI (salary figures equal direct engine results); sitemap 11 URLs; SEO/hreflang/JSON-LD correct on all six calculator pages; no console errors |

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
3. ~~Sitemap `LAST_MODIFIED.calculator` stale~~. Resolved in M15.4:
   every route's date is now 2026-10-07, because each page's content
   changed (new salary links or copy).
4. Add `.nvmrc` / `engines` pinning Node 22. (CI pins `22.x` in the
   workflow. `engines` would also change Vercel's build Node version, so
   decide it deliberately.)
5. `README.md` is still the create-next-app boilerplate.
6. A shared tool registry, to replace the per-tool copies of route, SEO and
   cross-link code. Decide this when adding the third tool.
7. Optional: make CI a real gate (branch protection on `main` requiring
   the `verify` check, plus PR-only merges). Today it only reports.
8. Vercel project settings were not read directly (see the architecture
   doc). Confirm them in the dashboard: build/install command overrides,
   Node.js version, environment variables, and Preview deployment
   protection.

**Completed from this list:** `next` 16.3.3 → 16.3.8 fixing critical
GHSA-vcvr-r3jv-pc5j (RCE in `next/og` `ImageResponse`). Done in M14.5,
`3376302`.

## In progress: M15 — Salary Calculator
- **M15.1 done:** the pure engine in `src/lib/salary/`. It is not used by
  any page yet, so production is unchanged. The repo test count is now
  **212** (149 existing + 63 salary). Research, statutory sources and
  limitations are in
  [milestones/M15.1_SALARY_ENGINE_RESEARCH.md](milestones/M15.1_SALARY_ENGINE_RESEARCH.md).
- **Maintenance note:** salary statutory values (tax slabs, rebate,
  standard deduction, surcharge, cess, EPF ceiling) live in
  `src/lib/salary/constants.ts`. Re-check them after every Budget or
  EPFO notification.
- **M15.2 done:** EN/HI salary dictionaries (`enSalary` / `hiSalary`,
  `getSalaryDictionary()`). These aren't used by any page yet. The repo
  test count is now **221**.
- **M15.3 done (local only, not deployed):** the salary page exists at
  `/{en,hi}/salary-calculator`. It works end to end, but has **provisional
  metadata with `noindex`**, is not in the sitemap, and isn't linked from
  the homepage or the other tools yet. The local build has 22 static pages
  (production still has 20). The repo test count is now **243**.
- **M15.4 done (local only, not deployed):** the salary pages are
  **indexable**. They have:
  - final EN/HI titles and descriptions;
  - self-referencing canonicals with reciprocal `en-IN` / `hi-IN` /
    `x-default` hreflang;
  - Open Graph and Twitter tags, and an OG image;
  - `WebApplication` JSON-LD ("UtilityBazaar Salary Calculator") plus
    `WebSite` and `FAQPage` (6 FAQs);
  - final supporting content.

  They are also in the sitemap (11 URLs) and linked from the homepage,
  from GST and Percentage "Other calculators", and from the About copy.
  The local build has 24 static pages. The repo test count is now
  **250**.
- **M15.5 done (local commit, not pushed):** CI pipeline
  (`.github/workflows/ci.yml`) plus the deployment contract above.
  Exercised on a temporary branch (pass, failing-test and type-error
  runs), which was then deleted. Production unchanged.
- **M15.6 done: released.** `main` was pushed `6bab0d9..3840520` (normal
  push). CI was green, and Vercel created the Production deployment
  automatically (vercel[bot], 06:02 UTC). No manual deployment.
  Production verification is in the milestones entry.
- **Next:** not defined yet. M15.7 has not been started.

## In progress: M15.7 — UX navigation + SEO diagnostic
- **UX (`3c38736`, local, not pushed):** calculator headers now show a
  "UtilityBazaar" link to the localized homepage (`/en` or `/hi`) beside
  the language switch. Homepage header unchanged. 250/250 tests, lint and
  build clean; browser-verified EN/HI, desktop and 375px.
- **SEO diagnostic:** [milestones/M15.7_SEO_DIAGNOSTIC.md](milestones/M15.7_SEO_DIAGNOSTIC.md).
  Not technically broken, indexed fast, but no ranking in the top ~40–50
  for head terms. The domain was registered 2026-08-28 (it was a Shopify
  store 2021–23) and has no visible links. Search Console is not
  connected; that data is the next step.
- **Owner action (Vercel dashboard):** `www.utilitybazaar.in` serves 200
  duplicates; set it to redirect to the apex.

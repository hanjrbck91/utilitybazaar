# UtilityBazaar — Milestones

Rules: work one milestone at a time. A milestone is complete only once
its acceptance criteria have been verified, not when the code is written.
Record the commit hash for each milestone. Keep entries short.

Key: ✅ complete · 🔄 in progress · 🔜 planned · 🔒 frozen

## Summary

| Milestone | Status | Commit |
|---|---|---|
| Pre-M14 (GST V1 → Percentage Calculator) | ✅ | `c9d4c9c` … `14929e1` |
| M14.1 Foundation Cleanup + Tools Hub | ✅ | `e1f6d4f` |
| M14.2 About Page Polish | ✅ | `0b1d219` |
| M14.3 Repository Recovery Audit | ✅ | — (audit only) |
| M14.4.1 Final Cleanup | ✅ | `2acc63d` |
| M14.4.2 Test / Lint / Build | ✅ | N/A (no fixes needed) |
| M14.4.3 Production Verification | ✅ | deployed `7aa19ef` |
| **UtilityBazaar Foundation** | 🔒 **FROZEN** 2026-10-06 | `7aa19ef` + docs |
| M14.5 Next.js Security Maintenance | ✅ | `3376302` |
| M15 Salary Calculator | 🔄 | — |
| M15.1 Salary engine (research + pure engine) | ✅ | `71e6da8` |
| M15.2 Salary translations (EN/HI) | ✅ | see M15.2 entry |

---

## Pre-M14 (rebuilt from git; only M9 is numbered in git)
- **2026-08-27, GST Calculator V1:** engine, UI, Hindi audio and sharing,
  SEO/analytics/AdSense readiness (`c9d4c9c`–`400d704`).
- **2026-08-28, M9 Production Foundation:** SEO, headers, routing, and the
  first Vercel deploy (`c8dc43b`, `27c0121`).
- **2026-08-29 → 30:** UtilityBazaar V1 branding, GST SEO content, FAQ UX.
- **2026-09-12:** responsive layout; calculator-module refactor `074f8aa`;
  Percentage Calculator `f19870d`; copy-result action (142 tests at `14929e1`).

## M14.1 — Foundation Cleanup + Tools Hub ✅ `e1f6d4f` (2026-09-18)
- `SITE_NAME` changed from "GST Calculator" to "UtilityBazaar", which also
  renamed the WebSite JSON-LD.
- Real `/en` and `/hi` homepages, each a tools hub listing GST and Percentage.
- `/` now redirects to `/en`, and the sitemap grew to 9 URLs.
- Tests 149 (+7). The "156" in the original report was a miscount.

## M14.2 — About Page Polish ✅ `0b1d219` (2026-09-18)
- About page rewritten for a multi-tool site. The privacy line is now
  "not sent to our servers".
- On static pages, "Back to UtilityBazaar" replaces the old back link, and
  the footer link "Tools" points to `/en`.
- Tests 149, unchanged.

## M14.3 — Repository Recovery Audit ✅ (2026-10-06)
- Laptop and Drive backup lost; re-cloned from GitHub.
- GitHub `main` = production = `0b1d219`. No other branches, tags or
  newer work. Status: **fully recovered**.

## M14.4.1 — Final Cleanup ✅ `2acc63d` (2026-10-06)
- `package.json` / `package-lock.json` name: `gst-calculator` → `utilitybazaar`.
- `LAST_MODIFIED.supporting` changed `2026-08-27` → `2026-09-18`, because
  StaticPage and shell.ts changed in M14.2.
- `buildSitemap()` comment corrected: `/` goes to `/en`, and hreflang
  covers the homepage too.
- Verified: only these 3 files changed, no architecture change, 149/149.

## M14.4.2 — Test / Lint / Build ✅ (no commit, nothing to fix)
- Node 22.23.3 / npm 10.9.9: `npm ci` ok, **149/149**, lint clean,
  build clean (20 static pages, no warnings), and the built sitemap has
  the new dates.

## M14.4.3 — Production Verification ✅ (2026-10-06)
Full browser check run on live `0b1d219`, then repeated on `7aa19ef`
(Vercel Production deployment "success", 17:03 UTC):
- `/` → 308 `/en`; all 10 routes return 200.
- Hub lists both tools in EN and HI with the correct locale links.
- GST: ₹10,000 + 18% = ₹11,800 and Remove → ₹8,474.58; IGST toggle works.
- Percentage: 15% of 240 = 36, and 80 → 100 = 25% increase.
- Copy puts only the value on the clipboard ("Copied!"); FAQ accordions open.
- Every page has the correct title, canonical and hreflang (localized
  pages), `og:site_name` UtilityBazaar, and WebSite + WebApplication +
  FAQPage JSON-LD on the calculators.
- Favicons present; no GST-only site identity; no console errors; all
  requests return 200.
- After deploy: the live sitemap shows `2026-09-18` for
  about/privacy/terms; GST ₹2,500 + 18% = ₹2,950; HI 20% of 50 = 10.

## 🔒 UtilityBazaar Foundation — FROZEN (2026-10-06)
Accepted as-is: architecture, routing, calculator-module pattern, SEO
foundation, EN/HI structure, static pages. At freeze: 149/149 tests,
lint clean, build clean, production verified.
Rules: no feature changes to the foundation. Deferred items live in
`UTILITYBAZAAR_CURRENT_STATE.md`.

## M14.5 — Next.js Security Maintenance ✅ `3376302` (2026-10-07)
- **Status:** COMPLETE. The foundation stays frozen; this was a
  dependency-only change.
- **Version:** `next` 16.3.3 → 16.3.8. It fixes GHSA-vcvr-r3jv-pc5j
  (critical, RCE in `next/og`), which was not exploitable here.
- **Changed:** `package.json` (1 line) and the lockfile entries for
  `next`, `@next/env` and `@next/swc-*` only. `eslint-config-next` stays
  16.3.3. No audit fixes; the lockfile `libc` fields are preserved.
- **Tests:** 149/149 · **Lint:** clean · **Build:** clean (20 static
  pages, no warnings) on Node 22.23.3.
- **Production:** VERIFIED. Deployment of `3376302` succeeded, and the
  live client reports Next 16.3.8. All routes are correct, and both
  calculators work in EN/HI, including copy and the FAQ. SEO, hreflang,
  JSON-LD, sitemap and robots are unchanged; no console errors.
- **Note:** a parallel background session produced a broader upgrade
  (adding `eslint-config-next` and audit fixes). It was not used. Its
  local commit `ce44dcf` is kept only on the local branch
  `backup/bg-next-upgrade`, which was never pushed.

## M15 — Salary Calculator 🔄
CTC → in-hand (take-home) salary. Sub-milestones are recorded below.

### M15.1 — Salary engine ✅ (2026-10-07)
- Research and locked spec:
  [M15.1_SALARY_ENGINE_RESEARCH.md](M15.1_SALARY_ENGINE_RESEARCH.md).
  Every statutory value is checked against official sources (Income-tax
  Act 2025, Budget 2026, EPFO/MoLE, Labour Codes, Constitution).
- **Key current-law findings:** the EPF wage ceiling is **₹25,000** from
  17 Sep 2026; professional tax is **not** deductible under the new regime;
  the Labour Codes' 50% wage floor is in force (21 Nov 2025).
- New `src/lib/salary/` engine (pure). CTC → variable pay, employer
  PF, gratuity → gross → employee PF, professional tax → new-regime tax
  (slabs, ₹75k standard deduction, s.156 rebate with marginal relief,
  surcharge with marginal relief, 4% cess) → monthly and annual take-home.
- Tests 149 → **212** (+63), lint clean, `tsc` clean, build clean (20 pages).
  No existing file changed.
- Not yet built: UI, route, translations, SEO and integration (later M15
  steps).

### M15.2 — Salary translations ✅ (2026-10-07)
- New `src/translations/{en,hi}/salary-calculator.ts`, wired into the
  existing architecture the same way Percentage is:
  - `enSalary` / `hiSalary` dictionaries (shell + tool module);
  - a `SalaryDictionary` type;
  - a `getSalaryDictionary()` getter.
  No existing dictionary, shell string or tool changed.
- **What it covers:** page header, every input and hint, PF modes,
  gratuity, professional tax, results (monthly/annual, regular month),
  breakdown, tax working, the explanation strings (including one for
  each engine flag), every `SalaryErrorCode` plus field-specific
  out-of-range messages, and actions (reset, show/hide breakdown, more
  details).
- **Deliberately not added:**
  - "Calculate": the tools calculate live as you type.
  - "Copy": already in the shared shell.
  - `seo` / `content` (FAQ): SEO milestone.
  - `nav.salaryCalculator`: navigation milestone.
  - No amounts, rates or years in strings: they're `{placeholders}` filled
    from the engine.
- **Hindi:** natural Hinglish. CTC, PF, TDS and Basic + DA stay as on
  payslips, always with Hindi text beside them.
- **Tests:** new `src/lib/salary/i18n.test.ts` (9). It checks:
  - key parity, nothing untranslated, Devanagari in every Hindi string,
    placeholder parity, and only known placeholders;
  - error-code coverage (also enforced at compile time);
  - the dictionary getter.
  Mutation-checked: a missing Hindi key fails 3 tests plus `tsc`; a
  missing error code fails `tsc`.
- Tests 212 → **221**, lint clean, `tsc` clean, build clean (20 pages).
- Not yet built: UI, route, SEO and integration.

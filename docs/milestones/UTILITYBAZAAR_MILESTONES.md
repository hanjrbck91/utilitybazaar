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
| M15.2 Salary translations (EN/HI) | ✅ | `9dea601` |
| M15.3 Salary calculator UI + page | ✅ | `aad7056` |
| M15.4 Salary SEO + content + integration | ✅ | see M15.4 entry |

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

### M15.3 — Salary calculator UI + page ✅ (2026-10-07)
- **Route:** `/en/salary-calculator` and `/hi/salary-calculator`
  (`app/[locale]/salary-calculator/page.tsx`), using the same layout as
  the other calculators: header → calculator → breakdown → other
  calculators → ad slot → supporting content → FAQ → footer.
- **UX:**
  - Annual CTC is the only required input, with an "= 12 lakh a year"
    echo.
  - Monthly in-hand appears directly under it, live, with no Calculate
    button. Annual take-home, regular month, tax regime and estimate are
    shown with it.
  - Variable pay %, Basic + DA % and PF mode follow. Gratuity and
    professional tax sit under "More options".
  - The breakdown shows CTC → parts not paid monthly → gross →
    deductions → take-home, monthly and yearly.
  - The tax working (slabs, rebate, surcharge, marginal relief, cess)
    sits behind a toggle.
  - The assumptions list is always visible and includes a notice for
    each engine flag.
  - Copy copies only the monthly in-hand amount, using the shared
    `CopyButton`.
- **Engine stays the single source of truth:**
  - `components/salary-calculator/model.ts` (pure) is the only engine
    caller.
  - `DEFAULT_PF_MODE` moved into `lib/salary/constants.ts` so the UI
    doesn't duplicate it. Engine behaviour is unchanged.
- **Small, safe integration:**
  - `salaryCalculatorPath()` added to `routes.ts`. It is **not** in
    `indexablePaths()` or the sitemap (still 9 URLs).
  - Minimal `content` (section titles, privacy note, 3 FAQs) and
    `calculator.clear` added to the EN/HI dictionaries. Section bodies
    reuse `explain` strings.
- **Provisional metadata only:** title and description from the
  dictionary, with `robots: noindex`. There's no canonical, hreflang,
  OG, JSON-LD, sitemap entry or OG image yet. **M15.4 must replace this
  and remove `noindex`.**
- **Tests:** 221 → **243** (+22 in `model.test.ts`):
  - every view equals a direct engine result;
  - engine error codes map to the right field and message;
  - rows, tax rows and notices show the engine's own figures;
  - no placeholder is left unfilled in either language;
  - a guard checks that no other UI file calls the engine.
- **Browser-verified** on a local production build (`next start`):
  - Both routes work, and an unknown locale returns 404.
  - Empty state, live updates, all three PF modes, variable pay,
    gratuity, professional tax, tax working and notices all behave
    correctly, and the figures match direct engine calls.
  - Error states: CTC 0, too large, variable 100%, professional tax
    ₹3,000.
  - Escape clears the CTC field, and copy works (clipboard stubbed in
    the test pane).
  - Hindi on a 375px viewport: no horizontal overflow (a breakdown
    column overflow was found and fixed).
  - Desktop layout checked; no console errors.
  - GST, Percentage and the homepage are unchanged.
- Lint clean, `tsc` clean, build clean (**22** static pages: 20 + 2
  salary).
- Not yet built: final SEO/content and FAQ (M15.4), homepage and
  cross-link integration, deployment.

### M15.4 — Salary SEO, content and integration ✅ (2026-10-07)
- **Indexable:** `noindex` removed. Final metadata via
  `buildSalaryCalculatorSeo`:
  - EN title "Salary Calculator — CTC to In-Hand Salary"; HI "सैलरी
    कैलकुलेटर — CTC से इन-हैंड सैलरी निकालें";
  - descriptions cover CTC → monthly in-hand, PF, professional tax,
    variable pay, new-regime income tax and India;
  - self-referencing canonicals; reciprocal hreflang
    (`salaryCalculatorLanguageAlternates`, with `x-default` → EN);
  - Open Graph and Twitter tags.
- **JSON-LD:** `WebApplication` named "UtilityBazaar Salary Calculator"
  (HI: "UtilityBazaar सैलरी कैलकुलेटर"), plus `WebSite` and `FAQPage`
  built from the visible FAQ. No ratings, prices or authors.
- **OG image:** `salary-calculator/opengraph-image.tsx` reads
  "UtilityBazaar / Salary Calculator / CTC → In-Hand Salary" with chips.
  It's Latin-only and shared by both locales, like the other tools.
- **Content:**
  - four final sections: what CTC is, why in-hand pay is lower than
    CTC ÷ 12, how the estimate is built, and why it's an estimate;
  - six FAQs, as specified.
  - Only components the engine actually models are described.
- **Integration:**
  - `nav.salaryCalculator` added to the shell;
  - homepage `ToolsList` has a third card (`tools.salaryDescription`), and
    the homepage description mentions salary;
  - GST and Percentage "Other calculators" link to Salary;
  - the About copy lists all three tools.
- **Sitemap: 11 URLs.** Salary entries carry hreflang alternates. Every
  `LAST_MODIFIED` is now 2026-10-07, because each page's content changed.
  This also clears the old stale-GST-date item. `robots.txt` is
  unchanged.
- **Tests:** 243 → **250** (+7 salary SEO tests). The indexable-path and
  sitemap tests were updated to include salary.
- **Local production build (24 static pages) audited as a crawler sees
  it,** for both EN and HI:
  - title, description, H1, `lang`, canonical, hreflang, OG and Twitter
    tags correct;
  - no `noindex`;
  - 3 valid JSON-LD blocks;
  - no raw keys or placeholders in the visible text.
- **Browser-verified** on desktop and 375px mobile, EN and HI:
  - live result, no overflow, result on the first screen;
  - FAQ, copy and the language switch work;
  - homepage card and GST cross-link navigate correctly;
  - GST and Percentage results unchanged; no console errors.
- Not done: deployment (not pushed).

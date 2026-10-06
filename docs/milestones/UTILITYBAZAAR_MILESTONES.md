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
| M15 Salary Calculator | 🔜 | — |

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

## M15 — Salary Calculator 🔜
Next milestone. Not started. See "Adding a new tool" in the architecture doc.

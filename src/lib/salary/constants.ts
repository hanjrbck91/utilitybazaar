/**
 * Statutory values used by the salary engine — the only place they live.
 *
 * Each value carries its source. Full citations, dates and the line
 * between statutory fact and our own simplifications are in
 * docs/milestones/M15.1_SALARY_ENGINE_RESEARCH.md. When a Budget or a
 * notification changes any of these, update this file, the research
 * note and the tests together.
 */

import type { PfMode } from "./types.ts";

/** Tax year these income-tax values apply to (Income-tax Act, 2025). */
export const TAX_YEAR = "2026-27";

/**
 * New-regime slab rates — Income-tax Act 2025, s.202(1) Table; unchanged
 * for tax year 2026-27 per the Budget 2026 Memorandum, Part II.
 * `upTo` is inclusive; `null` marks the top slab.
 */
export const TAX_SLABS: ReadonlyArray<{ upTo: number | null; rate: number }> = [
  { upTo: 4_00_000, rate: 0 },
  { upTo: 8_00_000, rate: 0.05 },
  { upTo: 12_00_000, rate: 0.1 },
  { upTo: 16_00_000, rate: 0.15 },
  { upTo: 20_00_000, rate: 0.2 },
  { upTo: 24_00_000, rate: 0.25 },
  { upTo: null, rate: 0.3 },
];

/** Standard deduction under s.202 — Income-tax Act 2025, s.19(1) Table S.No.2. */
export const STANDARD_DEDUCTION = 75_000;

/** Rebate — Income-tax Act 2025, s.156(2): up to ₹60,000 if income ≤ ₹12 lakh. */
export const REBATE_INCOME_LIMIT = 12_00_000;
export const REBATE_MAX = 60_000;

/**
 * Surcharge on salary income under s.202 — Budget 2026 Memorandum,
 * Part II ¶3 and ¶4.3 (37% not applicable; capped at 25%). `above` is
 * the total-income threshold that must be exceeded.
 */
export const SURCHARGE_BANDS: ReadonlyArray<{ above: number; rate: number }> = [
  { above: 50_00_000, rate: 0.1 },
  { above: 1_00_00_000, rate: 0.15 },
  { above: 2_00_00_000, rate: 0.25 },
];

/** Health and Education Cess on tax + surcharge — Budget 2026 Memorandum. */
export const CESS_RATE = 0.04;

/** Employee (and matching employer) PF rate — EPF scheme, EPFO FAQ. */
export const PF_RATE = 0.12;

/**
 * Statutory PF wage ceiling per month — ₹25,000 from 17 Sep 2026
 * (Gazette S.O. 5109(E); PIB 16 & 23 Sep 2026). Was ₹15,000 from Sep 2014.
 */
export const PF_WAGE_CEILING_MONTHLY = 25_000;

/**
 * Wage floor of the Labour Codes (Code on Social Security 2020 s.2(88),
 * Code on Wages s.2(y), in force from 21 Nov 2025): exclusions above half
 * of all remuneration are added back to wages.
 */
export const STATUTORY_WAGE_FLOOR_PERCENT = 50;

/**
 * Gratuity: 15 days' wages per completed year, where 15 days' wages =
 * monthly wages ÷ 26 × 15 — Code on Social Security 2020, s.53(2) and
 * Explanation 3.
 */
export const GRATUITY_DAYS = 15;
export const GRATUITY_MONTH_DIVISOR = 26;

/** Ceiling on profession tax per person per year — Constitution, Art. 276(2). */
export const PROFESSIONAL_TAX_MAX_ANNUAL = 2_500;

// --- Engine defaults and guard-rails (product choices, not law) -------

/** Default PF wages (Basic + DA) as % of fixed CTC — estimation default. */
export const DEFAULT_PF_WAGES_PERCENT = STATUTORY_WAGE_FLOOR_PERCENT;

/** Default PF mode: 12% of full PF wages (the market convention). */
export const DEFAULT_PF_MODE: PfMode = "full";

/** Largest CTC the engine accepts: ₹10 crore a year. */
export const MAX_ANNUAL_CTC = 10_00_00_000;

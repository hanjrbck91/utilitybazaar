import {
  CESS_RATE,
  REBATE_INCOME_LIMIT,
  REBATE_MAX,
  SURCHARGE_BANDS,
  TAX_SLABS,
} from "./constants.ts";
import type { SlabTaxRow } from "./types.ts";

function roundTo(value: number, decimals: number): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  const shifted = value * factor;
  // Same epsilon nudge as the GST and Percentage engines: decimal values
  // are stored slightly below what is written, so genuine half-way
  // results would otherwise round down.
  const rounded = Math.round(shifted + Math.sign(shifted) * Number.EPSILON * Math.abs(shifted));
  const result = rounded / factor;
  return result === 0 ? 0 : result; // normalise -0
}

/** Round to the nearest whole rupee, half-up. */
export function roundRupee(value: number): number {
  return roundTo(value, 0);
}

/** Round to paise (2 dp), half-up. Used for monthly figures derived by ÷12. */
export function round2(value: number): number {
  return roundTo(value, 2);
}

/** Tax at the s.202 slab rates, slab by slab. `tax` is unrounded; `total` is rounded. */
export function slabTax(taxableIncome: number): { rows: SlabTaxRow[]; total: number } {
  const rows: SlabTaxRow[] = [];
  let lower = 0;
  let sum = 0;

  for (const { upTo, rate } of TAX_SLABS) {
    const upper = upTo ?? Infinity;
    const taxableInSlab = Math.max(0, Math.min(taxableIncome, upper) - lower);
    const tax = taxableInSlab * rate;
    rows.push({ from: lower, to: upTo, rate, taxableInSlab, tax });
    sum += tax;
    lower = upper;
  }

  return { rows, total: roundRupee(sum) };
}

/**
 * Rebate under s.156(2) for income taxed under s.202(1).
 *
 *   (a) income ≤ ₹12 lakh: 100% of tax, at most ₹60,000;
 *   (b) income > ₹12 lakh: the amount by which tax exceeds
 *       (income − ₹12 lakh) — i.e. tax can never exceed the income above
 *       ₹12 lakh (marginal relief).
 * (3) caps the rebate at the tax itself.
 */
export function rebate(taxableIncome: number, tax: number): number {
  if (taxableIncome <= REBATE_INCOME_LIMIT) return Math.min(tax, REBATE_MAX);
  const excessIncome = taxableIncome - REBATE_INCOME_LIMIT;
  return Math.min(tax, Math.max(0, tax - excessIncome));
}

/** Surcharge rate for a given total income (0 below the first band). */
export function surchargeRate(taxableIncome: number): number {
  let rate = 0;
  for (const band of SURCHARGE_BANDS) {
    if (taxableIncome > band.above) rate = band.rate;
  }
  return rate;
}

/** Income tax after rebate, before surcharge and cess, at a given income. */
function netTaxAt(taxableIncome: number): number {
  const tax = slabTax(taxableIncome).total;
  return tax - rebate(taxableIncome, tax);
}

/**
 * Surcharge with marginal relief: tax + surcharge at income I may not
 * exceed tax + surcharge at the band threshold T by more than (I − T).
 * Returns the surcharge actually payable and the relief granted.
 */
export function surcharge(
  taxableIncome: number,
  netTax: number,
): { surcharge: number; relief: number } {
  const rate = surchargeRate(taxableIncome);
  if (rate === 0) return { surcharge: 0, relief: 0 };

  const full = roundRupee(netTax * rate);

  // The threshold of the band this income falls in, and the rate just below it.
  const band = [...SURCHARGE_BANDS].reverse().find((b) => taxableIncome > b.above)!;
  const threshold = band.above;
  const rateAtThreshold = surchargeRate(threshold);
  const atThreshold = netTaxAt(threshold);
  const ceiling = atThreshold + roundRupee(atThreshold * rateAtThreshold) + (taxableIncome - threshold);

  const capped = Math.max(0, Math.min(full, ceiling - netTax));
  return { surcharge: capped, relief: full - capped };
}

/** Health and Education Cess on tax + surcharge, rounded to the rupee. */
export function cess(taxPlusSurcharge: number): number {
  return roundRupee(taxPlusSurcharge * CESS_RATE);
}

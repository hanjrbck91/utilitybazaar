import { round2 } from "./math.ts";

/**
 * Group a string of integer digits in the Indian style: last three
 * digits, then groups of two — "100000" -> "1,00,000".
 *
 * Duplicated in miniature rather than imported from another tool, as
 * `percentage/format.ts` does: the tool modules stay independent.
 */
export function groupIndianDigits(digits: string): string {
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  const head = digits.slice(0, -3);
  return `${head.replace(/\B(?=(\d\d)+(?!\d))/g, ",")},${last3}`;
}

/**
 * Format rupees with Indian digit grouping. Whole rupees show no
 * decimals; values with paise show exactly two.
 *
 *   formatRupees(1200000)    -> "₹12,00,000"
 *   formatRupees(132713.333) -> "₹1,32,713.33"
 *   formatRupees(-1800)      -> "-₹1,800"
 */
export function formatRupees(value: number): string {
  const rounded = round2(Number.isFinite(value) ? value : 0);
  const negative = rounded < 0;
  const abs = Math.abs(rounded);
  const [intPart, fracPart] = abs.toFixed(2).split(".");
  const body = Number.isInteger(abs)
    ? groupIndianDigits(intPart)
    : `${groupIndianDigits(intPart)}.${fracPart}`;
  return `${negative ? "-" : ""}₹${body}`;
}

/**
 * Express an annual amount in lakhs, the way Indian offers are quoted:
 * at most two decimals, trailing zeros trimmed.
 *
 *   toLakhs(1200000) -> 12
 *   toLakhs(1250000) -> 12.5
 */
export function toLakhs(value: number): number {
  return round2(value / 1_00_000);
}

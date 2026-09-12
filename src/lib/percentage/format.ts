import { round2 } from "./math.ts";

/**
 * Group a string of integer digits in the Indian style: last three
 * digits, then groups of two — "100000" -> "1,00,000".
 *
 * Duplicated in miniature from the GST engine's own digit grouping
 * rather than imported from it: the two tools are independent modules,
 * and this is five lines of string formatting, not shared calculation
 * logic.
 */
function groupIndianDigits(digits: string): string {
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  const head = digits.slice(0, -3);
  return `${head.replace(/\B(?=(\d\d)+(?!\d))/g, ",")},${last3}`;
}

/**
 * Format a plain number with Indian digit grouping. No currency symbol —
 * percentage inputs and results are not money.
 *
 *   formatNumber(100000)   -> "1,00,000"
 *   formatNumber(1234.5)   -> "1,234.5"
 *   formatNumber(-1800)    -> "-1,800"
 */
export function formatNumber(value: number): string {
  const rounded = round2(Number.isFinite(value) ? value : 0);
  const negative = rounded < 0;
  const abs = Math.abs(rounded);

  const [intPart, fracPart = ""] = String(abs).split(".");
  const grouped = groupIndianDigits(intPart);
  const body = fracPart ? `${grouped}.${fracPart}` : grouped;

  return `${negative ? "-" : ""}${body}`;
}

/**
 * Format a percentage value: 2 decimal places at most, trailing zeros
 * trimmed, always followed by "%".
 *
 *   formatPercent(20)       -> "20%"
 *   formatPercent(33.333)   -> "33.33%"
 *   formatPercent(18)       -> "18%"
 */
export function formatPercent(value: number): string {
  return `${formatNumber(round2(value))}%`;
}

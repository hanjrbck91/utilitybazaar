import { roundCurrency } from "./math.ts";

export interface FormatOptions {
  /** Prefix with the ₹ symbol. Default `true`. */
  symbol?: boolean;
  /**
   * Fraction digits to show.
   * `"auto"` (default): no decimals for whole rupees, exactly 2 when
   * paise are present.
   */
  decimals?: number | "auto";
}

/**
 * Group a string of integer digits in the Indian style:
 * last three digits, then groups of two.
 *   "100000"  -> "1,00,000"
 *   "1000000" -> "10,00,000"
 *
 * Input is expected to be digits only. Exposed for the UI's amount
 * field, which groups digits live as the user types — it is string
 * formatting, not calculation.
 */
export function groupIndianDigits(digits: string): string {
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  const head = digits.slice(0, -3);
  return `${head.replace(/\B(?=(\d\d)+(?!\d))/g, ",")},${last3}`;
}

/**
 * Format a number as Indian Rupees with Indian digit grouping.
 *
 * Deterministic and locale-independent — does not rely on `Intl`, so
 * output is identical across Node, browsers and CI.
 *
 *   formatINR(1000)                 -> "₹1,000"
 *   formatINR(100000)               -> "₹1,00,000"
 *   formatINR(1234.5)               -> "₹1,234.50"
 *   formatINR(1000, {symbol:false}) -> "1,000"
 */
export function formatINR(value: number, options: FormatOptions = {}): string {
  const { symbol = true, decimals = "auto" } = options;

  const rounded = roundCurrency(Number.isFinite(value) ? value : 0);
  const negative = rounded < 0;
  const abs = Math.abs(rounded);

  const fraction = decimals === "auto" ? (Number.isInteger(abs) ? 0 : 2) : decimals;

  // `rounded` already carries at most 2 dp. Only an explicit request for
  // fewer digits needs further rounding; do it here (round-half-up) so we
  // never depend on Number.prototype.toFixed's half-way behaviour.
  const scale = 10 ** fraction;
  const shown = fraction >= 2 ? abs : Math.round(abs * scale) / scale;

  const [intPart, fracPart = ""] = shown.toFixed(Math.max(fraction, 0)).split(".");
  const grouped = groupIndianDigits(intPart);
  const body = fracPart ? `${grouped}.${fracPart}` : grouped;

  return `${negative ? "-" : ""}${symbol ? "₹" : ""}${body}`;
}

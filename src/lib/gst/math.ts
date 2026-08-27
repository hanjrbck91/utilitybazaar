import { CURRENCY_DECIMALS } from "./constants.ts";

const FACTOR = 10 ** CURRENCY_DECIMALS;

/**
 * Round a monetary value to paise (2 dp) using round-half-up.
 *
 * Note on floating point: a decimal literal like `1.005` is stored as a
 * value slightly *below* 1.005, so exact half-way cases are inherently
 * ambiguous. The epsilon nudge biases genuine half-way results toward
 * "up", which matches user expectation for currency. Callers that need
 * an exact split (e.g. CGST + SGST === gstAmount) should derive the
 * second component by subtraction rather than rounding both halves.
 */
export function roundCurrency(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const shifted = value * FACTOR;
  const rounded = Math.round(shifted + Math.sign(shifted) * Number.EPSILON * Math.abs(shifted));
  const result = rounded / FACTOR;
  return result === 0 ? 0 : result; // normalise -0
}

import {
  MAX_AMOUNT,
  MAX_GST_RATE,
  MIN_AMOUNT,
  MIN_GST_RATE,
} from "./constants.ts";
import { roundCurrency } from "./math.ts";
import type { GstErrorCode, ValidationResult } from "./types.ts";

function fail(code: GstErrorCode, message: string): ValidationResult {
  return { valid: false, code, message };
}

/** A plain non-negative decimal: "10", "10.5", ".5", "0". Rejects "10.", "1.2.3", "1e5". */
const NUMERIC = /^(?:\d+(?:\.\d+)?|\.\d+)$/;

/**
 * Validate a user-supplied amount.
 *
 * Accepts a `number` or a `string`; in strings the ₹ symbol, commas,
 * spaces and underscores are tolerated. On success `value` is the
 * amount rounded to paise.
 */
export function validateAmount(raw: unknown): ValidationResult {
  let n: number;

  if (typeof raw === "number") {
    n = raw;
  } else if (typeof raw === "string") {
    const cleaned = raw.replace(/[₹,\s_]/g, "");
    if (cleaned === "") return fail("EMPTY", "Enter an amount.");
    if (!NUMERIC.test(cleaned)) return fail("NOT_A_NUMBER", "Enter a valid number.");
    n = Number(cleaned);
  } else {
    return fail("EMPTY", "Enter an amount.");
  }

  if (!Number.isFinite(n)) return fail("NOT_A_NUMBER", "Enter a valid number.");
  if (n < 0) return fail("NEGATIVE", "Amount cannot be negative.");
  if (n === 0) return fail("ZERO", "Amount must be greater than zero.");
  if (n < MIN_AMOUNT) return fail("TOO_SMALL", `Amount must be at least ₹${MIN_AMOUNT}.`);
  if (n > MAX_AMOUNT) return fail("TOO_LARGE", "Amount is too large.");

  return { valid: true, value: roundCurrency(n) };
}

/**
 * Validate a GST rate (percent). Accepts a `number` or a `string`
 * (a trailing "%" and spaces are tolerated). `0` is valid (nil-rated).
 */
export function validateRate(raw: unknown): ValidationResult {
  let n: number;

  if (typeof raw === "number") {
    n = raw;
  } else if (typeof raw === "string") {
    const cleaned = raw.replace(/[%\s]/g, "");
    if (cleaned === "") return fail("RATE_NOT_A_NUMBER", "Enter a GST rate.");
    if (!NUMERIC.test(cleaned)) return fail("RATE_NOT_A_NUMBER", "Enter a valid GST rate.");
    n = Number(cleaned);
  } else {
    return fail("RATE_NOT_A_NUMBER", "Enter a valid GST rate.");
  }

  if (!Number.isFinite(n)) return fail("RATE_NOT_A_NUMBER", "Enter a valid GST rate.");
  if (n < MIN_GST_RATE) return fail("RATE_NEGATIVE", "GST rate cannot be negative.");
  if (n > MAX_GST_RATE) return fail("RATE_TOO_LARGE", `GST rate cannot exceed ${MAX_GST_RATE}%.`);

  return { valid: true, value: n };
}

import { MAX_MAGNITUDE } from "./constants.ts";
import type { PercentageErrorCode, ValidationResult } from "./types.ts";

function fail(code: PercentageErrorCode, message: string): ValidationResult {
  return { valid: false, code, message };
}

/** An optionally-negative decimal: "10", "-10.5", ".5", "-.5", "0". Rejects "10.", "1.2.3", "1e5". */
const NUMERIC = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/;

/**
 * Validate a user-supplied number for any percentage field (a rate, a
 * plain number, or one side of a before/after pair). Negative values are
 * accepted here — whether a particular field may sensibly be negative or
 * zero is a decision for the caller, made against the calculation mode.
 *
 * Accepts a `number` or a `string`; in strings commas, spaces, "%" and
 * underscores are tolerated so a value copied from the result can be
 * pasted back in.
 */
export function validateNumber(raw: unknown): ValidationResult {
  let n: number;

  if (typeof raw === "number") {
    n = raw;
  } else if (typeof raw === "string") {
    const cleaned = raw.replace(/[%,\s_]/g, "");
    if (cleaned === "" || cleaned === "-") return fail("EMPTY", "Enter a number.");
    if (!NUMERIC.test(cleaned)) return fail("NOT_A_NUMBER", "Enter a valid number.");
    n = Number(cleaned);
  } else {
    return fail("EMPTY", "Enter a number.");
  }

  if (!Number.isFinite(n)) return fail("NOT_A_NUMBER", "Enter a valid number.");
  if (Math.abs(n) > MAX_MAGNITUDE) return fail("TOO_LARGE", "That number is too large.");

  return { valid: true, value: n };
}

/**
 * Same as {@link validateNumber}, but additionally rejects zero.
 *
 * Used for the "whole" in "X is what % of Y" and the "from" in a
 * percentage-change calculation — both are divisors, so zero would be a
 * division by zero rather than a meaningful result.
 */
export function validateNonZero(raw: unknown): ValidationResult {
  const check = validateNumber(raw);
  if (!check.valid) return check;
  if (check.value === 0) return fail("ZERO_BASE", "This value cannot be zero.");
  return check;
}

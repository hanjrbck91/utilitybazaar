import { MAX_ANNUAL_CTC, PROFESSIONAL_TAX_MAX_ANNUAL } from "./constants.ts";
import type { PfMode, SalaryErrorCode, ValidationResult } from "./types.ts";

function fail(code: SalaryErrorCode, message: string): ValidationResult {
  return { valid: false, code, message };
}

/** An optionally-negative decimal: "10", "-10.5", ".5". Rejects "10.", "1.2.3", "1e5". */
const NUMERIC = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/;

/**
 * Parse a user-supplied number. Accepts a `number` or a `string`; in
 * strings commas, spaces, "₹", "%" and underscores are tolerated, so a
 * value like "₹12,00,000" or "12 %" can be pasted in.
 */
function parseNumber(raw: unknown): ValidationResult {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return fail("NOT_A_NUMBER", "Enter a valid number.");
    return { valid: true, value: raw };
  }
  if (typeof raw === "string") {
    const cleaned = raw.replace(/[₹%,\s_]/g, "");
    if (cleaned === "" || cleaned === "-") return fail("EMPTY", "Enter a number.");
    if (!NUMERIC.test(cleaned)) return fail("NOT_A_NUMBER", "Enter a valid number.");
    return { valid: true, value: Number(cleaned) };
  }
  return fail("EMPTY", "Enter a number.");
}

/** Annual CTC: required, greater than zero, at most ₹10 crore. */
export function validateCtc(raw: unknown): ValidationResult {
  const check = parseNumber(raw);
  if (!check.valid) return check;
  if (check.value <= 0) return fail("NOT_POSITIVE", "CTC must be more than zero.");
  if (check.value > MAX_ANNUAL_CTC) return fail("TOO_LARGE", "That CTC is too large.");
  return check;
}

/** Variable pay as % of CTC: 0 up to (not including) 100. */
export function validateVariablePayPercent(raw: unknown): ValidationResult {
  const check = parseNumber(raw);
  if (!check.valid) return check;
  if (check.value < 0 || check.value >= 100) {
    return fail("PERCENT_OUT_OF_RANGE", "Variable pay must be from 0% to less than 100% of CTC.");
  }
  return check;
}

/** PF wages (Basic + DA) as % of fixed CTC: more than 0, at most 100. */
export function validatePfWagesPercent(raw: unknown): ValidationResult {
  const check = parseNumber(raw);
  if (!check.valid) return check;
  if (check.value <= 0 || check.value > 100) {
    return fail("PERCENT_OUT_OF_RANGE", "Basic salary must be more than 0% and at most 100% of fixed CTC.");
  }
  return check;
}

/** Professional tax for the year: 0 to ₹2,500 (Constitution, Art. 276(2)). */
export function validateProfessionalTax(raw: unknown): ValidationResult {
  const check = parseNumber(raw);
  if (!check.valid) return check;
  if (check.value < 0) return fail("NEGATIVE", "Professional tax cannot be negative.");
  if (check.value > PROFESSIONAL_TAX_MAX_ANNUAL) {
    return fail("PROFESSIONAL_TAX_TOO_HIGH", "Professional tax cannot be more than ₹2,500 a year.");
  }
  return check;
}

export function isPfMode(value: unknown): value is PfMode {
  return value === "full" || value === "capped" || value === "none";
}

import assert from "node:assert/strict";
import test from "node:test";

import { formatRupees, groupIndianDigits, toLakhs } from "./format.ts";
import {
  isPfMode,
  validateCtc,
  validatePfWagesPercent,
  validateProfessionalTax,
  validateVariablePayPercent,
} from "./validate.ts";

function codeOf(result: ReturnType<typeof validateCtc>): string {
  return result.valid ? "OK" : result.code;
}

// --- CTC ---------------------------------------------------------------------

test("CTC: accepts numbers and pasted strings", () => {
  assert.deepEqual(validateCtc(12_00_000), { valid: true, value: 12_00_000 });
  assert.deepEqual(validateCtc("12,00,000"), { valid: true, value: 12_00_000 });
  assert.deepEqual(validateCtc("₹ 12,00,000"), { valid: true, value: 12_00_000 });
  assert.deepEqual(validateCtc("1200000.50"), { valid: true, value: 1_200_000.5 });
});

test("CTC: empty, non-numeric, zero, negative, too large", () => {
  assert.equal(codeOf(validateCtc("")), "EMPTY");
  assert.equal(codeOf(validateCtc("  ")), "EMPTY");
  assert.equal(codeOf(validateCtc(undefined)), "EMPTY");
  assert.equal(codeOf(validateCtc(null)), "EMPTY");
  assert.equal(codeOf(validateCtc("12 lakh")), "NOT_A_NUMBER");
  assert.equal(codeOf(validateCtc("1e6")), "NOT_A_NUMBER");
  assert.equal(codeOf(validateCtc(Number.POSITIVE_INFINITY)), "NOT_A_NUMBER");
  assert.equal(codeOf(validateCtc(0)), "NOT_POSITIVE");
  assert.equal(codeOf(validateCtc("-500000")), "NOT_POSITIVE");
  assert.equal(codeOf(validateCtc(10_00_00_001)), "TOO_LARGE");
  assert.equal(codeOf(validateCtc(10_00_00_000)), "OK", "₹10 crore is the maximum, inclusive");
});

// --- percentages -----------------------------------------------------------------

test("variable pay %: 0 to just under 100", () => {
  assert.equal(codeOf(validateVariablePayPercent(0)), "OK");
  assert.equal(codeOf(validateVariablePayPercent("15 %")), "OK");
  assert.equal(codeOf(validateVariablePayPercent(99.99)), "OK");
  assert.equal(codeOf(validateVariablePayPercent(100)), "PERCENT_OUT_OF_RANGE");
  assert.equal(codeOf(validateVariablePayPercent(-0.5)), "PERCENT_OUT_OF_RANGE");
  assert.equal(codeOf(validateVariablePayPercent("x")), "NOT_A_NUMBER");
});

test("PF wages %: above 0, up to 100", () => {
  assert.equal(codeOf(validatePfWagesPercent(50)), "OK");
  assert.equal(codeOf(validatePfWagesPercent(100)), "OK");
  assert.equal(codeOf(validatePfWagesPercent(0.1)), "OK");
  assert.equal(codeOf(validatePfWagesPercent(0)), "PERCENT_OUT_OF_RANGE");
  assert.equal(codeOf(validatePfWagesPercent(100.01)), "PERCENT_OUT_OF_RANGE");
});

// --- professional tax ----------------------------------------------------------------

test("professional tax: 0 to ₹2,500 a year", () => {
  assert.equal(codeOf(validateProfessionalTax(0)), "OK");
  assert.equal(codeOf(validateProfessionalTax("2,500")), "OK");
  assert.equal(codeOf(validateProfessionalTax(2_500.01)), "PROFESSIONAL_TAX_TOO_HIGH");
  assert.equal(codeOf(validateProfessionalTax(-1)), "NEGATIVE");
  assert.equal(codeOf(validateProfessionalTax("")), "EMPTY");
});

test("PF mode guard", () => {
  assert.equal(isPfMode("full"), true);
  assert.equal(isPfMode("capped"), true);
  assert.equal(isPfMode("none"), true);
  assert.equal(isPfMode("FULL"), false);
  assert.equal(isPfMode(undefined), false);
});

// --- formatting ----------------------------------------------------------------------

test("Indian digit grouping", () => {
  assert.equal(groupIndianDigits("100"), "100");
  assert.equal(groupIndianDigits("100000"), "1,00,000");
  assert.equal(groupIndianDigits("10000000"), "1,00,00,000");
});

test("formatRupees: whole rupees, paise, negatives", () => {
  assert.equal(formatRupees(12_00_000), "₹12,00,000");
  assert.equal(formatRupees(1_32_713.333), "₹1,32,713.33");
  assert.equal(formatRupees(85_596.1), "₹85,596.10");
  assert.equal(formatRupees(0), "₹0");
  assert.equal(formatRupees(-1_800), "-₹1,800");
  assert.equal(formatRupees(Number.NaN), "₹0");
});

test("toLakhs", () => {
  assert.equal(toLakhs(12_00_000), 12);
  assert.equal(toLakhs(12_50_000), 12.5);
  assert.equal(toLakhs(6_45_678), 6.46);
});

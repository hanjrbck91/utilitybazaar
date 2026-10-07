import assert from "node:assert/strict";
import test from "node:test";

import { PF_WAGE_CEILING_MONTHLY } from "./constants.ts";
import { calculateSalary, tryCalculateSalary } from "./engine.ts";
import { SalaryError, type SalaryBreakdown, type SalaryInput } from "./types.ts";

// Defaults under test: no variable pay, PF wages (Basic + DA) = 50% of
// fixed CTC, PF on full wages, no gratuity, no professional tax, new
// regime. Expected figures are worked by hand.

/** The accounting relationships every result must satisfy. */
function assertReconciles(r: SalaryBreakdown, label: string): void {
  const a = r.annual;
  assert.equal(
    a.ctc,
    a.fixedGross + a.variablePay + a.employerPf + a.gratuity,
    `${label}: CTC = fixed gross + variable + employer PF + gratuity`,
  );
  assert.equal(a.fixedCtc, a.ctc - a.variablePay, `${label}: fixed CTC`);
  assert.equal(a.grossSalary, a.fixedGross + a.variablePay, `${label}: gross salary`);
  assert.equal(
    a.takeHome,
    a.grossSalary - a.employeePf - a.professionalTax - a.incomeTax,
    `${label}: gross − deductions − tax = take-home`,
  );
  assert.equal(a.employerPf, r.monthly.employerPf * 12, `${label}: employer PF is 12 months`);
  assert.equal(a.employeePf, r.monthly.employeePf * 12, `${label}: employee PF is 12 months`);
  assert.equal(a.incomeTax, r.tax.totalTax, `${label}: income tax matches the working`);
  assert.equal(r.tax.grossSalary, a.grossSalary, `${label}: tax is on the gross salary`);

  // Monthly figures are ÷12 to paise: 12 regular months + variable pay
  // reconcile with the annual take-home to within 12 × ½ paisa.
  const rebuilt = r.monthly.takeHome * 12 + a.variablePay;
  assert.ok(Math.abs(rebuilt - a.takeHome) <= 0.06, `${label}: monthly × 12 ≈ annual (${rebuilt} vs ${a.takeHome})`);
  const monthlyParts =
    r.monthly.grossSalary - r.monthly.employeePf - r.monthly.professionalTax - r.monthly.incomeTax;
  assert.ok(Math.abs(monthlyParts - r.monthly.takeHome) <= 0.02, `${label}: monthly parts add up`);
}

// --- realistic salaries -----------------------------------------------------

test("₹6 LPA: PF on ₹25,000 wages, no tax", () => {
  const r = calculateSalary({ annualCtc: 6_00_000 });
  assert.equal(r.monthly.pfWages, 25_000);
  assert.equal(r.monthly.employeePf, 3_000);
  assert.equal(r.annual.fixedGross, 5_64_000);
  assert.equal(r.annual.incomeTax, 0);
  assert.equal(r.monthly.grossSalary, 47_000);
  assert.equal(r.monthly.takeHome, 44_000);
  assert.equal(r.annual.takeHome, 5_28_000);
  assertReconciles(r, "6L");
});

test("₹12 LPA: rebate removes all tax", () => {
  const r = calculateSalary({ annualCtc: 12_00_000 });
  assert.equal(r.monthly.employeePf, 6_000);
  assert.equal(r.annual.grossSalary, 11_28_000);
  assert.equal(r.tax.taxableIncome, 10_53_000);
  assert.equal(r.tax.slabTax, 45_300);
  assert.equal(r.tax.rebate, 45_300);
  assert.equal(r.annual.incomeTax, 0);
  assert.equal(r.monthly.takeHome, 88_000);
  assert.equal(r.annual.takeHome, 10_56_000);
  assert.equal(r.flags.rebateApplied, true);
  assertReconciles(r, "12L");
});

test("₹20 LPA: 15–20% slabs plus cess", () => {
  const r = calculateSalary({ annualCtc: 20_00_000 });
  assert.equal(r.monthly.employeePf, 10_000);
  assert.equal(r.annual.grossSalary, 18_80_000);
  assert.equal(r.tax.taxableIncome, 18_05_000);
  assert.equal(r.tax.slabTax, 1_61_000);
  assert.equal(r.tax.rebate, 0);
  assert.equal(r.tax.cess, 6_440);
  assert.equal(r.annual.incomeTax, 1_67_440);
  assert.equal(r.annual.takeHome, 15_92_560);
  assert.equal(r.monthly.takeHome, 1_32_713.33);
  assert.equal(r.monthly.incomeTax, 13_953.33);
  assertReconciles(r, "20L");
});

test("low salary (₹2.4 LPA): no tax, PF still deducted", () => {
  const r = calculateSalary({ annualCtc: 2_40_000 });
  assert.equal(r.monthly.employeePf, 1_200);
  assert.equal(r.annual.incomeTax, 0);
  assert.equal(r.monthly.takeHome, 17_600);
  assertReconciles(r, "2.4L");
});

test("high salary (₹1 crore, no PF): 10% surcharge, no relief", () => {
  const r = calculateSalary({ annualCtc: 1_00_00_000, pfMode: "none" });
  assert.equal(r.tax.taxableIncome, 99_25_000);
  assert.equal(r.tax.slabTax, 25_57_500);
  assert.equal(r.tax.surcharge, 2_55_750);
  assert.equal(r.tax.cess, 1_12_530);
  assert.equal(r.annual.incomeTax, 29_25_780);
  assert.equal(r.annual.takeHome, 70_74_220);
  assert.equal(r.flags.surchargeMarginalRelief, false);
  assertReconciles(r, "1Cr");
});

test("salary just above ₹50 lakh: surcharge marginal relief", () => {
  const r = calculateSalary({ annualCtc: 50_85_000, pfMode: "none" });
  assert.equal(r.tax.taxableIncome, 50_10_000);
  assert.equal(r.tax.surcharge, 7_000);
  assert.equal(r.tax.surchargeRelief, 1_01_300);
  assert.equal(r.annual.incomeTax, 11_33_600);
  assert.equal(r.flags.surchargeMarginalRelief, true);
  assertReconciles(r, "50.85L");
});

// --- components -------------------------------------------------------------

test("PF: employer and employee contribute the same 12%", () => {
  const r = calculateSalary({ annualCtc: 9_00_000 });
  assert.equal(r.monthly.employerPf, r.monthly.employeePf);
  assert.equal(r.monthly.employeePf, Math.round(0.12 * r.monthly.pfWages));
});

test("PF capped: limited to 12% of the ₹25,000 ceiling", () => {
  const r = calculateSalary({ annualCtc: 20_00_000, pfMode: "capped" });
  assert.equal(r.monthly.employeePf, 0.12 * PF_WAGE_CEILING_MONTHLY);
  assert.equal(r.monthly.employeePf, 3_000);
  assert.equal(r.annual.incomeTax, 1_84_912);
  assert.equal(r.annual.takeHome, 17_43_088);
  assert.equal(r.flags.pfCappedByCeiling, true);
  assertReconciles(r, "20L capped");
});

test("PF capped: wages exactly at the ceiling — same as full", () => {
  // ₹6 LPA × 50% ÷ 12 = ₹25,000 a month: exactly the ceiling.
  const full = calculateSalary({ annualCtc: 6_00_000, pfMode: "full" });
  const capped = calculateSalary({ annualCtc: 6_00_000, pfMode: "capped" });
  assert.equal(capped.monthly.pfWages, PF_WAGE_CEILING_MONTHLY);
  assert.deepEqual(capped.annual, full.annual);
  assert.equal(capped.flags.pfCappedByCeiling, false);
});

test("PF capped: wages below the ceiling — same as full", () => {
  const full = calculateSalary({ annualCtc: 4_00_000, pfMode: "full" });
  const capped = calculateSalary({ annualCtc: 4_00_000, pfMode: "capped" });
  assert.ok(capped.monthly.pfWages < PF_WAGE_CEILING_MONTHLY);
  assert.deepEqual(capped.annual, full.annual);
});

test("PF capped: one rupee above the ceiling is capped", () => {
  const r = calculateSalary({ annualCtc: 6_00_024, pfMode: "capped" });
  assert.ok(r.monthly.pfWages > PF_WAGE_CEILING_MONTHLY);
  assert.equal(r.monthly.employeePf, 3_000);
  assert.equal(r.flags.pfCappedByCeiling, true);
});

test("no PF: the whole CTC is gross salary", () => {
  const r = calculateSalary({ annualCtc: 12_75_000, pfMode: "none" });
  assert.equal(r.annual.employerPf, 0);
  assert.equal(r.annual.employeePf, 0);
  assert.equal(r.annual.grossSalary, 12_75_000);
  assert.equal(r.annual.incomeTax, 0, "₹12.75 lakh is the zero-tax point for salary");
  assertReconciles(r, "12.75L none");
});

test("rebate marginal relief: tax limited to income above ₹12 lakh", () => {
  const r = calculateSalary({ annualCtc: 12_85_000, pfMode: "none" });
  assert.equal(r.tax.taxableIncome, 12_10_000);
  assert.equal(r.tax.slabTax, 61_500);
  assert.equal(r.tax.rebate, 51_500);
  assert.equal(r.annual.incomeTax, 10_400);
  assert.equal(r.flags.rebateMarginalRelief, true);
  assertReconciles(r, "12.85L none");
});

test("professional tax reduces take-home but not income tax (s.202(2)(a)(iv))", () => {
  const without = calculateSalary({ annualCtc: 20_00_000 });
  const withPt = calculateSalary({ annualCtc: 20_00_000, professionalTaxAnnual: 2_500 });
  assert.equal(withPt.annual.incomeTax, without.annual.incomeTax);
  assert.equal(withPt.tax.taxableIncome, without.tax.taxableIncome);
  assert.equal(withPt.annual.takeHome, without.annual.takeHome - 2_500);
  assertReconciles(withPt, "20L PT");
});

test("professional tax: ₹200 a month on ₹12 LPA", () => {
  const r = calculateSalary({ annualCtc: 12_00_000, professionalTaxAnnual: 2_400 });
  assert.equal(r.monthly.professionalTax, 200);
  assert.equal(r.monthly.takeHome, 87_800);
  assert.equal(r.annual.takeHome, 10_53_600);
});

test("variable pay: not monthly, but taxed and in annual take-home", () => {
  const r = calculateSalary({ annualCtc: 12_00_000, variablePayPercent: 10 });
  assert.equal(r.annual.variablePay, 1_20_000);
  assert.equal(r.annual.fixedCtc, 10_80_000);
  assert.equal(r.monthly.pfWages, 45_000, "PF wages exclude variable pay");
  assert.equal(r.annual.grossSalary, 11_35_200);
  assert.equal(r.tax.grossSalary, 11_35_200, "variable pay is taxable");
  assert.equal(r.monthly.takeHome, 79_200);
  assert.equal(r.annual.takeHome, 10_70_400);
  assertReconciles(r, "12L var10");
});

test("variable pay lowers monthly take-home but not annual tax", () => {
  const fixedOnly = calculateSalary({ annualCtc: 13_00_000, pfMode: "none" });
  const withVariable = calculateSalary({ annualCtc: 13_00_000, pfMode: "none", variablePayPercent: 20 });
  assert.equal(fixedOnly.annual.grossSalary, withVariable.annual.grossSalary);
  assert.equal(fixedOnly.annual.incomeTax, withVariable.annual.incomeTax);
  assert.ok(withVariable.monthly.takeHome < fixedOnly.monthly.takeHome);
});

test("gratuity: monthly wages × 15/26, inside CTC, not paid", () => {
  const r = calculateSalary({ annualCtc: 12_00_000, includeGratuity: true });
  assert.equal(r.annual.gratuity, 28_846); // 50,000 × 15 / 26 = 28,846.15
  assert.equal(r.annual.fixedGross, 10_99_154);
  assert.equal(r.annual.takeHome, 10_27_154);
  assert.equal(r.monthly.takeHome, 85_596.17);
  assertReconciles(r, "12L gratuity");
});

test("employer contributions: never part of gross or taxable salary", () => {
  const r = calculateSalary({ annualCtc: 18_00_000, includeGratuity: true });
  assert.equal(r.tax.grossSalary, r.annual.ctc - r.annual.employerPf - r.annual.gratuity);
});

test("wages below 50% are flagged, not rejected", () => {
  const r = calculateSalary({ annualCtc: 12_00_000, pfWagesPercent: 40 });
  assert.equal(r.flags.wagesBelowStatutoryFloor, true);
  assert.equal(r.monthly.pfWages, 40_000);
  assert.equal(calculateSalary({ annualCtc: 12_00_000 }).flags.wagesBelowStatutoryFloor, false);
});

test("assumptions are echoed", () => {
  const r = calculateSalary({ annualCtc: 12_00_000 });
  assert.deepEqual(r.assumptions, {
    variablePayPercent: 0,
    pfWagesPercent: 50,
    pfMode: "full",
    includeGratuity: false,
    professionalTaxAnnual: 0,
    taxRegime: "new",
    taxYear: "2026-27",
  });
});

// --- edge cases ---------------------------------------------------------------

test("explicit zero optional components equal the defaults", () => {
  const defaults = calculateSalary({ annualCtc: 15_00_000 });
  const zeros = calculateSalary({
    annualCtc: 15_00_000,
    variablePayPercent: 0,
    professionalTaxAnnual: 0,
    includeGratuity: false,
    pfMode: "full",
    pfWagesPercent: 50,
  });
  assert.deepEqual(zeros, defaults);
});

test("all components together still reconcile", () => {
  const r = calculateSalary({
    annualCtc: 27_45_678,
    variablePayPercent: 12.5,
    pfWagesPercent: 47.3,
    pfMode: "capped",
    includeGratuity: true,
    professionalTaxAnnual: 2_500,
  });
  assertReconciles(r, "everything");
});

test("decimal CTC is rounded to the rupee", () => {
  const r = calculateSalary({ annualCtc: 12_00_000.4 });
  assert.equal(r.annual.ctc, 12_00_000);
});

test("rounding: PF on a wage ending in ₹x.5 rounds half up", () => {
  // 12% of 12,512.50 = 1,501.50 -> 1,502
  const r = calculateSalary({ annualCtc: 3_00_300 });
  assert.equal(r.monthly.pfWages, 12_512.5);
  assert.equal(r.monthly.employeePf, 1_502);
});

test("smallest valid CTC: ₹1 a year, no PF", () => {
  const r = calculateSalary({ annualCtc: 1, pfMode: "none" });
  assert.equal(r.annual.takeHome, 1);
  assert.equal(r.annual.incomeTax, 0);
});

test("largest valid CTC: ₹10 crore", () => {
  const r = calculateSalary({ annualCtc: 10_00_00_000 });
  assert.equal(r.tax.surcharge > 0, true);
  assertReconciles(r, "10Cr");
});

test("reconciles across a wide sweep of CTCs and options", () => {
  const modes = ["full", "capped", "none"] as const;
  for (let ctc = 1_50_000; ctc <= 3_00_00_000; ctc = Math.round(ctc * 1.37) + 7) {
    for (const pfMode of modes) {
      const r = calculateSalary({ annualCtc: ctc, pfMode, variablePayPercent: 7, includeGratuity: true, professionalTaxAnnual: 2_400 });
      assertReconciles(r, `${ctc} ${pfMode}`);
      assert.ok(r.monthly.takeHome > 0);
    }
  }
});

test("take-home rises with CTC, except for the cess inside marginal-relief zones", () => {
  // Marginal relief (rebate above ₹12 lakh, surcharge above ₹50 lakh /
  // ₹1 crore / ₹2 crore) lets tax rise ₹1 per ₹1 of extra income; cess
  // is then charged on top with no relief (Budget 2026 Memorandum), so
  // inside those zones take-home may fall by at most 4% of the extra
  // gross plus the extra employee PF (which rises with CTC). Anywhere
  // else it must rise.
  let previous = calculateSalary({ annualCtc: 2_00_000 }).annual;
  for (let ctc = 2_10_000; ctc <= 2_50_00_000; ctc += 10_000) {
    const current = calculateSalary({ annualCtc: ctc });
    const delta = current.annual.takeHome - previous.takeHome;
    const extraGross = current.annual.grossSalary - previous.grossSalary;
    const extraPf = current.annual.employeePf - previous.employeePf;
    const inReliefZone = current.flags.rebateMarginalRelief || current.flags.surchargeMarginalRelief;
    if (inReliefZone) {
      assert.ok(delta >= -(0.04 * extraGross + extraPf) - 2, `take-home fell too far at ${ctc}: ${delta}`);
    } else {
      assert.ok(delta > 0, `take-home fell at ${ctc}: ${delta}`);
    }
    previous = current.annual;
  }
});

test("cess gets no marginal relief: take-home dips 4% just above ₹50 lakh", () => {
  // Taxable exactly ₹50 lakh, then ₹5,000 more: tax + surcharge rise by
  // exactly ₹5,000 (relief), cess by ₹200 — net income falls by ₹200.
  const atThreshold = calculateSalary({ annualCtc: 50_75_000, pfMode: "none" });
  const above = calculateSalary({ annualCtc: 50_80_000, pfMode: "none" });
  assert.equal(atThreshold.tax.taxableIncome, 50_00_000);
  const taxPlusSurcharge = (r: SalaryBreakdown) => r.tax.slabTax - r.tax.rebate + r.tax.surcharge;
  assert.equal(taxPlusSurcharge(above) - taxPlusSurcharge(atThreshold), 5_000);
  assert.equal(above.annual.takeHome - atThreshold.annual.takeHome, -200);
});

// --- validation through the engine ---------------------------------------------

function errorOf(input: SalaryInput): { code: string; field: string } {
  const result = tryCalculateSalary(input);
  assert.equal(result.ok, false, `expected ${JSON.stringify(input)} to fail`);
  return result.ok ? { code: "", field: "" } : { code: result.code, field: result.field };
}

test("invalid CTC values are rejected with typed errors", () => {
  assert.deepEqual(errorOf({ annualCtc: 0 }), { code: "NOT_POSITIVE", field: "annualCtc" });
  assert.deepEqual(errorOf({ annualCtc: -5_00_000 }), { code: "NOT_POSITIVE", field: "annualCtc" });
  assert.deepEqual(errorOf({ annualCtc: 0.4 }), { code: "NOT_POSITIVE", field: "annualCtc" });
  assert.deepEqual(errorOf({ annualCtc: 10_00_00_001 }), { code: "TOO_LARGE", field: "annualCtc" });
  assert.deepEqual(errorOf({ annualCtc: Number.NaN }), { code: "NOT_A_NUMBER", field: "annualCtc" });
  assert.deepEqual(errorOf({ annualCtc: "abc" as unknown as number }), { code: "NOT_A_NUMBER", field: "annualCtc" });
  assert.deepEqual(errorOf({ annualCtc: "" as unknown as number }), { code: "EMPTY", field: "annualCtc" });
  assert.deepEqual(errorOf({} as SalaryInput), { code: "EMPTY", field: "annualCtc" });
});

test("invalid percentages and amounts are rejected", () => {
  assert.deepEqual(errorOf({ annualCtc: 12_00_000, variablePayPercent: 100 }), { code: "PERCENT_OUT_OF_RANGE", field: "variablePayPercent" });
  assert.deepEqual(errorOf({ annualCtc: 12_00_000, variablePayPercent: -1 }), { code: "PERCENT_OUT_OF_RANGE", field: "variablePayPercent" });
  assert.deepEqual(errorOf({ annualCtc: 12_00_000, pfWagesPercent: 0 }), { code: "PERCENT_OUT_OF_RANGE", field: "pfWagesPercent" });
  assert.deepEqual(errorOf({ annualCtc: 12_00_000, pfWagesPercent: 101 }), { code: "PERCENT_OUT_OF_RANGE", field: "pfWagesPercent" });
  assert.deepEqual(errorOf({ annualCtc: 12_00_000, professionalTaxAnnual: 2_501 }), { code: "PROFESSIONAL_TAX_TOO_HIGH", field: "professionalTaxAnnual" });
  assert.deepEqual(errorOf({ annualCtc: 12_00_000, professionalTaxAnnual: -1 }), { code: "NEGATIVE", field: "professionalTaxAnnual" });
  assert.deepEqual(errorOf({ annualCtc: 12_00_000, pfMode: "half" as never }), { code: "INVALID_PF_MODE", field: "pfMode" });
});

test("deductions that leave nothing each month are rejected", () => {
  // ₹30,000 CTC with ₹2,500 PT: ₹28,200 gross − ₹1,800 PF − ₹2,500 PT leaves ₹23,900.
  // ₹2,500 CTC: ₹2,344 gross − ₹156 PF − ₹2,500 PT is negative.
  assert.equal(tryCalculateSalary({ annualCtc: 30_000, professionalTaxAnnual: 2_500 }).ok, true);
  assert.deepEqual(errorOf({ annualCtc: 2_500, professionalTaxAnnual: 2_500 }), {
    code: "NON_POSITIVE_TAKE_HOME",
    field: "result",
  });
});

test("a structure with no fixed salary is rejected", () => {
  // 99.99% of ₹5,000 rounds to ₹5,000 of variable pay: no fixed salary left.
  assert.deepEqual(errorOf({ annualCtc: 5_000, variablePayPercent: 99.99 }), {
    code: "IMPOSSIBLE_STRUCTURE",
    field: "result",
  });
});

test("strict entry point throws SalaryError; wrapper never throws on bad input", () => {
  assert.throws(() => calculateSalary({ annualCtc: 0 }), SalaryError);
  assert.doesNotThrow(() => tryCalculateSalary({ annualCtc: -1 }));
});

// --- determinism ----------------------------------------------------------------

test("same input, same output", () => {
  const input: SalaryInput = { annualCtc: 23_45_678, variablePayPercent: 15, pfMode: "capped", includeGratuity: true, professionalTaxAnnual: 2_500 };
  const first = calculateSalary(input);
  for (let i = 0; i < 5; i += 1) assert.deepEqual(calculateSalary(input), first);
  assert.deepEqual(calculateSalary({ ...input }), first);
});

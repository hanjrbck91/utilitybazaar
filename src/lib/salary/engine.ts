import {
  DEFAULT_PF_WAGES_PERCENT,
  GRATUITY_DAYS,
  GRATUITY_MONTH_DIVISOR,
  PF_RATE,
  PF_WAGE_CEILING_MONTHLY,
  REBATE_INCOME_LIMIT,
  STANDARD_DEDUCTION,
  STATUTORY_WAGE_FLOOR_PERCENT,
  TAX_YEAR,
} from "./constants.ts";
import { cess, rebate, round2, roundRupee, slabTax, surcharge } from "./math.ts";
import {
  isPfMode,
  validateCtc,
  validatePfWagesPercent,
  validateProfessionalTax,
  validateVariablePayPercent,
} from "./validate.ts";
import {
  SalaryError,
  type IncomeTaxWorking,
  type SalaryBreakdown,
  type SalaryErrorCode,
  type SalaryField,
  type SalaryInput,
  type ValidationResult,
} from "./types.ts";

function required(check: ValidationResult, field: SalaryField): number {
  if (!check.valid) throw new SalaryError(check.code, field, check.message);
  return check.value;
}

/** Income tax for a year of salary under the new regime (s.202). */
export function computeIncomeTax(grossSalary: number): IncomeTaxWorking {
  const standardDeduction = Math.min(STANDARD_DEDUCTION, Math.max(0, grossSalary));
  const taxableIncome = Math.max(0, grossSalary - standardDeduction);

  const { rows, total } = slabTax(taxableIncome);
  const rebateAmount = rebate(taxableIncome, total);
  const netTax = total - rebateAmount;
  const { surcharge: surchargeAmount, relief } = surcharge(taxableIncome, netTax);
  const cessAmount = cess(netTax + surchargeAmount);

  return {
    grossSalary,
    standardDeduction,
    taxableIncome,
    slabs: rows,
    slabTax: total,
    rebate: rebateAmount,
    surcharge: surchargeAmount,
    surchargeRelief: relief,
    cess: cessAmount,
    totalTax: netTax + surchargeAmount + cessAmount,
  };
}

/**
 * Main entry point: annual CTC → take-home. Pure and deterministic.
 * Validates its input and throws {@link SalaryError} on any invalid value.
 *
 * The model, its sources and its simplifications are documented in
 * docs/milestones/M15.1_SALARY_ENGINE_RESEARCH.md.
 */
export function calculateSalary(input: SalaryInput): SalaryBreakdown {
  // --- inputs ----------------------------------------------------------
  const ctc = roundRupee(required(validateCtc(input.annualCtc), "annualCtc"));
  if (ctc <= 0) throw new SalaryError("NOT_POSITIVE", "annualCtc", "CTC must be at least ₹1.");

  const variablePayPercent = required(
    validateVariablePayPercent(input.variablePayPercent ?? 0),
    "variablePayPercent",
  );
  const pfWagesPercent = required(
    validatePfWagesPercent(input.pfWagesPercent ?? DEFAULT_PF_WAGES_PERCENT),
    "pfWagesPercent",
  );
  const pfMode = input.pfMode ?? "full";
  if (!isPfMode(pfMode)) {
    throw new SalaryError("INVALID_PF_MODE", "pfMode", "PF mode must be full, capped or none.");
  }
  const includeGratuity = input.includeGratuity === true;
  const professionalTax = roundRupee(
    required(validateProfessionalTax(input.professionalTaxAnnual ?? 0), "professionalTaxAnnual"),
  );

  // --- CTC → components ------------------------------------------------
  const variablePay = roundRupee((ctc * variablePayPercent) / 100);
  const fixedCtc = ctc - variablePay;

  const pfWagesMonthly = (fixedCtc * pfWagesPercent) / 100 / 12;
  const pfBaseMonthly =
    pfMode === "none"
      ? 0
      : pfMode === "capped"
        ? Math.min(pfWagesMonthly, PF_WAGE_CEILING_MONTHLY)
        : pfWagesMonthly;
  const employeePfMonthly = roundRupee(pfBaseMonthly * PF_RATE);
  const employerPfMonthly = employeePfMonthly;

  const gratuity = includeGratuity
    ? roundRupee((pfWagesMonthly * GRATUITY_DAYS) / GRATUITY_MONTH_DIVISOR)
    : 0;

  const employerPf = employerPfMonthly * 12;
  const employeePf = employeePfMonthly * 12;
  const fixedGross = fixedCtc - employerPf - gratuity;
  if (fixedGross <= 0) {
    throw new SalaryError(
      "IMPOSSIBLE_STRUCTURE",
      "result",
      "Employer PF and gratuity leave no fixed salary.",
    );
  }
  const grossSalary = fixedGross + variablePay;

  // --- tax and take-home -----------------------------------------------
  const tax = computeIncomeTax(grossSalary);
  const incomeTax = tax.totalTax;
  const takeHome = grossSalary - employeePf - professionalTax - incomeTax;
  const regularYear = fixedGross - employeePf - professionalTax - incomeTax;

  if (regularYear <= 0) {
    throw new SalaryError(
      "NON_POSITIVE_TAKE_HOME",
      "result",
      "Deductions leave no monthly take-home salary.",
    );
  }

  return {
    assumptions: {
      variablePayPercent,
      pfWagesPercent,
      pfMode,
      includeGratuity,
      professionalTaxAnnual: professionalTax,
      taxRegime: "new",
      taxYear: TAX_YEAR,
    },
    annual: {
      ctc,
      variablePay,
      fixedCtc,
      employerPf,
      gratuity,
      fixedGross,
      grossSalary,
      employeePf,
      professionalTax,
      incomeTax,
      takeHome,
    },
    monthly: {
      pfWages: round2(pfWagesMonthly),
      employerPf: employerPfMonthly,
      employeePf: employeePfMonthly,
      grossSalary: round2(fixedGross / 12),
      professionalTax: round2(professionalTax / 12),
      incomeTax: round2(incomeTax / 12),
      takeHome: round2(regularYear / 12),
    },
    tax,
    flags: {
      pfCappedByCeiling: pfMode === "capped" && pfWagesMonthly > PF_WAGE_CEILING_MONTHLY,
      wagesBelowStatutoryFloor: pfWagesPercent < STATUTORY_WAGE_FLOOR_PERCENT,
      rebateApplied: tax.rebate > 0,
      rebateMarginalRelief: tax.taxableIncome > REBATE_INCOME_LIMIT && tax.rebate > 0,
      surchargeMarginalRelief: tax.surchargeRelief > 0,
    },
  };
}

/** Discriminated result for callers that prefer not to catch. */
export type SalaryCalcResult =
  | { ok: true; data: SalaryBreakdown }
  | { ok: false; code: SalaryErrorCode; field: SalaryField; message: string };

/** Non-throwing wrapper around {@link calculateSalary}, for the calculator UI. */
export function tryCalculateSalary(input: SalaryInput): SalaryCalcResult {
  try {
    return { ok: true, data: calculateSalary(input) };
  } catch (err) {
    if (err instanceof SalaryError) {
      return { ok: false, code: err.code, field: err.field, message: err.message };
    }
    throw err;
  }
}

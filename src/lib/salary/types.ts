/**
 * Shared types for the salary (CTC → take-home) engine.
 *
 * The model, its sources and every simplification are documented in
 * docs/milestones/M15.1_SALARY_ENGINE_RESEARCH.md. All amounts are in
 * rupees.
 */

/**
 * How the employer computes PF:
 *   - "full"   — 12% of the full PF wages (Basic + DA)
 *   - "capped" — 12% of PF wages limited to the statutory wage ceiling
 *   - "none"   — no PF (e.g. an establishment not covered)
 */
export type PfMode = "full" | "capped" | "none";

/** Raw request handed to the engine. Only `annualCtc` is required. */
export interface SalaryInput {
  /** Annual cost to company, in rupees. */
  annualCtc: number;
  /** Share of CTC that is variable pay / bonus, as a percentage. Default 0. */
  variablePayPercent?: number;
  /**
   * PF wages (Basic + DA) as a percentage of fixed CTC. Default 50 — an
   * estimation default, not a statutory rule; see the research note.
   */
  pfWagesPercent?: number;
  /** Default "full". */
  pfMode?: PfMode;
  /** Whether CTC includes a gratuity provision. Default false. */
  includeGratuity?: boolean;
  /** Professional tax for the year, in rupees. Default 0. */
  professionalTaxAnnual?: number;
}

/** One row of the slab-by-slab income-tax working. */
export interface SlabTaxRow {
  /** Lower bound of the slab (exclusive, except for the first slab). */
  from: number;
  /** Upper bound of the slab, or `null` for the top slab. */
  to: number | null;
  /** Rate as a fraction, e.g. 0.05. */
  rate: number;
  /** Income falling inside this slab. */
  taxableInSlab: number;
  /** Tax on that income, before rounding of the total. */
  tax: number;
}

/** The income-tax working, step by step, so a UI can explain it. */
export interface IncomeTaxWorking {
  /** Salary income for tax: fixed gross + variable pay. */
  grossSalary: number;
  standardDeduction: number;
  taxableIncome: number;
  slabs: SlabTaxRow[];
  /** Tax at slab rates, rounded to the rupee. */
  slabTax: number;
  /** Rebate (including the s.156(2)(b) marginal relief above ₹12 lakh). */
  rebate: number;
  /** Surcharge after marginal relief. */
  surcharge: number;
  /** Amount by which surcharge marginal relief reduced the surcharge. */
  surchargeRelief: number;
  /** Health and Education Cess. */
  cess: number;
  /** slabTax − rebate + surcharge + cess. */
  totalTax: number;
}

/** Yearly figures. Every value is a whole number of rupees. */
export interface AnnualBreakdown {
  ctc: number;
  variablePay: number;
  /** CTC without variable pay. */
  fixedCtc: number;
  /** Employer PF — inside CTC, never paid as cash. */
  employerPf: number;
  /** Gratuity provision — inside CTC, never paid monthly. */
  gratuity: number;
  /** Fixed cash salary for the year (12 regular months). */
  fixedGross: number;
  /** All salary paid in cash: fixed gross + variable pay. */
  grossSalary: number;
  employeePf: number;
  professionalTax: number;
  incomeTax: number;
  /** grossSalary − employeePf − professionalTax − incomeTax. */
  takeHome: number;
}

/** A regular month, without variable pay. Values may carry paise. */
export interface MonthlyBreakdown {
  /** Basic + DA used for PF. */
  pfWages: number;
  employerPf: number;
  employeePf: number;
  /** Fixed gross ÷ 12. */
  grossSalary: number;
  professionalTax: number;
  /** Annual income tax ÷ 12 (TDS spread evenly). */
  incomeTax: number;
  takeHome: number;
}

/** The assumptions actually applied, echoed so a UI can state them. */
export interface AppliedAssumptions {
  variablePayPercent: number;
  pfWagesPercent: number;
  pfMode: PfMode;
  includeGratuity: boolean;
  professionalTaxAnnual: number;
  taxRegime: "new";
  taxYear: string;
}

/** Notable conditions a UI may want to explain. */
export interface SalaryFlags {
  /** PF was limited by the statutory wage ceiling. */
  pfCappedByCeiling: boolean;
  /** `pfWagesPercent` is below the 50% wage floor of the Labour Codes. */
  wagesBelowStatutoryFloor: boolean;
  /** Any s.156 rebate reduced the tax. */
  rebateApplied: boolean;
  /** Income above ₹12 lakh, with tax cut by the s.156(2)(b) marginal relief. */
  rebateMarginalRelief: boolean;
  /** Surcharge was reduced by marginal relief. */
  surchargeMarginalRelief: boolean;
}

/** Pure, deterministic result of a salary calculation. */
export interface SalaryBreakdown {
  assumptions: AppliedAssumptions;
  annual: AnnualBreakdown;
  monthly: MonthlyBreakdown;
  tax: IncomeTaxWorking;
  flags: SalaryFlags;
}

/** Stable machine-readable reasons an input was rejected. */
export type SalaryErrorCode =
  | "EMPTY"
  | "NOT_A_NUMBER"
  | "NOT_POSITIVE"
  | "NEGATIVE"
  | "TOO_LARGE"
  | "PERCENT_OUT_OF_RANGE"
  | "PROFESSIONAL_TAX_TOO_HIGH"
  | "INVALID_PF_MODE"
  | "IMPOSSIBLE_STRUCTURE"
  | "NON_POSITIVE_TAKE_HOME";

/** Which input an error is about, so a UI can mark the right field. */
export type SalaryField =
  | "annualCtc"
  | "variablePayPercent"
  | "pfWagesPercent"
  | "pfMode"
  | "professionalTaxAnnual"
  | "result";

export interface ValidationOk {
  valid: true;
  value: number;
}

export interface ValidationFailure {
  valid: false;
  code: SalaryErrorCode;
  /** Human-readable, English. UI may map `code` to a localized string instead. */
  message: string;
}

export type ValidationResult = ValidationOk | ValidationFailure;

/** Thrown by the strict engine entry point on invalid input. */
export class SalaryError extends Error {
  readonly code: SalaryErrorCode;
  readonly field: SalaryField;

  constructor(code: SalaryErrorCode, field: SalaryField, message: string) {
    super(message);
    this.name = "SalaryError";
    this.code = code;
    this.field = field;
  }
}

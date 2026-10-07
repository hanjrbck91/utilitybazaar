/**
 * Salary Calculator view-model — the only place the UI talks to the
 * salary engine.
 *
 * Framework-free on purpose: it turns the form's raw strings into an
 * engine call, and the engine's result into labelled rows, notices and
 * messages. It never calculates a salary figure itself — every amount it
 * hands to the components is a field of the engine's `SalaryBreakdown`.
 * Kept in plain TypeScript (relative imports, no React) so it can be
 * tested with `node --test` like the engines are.
 */

import {
  DEFAULT_PF_MODE,
  DEFAULT_PF_WAGES_PERCENT,
  MAX_ANNUAL_CTC,
  PF_RATE,
  PF_WAGE_CEILING_MONTHLY,
  PROFESSIONAL_TAX_MAX_ANNUAL,
  REBATE_INCOME_LIMIT,
  STATUTORY_WAGE_FLOOR_PERCENT,
  TAX_YEAR,
  formatRupees,
  toLakhs,
  tryCalculateSalary,
  validateCtc,
  validatePfWagesPercent,
  validateProfessionalTax,
  validateVariablePayPercent,
  type PfMode,
  type SalaryBreakdown,
  type SalaryErrorCode,
  type SalaryField,
  type SalaryInput,
  type ValidationResult,
} from "../../lib/salary/index.ts";
import { interpolate } from "../../lib/i18n/index.ts";
import type { SalaryDictionary } from "../../lib/i18n/types.ts";

// --- form state --------------------------------------------------------------

/** Everything the form holds: raw strings as typed, plus the two choices. */
export interface SalaryFormState {
  ctc: string;
  variablePayPercent: string;
  pfWagesPercent: string;
  pfMode: PfMode;
  includeGratuity: boolean;
  professionalTax: string;
}

/** The form as first shown — defaults are the engine's own. */
export function initialFormState(): SalaryFormState {
  return {
    ctc: "",
    variablePayPercent: "",
    pfWagesPercent: String(DEFAULT_PF_WAGES_PERCENT),
    pfMode: DEFAULT_PF_MODE,
    includeGratuity: false,
    professionalTax: "",
  };
}

// --- engine call -------------------------------------------------------------

export type SalaryView =
  | { status: "empty" }
  | { status: "error"; field: SalaryField; code: SalaryErrorCode }
  | { status: "ok"; result: SalaryBreakdown };

/**
 * Parse one optional field with the engine's own validator. An empty
 * field means "not given", so the engine applies its default.
 */
function optional(
  raw: string,
  validate: (value: unknown) => ValidationResult,
): ValidationResult | undefined {
  return raw.trim() === "" ? undefined : validate(raw);
}

/**
 * Run the engine for the current form. Inputs are parsed by the engine's
 * validators and the result comes from `tryCalculateSalary` — no salary
 * arithmetic happens here.
 */
export function computeView(state: SalaryFormState): SalaryView {
  if (state.ctc.trim() === "") return { status: "empty" };

  const ctc = validateCtc(state.ctc);
  if (!ctc.valid) return { status: "error", field: "annualCtc", code: ctc.code };

  const checks: Array<[SalaryField, ValidationResult | undefined]> = [
    ["variablePayPercent", optional(state.variablePayPercent, validateVariablePayPercent)],
    ["pfWagesPercent", optional(state.pfWagesPercent, validatePfWagesPercent)],
    ["professionalTaxAnnual", optional(state.professionalTax, validateProfessionalTax)],
  ];
  for (const [field, check] of checks) {
    if (check && !check.valid) return { status: "error", field, code: check.code };
  }

  const value = (check: ValidationResult | undefined) =>
    check?.valid ? check.value : undefined;

  const input: SalaryInput = {
    annualCtc: ctc.value,
    variablePayPercent: value(checks[0][1]),
    pfWagesPercent: value(checks[1][1]),
    pfMode: state.pfMode,
    includeGratuity: state.includeGratuity,
    professionalTaxAnnual: value(checks[2][1]),
  };

  const outcome = tryCalculateSalary(input);
  return outcome.ok
    ? { status: "ok", result: outcome.data }
    : { status: "error", field: outcome.field, code: outcome.code };
}

/** "= 12 lakh a year" under the CTC field, from the engine's own parse. */
export function ctcInLakhs(d: SalaryDictionary, raw: string): string | null {
  const check = validateCtc(raw);
  return check.valid ? interpolate(d.calculator.ctcInLakhs, { lakhs: toLakhs(check.value) }) : null;
}

// --- messages ----------------------------------------------------------------

/** The localized message for an engine error, with its limits filled in. */
export function errorMessage(d: SalaryDictionary, field: SalaryField, code: SalaryErrorCode): string {
  if (code === "PERCENT_OUT_OF_RANGE" && (field === "variablePayPercent" || field === "pfWagesPercent")) {
    return d.fieldErrors[field];
  }
  const max =
    field === "professionalTaxAnnual"
      ? formatRupees(PROFESSIONAL_TAX_MAX_ANNUAL)
      : formatRupees(MAX_ANNUAL_CTC);
  return interpolate(d.errors[code], { max });
}

/** Static hints whose numbers come from the engine's constants. */
export function inputHints(d: SalaryDictionary) {
  // 0.12 × 100 is 12.000000000000002 in floating point; the hint shows a whole percentage.
  const rate = Math.round(PF_RATE * 100);
  return {
    pfWages: interpolate(d.calculator.pfWagesHint, { percent: DEFAULT_PF_WAGES_PERCENT }),
    pfMode: {
      full: interpolate(d.calculator.pfFullHint, { rate }),
      capped: interpolate(d.calculator.pfCappedHint, {
        rate,
        ceiling: formatRupees(PF_WAGE_CEILING_MONTHLY),
      }),
      none: d.calculator.pfNoneHint,
    } satisfies Record<PfMode, string>,
    professionalTax: interpolate(d.calculator.professionalTaxHint, {
      max: formatRupees(PROFESSIONAL_TAX_MAX_ANNUAL),
    }),
    taxRegime: interpolate(d.calculator.taxRegimeValue, { year: TAX_YEAR }),
  };
}

// --- result ------------------------------------------------------------------

export interface ResultSummary {
  monthlyTakeHome: string;
  annualTakeHome: string;
  /** "Plus ₹X variable pay…", only when there is variable pay. */
  variableNote: string | null;
  taxRegime: string;
}

export function resultSummary(d: SalaryDictionary, r: SalaryBreakdown): ResultSummary {
  return {
    monthlyTakeHome: formatRupees(r.monthly.takeHome),
    annualTakeHome: formatRupees(r.annual.takeHome),
    variableNote:
      r.annual.variablePay > 0
        ? interpolate(d.result.plusVariable, { amount: formatRupees(r.annual.variablePay) })
        : null,
    taxRegime: interpolate(d.tax.regime, { year: r.assumptions.taxYear }),
  };
}

export type RowKind = "total" | "part" | "deduction" | "result";

export interface BreakdownRow {
  key: string;
  label: string;
  /** Regular month; `null` where the item is not a monthly amount. */
  monthly: string | null;
  annual: string;
  kind: RowKind;
}

export interface BreakdownGroup {
  key: string;
  /** Group caption, or `null` for a row that stands alone. */
  label: string | null;
  rows: BreakdownRow[];
}

/** CTC → parts not paid monthly → gross → deductions → take-home. */
export function breakdownGroups(d: SalaryDictionary, r: SalaryBreakdown): BreakdownGroup[] {
  const b = d.breakdown;
  const a = r.annual;
  const m = r.monthly;
  const rupees = formatRupees;

  const notMonthly: BreakdownRow[] = [];
  if (a.variablePay > 0) {
    notMonthly.push({ key: "variablePay", label: b.variablePay, monthly: null, annual: rupees(a.variablePay), kind: "part" });
  }
  if (a.employerPf > 0) {
    notMonthly.push({ key: "employerPf", label: b.employerPf, monthly: rupees(m.employerPf), annual: rupees(a.employerPf), kind: "part" });
  }
  if (a.gratuity > 0) {
    notMonthly.push({ key: "gratuity", label: b.gratuity, monthly: null, annual: rupees(a.gratuity), kind: "part" });
  }

  const deductions: BreakdownRow[] = [];
  if (a.employeePf > 0) {
    deductions.push({ key: "employeePf", label: b.employeePf, monthly: rupees(m.employeePf), annual: rupees(a.employeePf), kind: "deduction" });
  }
  if (a.professionalTax > 0) {
    deductions.push({ key: "professionalTax", label: b.professionalTax, monthly: rupees(m.professionalTax), annual: rupees(a.professionalTax), kind: "deduction" });
  }
  deductions.push({ key: "incomeTax", label: b.incomeTax, monthly: rupees(m.incomeTax), annual: rupees(a.incomeTax), kind: "deduction" });

  const groups: BreakdownGroup[] = [
    { key: "ctc", label: null, rows: [{ key: "ctc", label: b.ctc, monthly: null, annual: rupees(a.ctc), kind: "total" }] },
  ];
  if (notMonthly.length > 0) groups.push({ key: "notMonthly", label: b.notPaidMonthly, rows: notMonthly });
  groups.push(
    { key: "gross", label: null, rows: [{ key: "grossSalary", label: b.grossSalary, monthly: rupees(m.grossSalary), annual: rupees(a.grossSalary), kind: "total" }] },
    { key: "deductions", label: b.deductions, rows: deductions },
    { key: "takeHome", label: null, rows: [{ key: "takeHome", label: b.takeHome, monthly: rupees(m.takeHome), annual: rupees(a.takeHome), kind: "result" }] },
  );
  return groups;
}

export interface TaxRow {
  key: string;
  label: string;
  value: string;
  kind: "plain" | "subtract" | "add" | "total" | "slab";
}

/** The engine's tax working, row by row; slabs only where income falls. */
export function taxRows(d: SalaryDictionary, r: SalaryBreakdown): TaxRow[] {
  const t = d.tax;
  const w = r.tax;
  const rupees = formatRupees;

  const rows: TaxRow[] = [
    { key: "grossSalary", label: t.grossSalary, value: rupees(w.grossSalary), kind: "plain" },
    { key: "standardDeduction", label: t.standardDeduction, value: rupees(w.standardDeduction), kind: "subtract" },
    { key: "taxableIncome", label: t.taxableIncome, value: rupees(w.taxableIncome), kind: "total" },
  ];

  w.slabs.forEach((slab, index) => {
    if (slab.taxableInSlab <= 0) return;
    const range =
      slab.to === null
        ? interpolate(t.slabTop, { from: rupees(slab.from) })
        : interpolate(t.slab, { from: rupees(slab.from), to: rupees(slab.to) });
    rows.push({
      key: `slab-${index}`,
      label: `${range} · ${Math.round(slab.rate * 100)}%`,
      value: rupees(slab.tax),
      kind: "slab",
    });
  });

  rows.push({ key: "taxBeforeRebate", label: t.taxBeforeRebate, value: rupees(w.slabTax), kind: "plain" });
  if (w.rebate > 0) rows.push({ key: "rebate", label: t.rebate, value: rupees(w.rebate), kind: "subtract" });
  if (w.surcharge > 0 || w.surchargeRelief > 0) {
    rows.push({ key: "surcharge", label: t.surcharge, value: rupees(w.surcharge), kind: "add" });
  }
  if (w.surchargeRelief > 0) {
    rows.push({ key: "marginalRelief", label: t.marginalRelief, value: rupees(w.surchargeRelief), kind: "plain" });
  }
  if (w.cess > 0) rows.push({ key: "cess", label: t.cess, value: rupees(w.cess), kind: "add" });
  rows.push({ key: "totalTax", label: t.totalTax, value: rupees(w.totalTax), kind: "total" });
  return rows;
}

export interface Notice {
  key: string;
  text: string;
  /** Warnings are conditions worth checking; the rest are standing assumptions. */
  tone: "warning" | "info";
}

/** The assumptions behind this result, and any engine flags worth a word. */
export function notices(d: SalaryDictionary, r: SalaryBreakdown): Notice[] {
  const e = d.explain;
  const list: Notice[] = [];
  const hasPf = r.assumptions.pfMode !== "none";

  if (r.flags.wagesBelowStatutoryFloor) {
    list.push({ key: "wagesBelowFloor", tone: "warning", text: interpolate(e.wagesBelowFloor, { percent: STATUTORY_WAGE_FLOOR_PERCENT }) });
  }
  if (r.flags.pfCappedByCeiling) {
    list.push({ key: "pfCapped", tone: "info", text: interpolate(e.pfCapped, { ceiling: formatRupees(PF_WAGE_CEILING_MONTHLY) }) });
  }
  if (r.flags.rebateMarginalRelief) {
    list.push({ key: "rebateMarginalRelief", tone: "info", text: interpolate(e.rebateMarginalRelief, { limit: formatRupees(REBATE_INCOME_LIMIT) }) });
  }
  if (r.flags.surchargeMarginalRelief) {
    list.push({ key: "surchargeMarginalRelief", tone: "info", text: e.surchargeMarginalRelief });
  }
  if (hasPf || r.assumptions.includeGratuity) {
    list.push({ key: "basicEstimated", tone: "info", text: interpolate(e.basicEstimated, { percent: r.assumptions.pfWagesPercent }) });
  }
  if (hasPf) list.push({ key: "employerPfInCtc", tone: "info", text: e.employerPfInCtc });
  if (r.annual.variablePay > 0) list.push({ key: "variableNotMonthly", tone: "info", text: e.variableNotMonthly });
  if (r.annual.professionalTax > 0) {
    list.push({ key: "professionalTaxState", tone: "info", text: e.professionalTaxState });
    list.push({ key: "professionalTaxNotDeductible", tone: "info", text: e.professionalTaxNotDeductible });
  }
  list.push({ key: "newRegimeOnly", tone: "info", text: e.newRegimeOnly });
  if (r.annual.incomeTax > 0) list.push({ key: "tdsSpread", tone: "info", text: e.tdsSpread });
  list.push({ key: "estimate", tone: "info", text: e.estimate });
  return list;
}

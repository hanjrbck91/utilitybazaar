import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { enSalary } from "../../translations/en/index.ts";
import { hiSalary } from "../../translations/hi/index.ts";
import {
  DEFAULT_PF_MODE,
  DEFAULT_PF_WAGES_PERCENT,
  calculateSalary,
  formatRupees,
  type SalaryBreakdown,
} from "../../lib/salary/index.ts";
import {
  breakdownGroups,
  computeView,
  ctcInLakhs,
  errorMessage,
  initialFormState,
  inputHints,
  notices,
  resultSummary,
  taxRows,
  type SalaryFormState,
} from "./model.ts";

// The view-model is the only bridge between the Salary Calculator's UI
// and its engine. These tests pin that it passes the form to the engine
// faithfully, renders the engine's own figures, and never computes one.

const form = (patch: Partial<SalaryFormState>): SalaryFormState => ({ ...initialFormState(), ...patch });

function okResult(patch: Partial<SalaryFormState>): SalaryBreakdown {
  const view = computeView(form(patch));
  assert.equal(view.status, "ok", JSON.stringify(view));
  return view.status === "ok" ? view.result : (undefined as never);
}

// --- defaults and engine pass-through -------------------------------------------

test("initial form uses the engine's own defaults", () => {
  const state = initialFormState();
  assert.equal(state.ctc, "");
  assert.equal(state.pfWagesPercent, String(DEFAULT_PF_WAGES_PERCENT));
  assert.equal(state.pfMode, DEFAULT_PF_MODE);
  assert.equal(state.includeGratuity, false);
  assert.equal(state.variablePayPercent, "");
  assert.equal(state.professionalTax, "");
});

test("empty CTC shows the empty state, not an error", () => {
  assert.deepEqual(computeView(initialFormState()), { status: "empty" });
  assert.deepEqual(computeView(form({ ctc: "   " })), { status: "empty" });
});

test("a valid CTC returns exactly the engine's result", () => {
  assert.deepEqual(okResult({ ctc: "1200000" }), calculateSalary({ annualCtc: 12_00_000 }));
});

test("every option is passed through to the engine unchanged", () => {
  const result = okResult({
    ctc: "2745678",
    variablePayPercent: "12.5",
    pfWagesPercent: "47.3",
    pfMode: "capped",
    includeGratuity: true,
    professionalTax: "2500",
  });
  assert.deepEqual(
    result,
    calculateSalary({
      annualCtc: 27_45_678,
      variablePayPercent: 12.5,
      pfWagesPercent: 47.3,
      pfMode: "capped",
      includeGratuity: true,
      professionalTaxAnnual: 2_500,
    }),
  );
});

test("empty optional fields fall back to the engine's defaults", () => {
  assert.deepEqual(
    okResult({ ctc: "1500000", pfWagesPercent: "" }),
    calculateSalary({ annualCtc: 15_00_000 }),
  );
});

test("each PF mode reaches the engine", () => {
  for (const pfMode of ["full", "capped", "none"] as const) {
    assert.equal(okResult({ ctc: "2000000", pfMode }).assumptions.pfMode, pfMode);
  }
  assert.equal(okResult({ ctc: "2000000", pfMode: "none" }).annual.employeePf, 0);
});

test("live calculation: every change gives a fresh engine result", () => {
  const first = okResult({ ctc: "1200000" });
  const second = okResult({ ctc: "1200001" });
  assert.notEqual(first.annual.ctc, second.annual.ctc);
  assert.deepEqual(okResult({ ctc: "1200000" }), first, "same input, same output");
});

// --- validation comes from the engine -------------------------------------------

test("invalid CTC values map to the engine's error codes", () => {
  assert.deepEqual(computeView(form({ ctc: "abc" })), { status: "error", field: "annualCtc", code: "NOT_A_NUMBER" });
  assert.deepEqual(computeView(form({ ctc: "0" })), { status: "error", field: "annualCtc", code: "NOT_POSITIVE" });
  assert.deepEqual(computeView(form({ ctc: "100000001" })), { status: "error", field: "annualCtc", code: "TOO_LARGE" });
});

test("invalid secondary fields are reported against the right field", () => {
  assert.deepEqual(computeView(form({ ctc: "1200000", variablePayPercent: "100" })), {
    status: "error",
    field: "variablePayPercent",
    code: "PERCENT_OUT_OF_RANGE",
  });
  assert.deepEqual(computeView(form({ ctc: "1200000", pfWagesPercent: "0" })), {
    status: "error",
    field: "pfWagesPercent",
    code: "PERCENT_OUT_OF_RANGE",
  });
  assert.deepEqual(computeView(form({ ctc: "1200000", professionalTax: "3000" })), {
    status: "error",
    field: "professionalTaxAnnual",
    code: "PROFESSIONAL_TAX_TOO_HIGH",
  });
});

test("structure errors come back from the engine as result-level errors", () => {
  assert.deepEqual(computeView(form({ ctc: "5000", variablePayPercent: "99.99" })), {
    status: "error",
    field: "result",
    code: "IMPOSSIBLE_STRUCTURE",
  });
  assert.deepEqual(computeView(form({ ctc: "2500", professionalTax: "2500" })), {
    status: "error",
    field: "result",
    code: "NON_POSITIVE_TAKE_HOME",
  });
});

test("error messages are localized, field-specific and fully filled in", () => {
  for (const d of [enSalary, hiSalary]) {
    assert.equal(errorMessage(d, "variablePayPercent", "PERCENT_OUT_OF_RANGE"), d.fieldErrors.variablePayPercent);
    assert.equal(errorMessage(d, "pfWagesPercent", "PERCENT_OUT_OF_RANGE"), d.fieldErrors.pfWagesPercent);
    assert.ok(errorMessage(d, "annualCtc", "TOO_LARGE").includes("₹10,00,00,000"));
    assert.ok(errorMessage(d, "professionalTaxAnnual", "PROFESSIONAL_TAX_TOO_HIGH").includes("₹2,500"));
    for (const code of Object.keys(d.errors) as Array<keyof typeof d.errors>) {
      const field = code === "PROFESSIONAL_TAX_TOO_HIGH" ? "professionalTaxAnnual" : "annualCtc";
      assert.doesNotMatch(errorMessage(d, field, code), /\{\w+\}/, `${code} left a placeholder`);
    }
  }
});

// --- presentation of engine output -------------------------------------------------

test("CTC echo in lakhs uses the engine's parser", () => {
  assert.equal(ctcInLakhs(enSalary, "1200000"), "= 12 lakh a year");
  assert.equal(ctcInLakhs(hiSalary, "1250000"), "= 12.5 लाख सालाना");
  assert.equal(ctcInLakhs(enSalary, ""), null);
  assert.equal(ctcInLakhs(enSalary, "0"), null);
});

test("hints show the engine's constants, Indian-formatted", () => {
  const hints = inputHints(enSalary);
  assert.equal(hints.pfMode.full, "12% of your Basic + DA");
  assert.equal(hints.pfMode.capped, "12% of Basic + DA, counting at most ₹25,000 a month");
  assert.ok(hints.pfWages.includes("50%"));
  assert.ok(hints.professionalTax.includes("₹2,500"));
  assert.equal(hints.taxRegime, "New tax regime, tax year 2026-27");
});

test("result summary: monthly and annual take-home, formatted from the engine", () => {
  const r = okResult({ ctc: "2000000" });
  const s = resultSummary(enSalary, r);
  assert.equal(s.monthlyTakeHome, "₹1,32,713.33");
  assert.equal(s.monthlyTakeHome, formatRupees(r.monthly.takeHome));
  assert.equal(s.annualTakeHome, "₹15,92,560");
  assert.equal(s.variableNote, null);
  assert.equal(
    resultSummary(enSalary, okResult({ ctc: "1200000", variablePayPercent: "10" })).variableNote,
    "Plus ₹1,20,000 variable pay in the year, if it is paid in full.",
  );
});

test("breakdown rows: CTC → parts not paid monthly → gross → deductions → take-home", () => {
  const r = okResult({ ctc: "1200000", variablePayPercent: "10", includeGratuity: true, professionalTax: "2400" });
  const groups = breakdownGroups(enSalary, r);
  assert.deepEqual(groups.map((g) => g.key), ["ctc", "notMonthly", "gross", "deductions", "takeHome"]);
  const rows = Object.fromEntries(groups.flatMap((g) => g.rows).map((row) => [row.key, row]));
  assert.equal(rows.ctc.annual, formatRupees(r.annual.ctc));
  assert.equal(rows.variablePay.annual, formatRupees(r.annual.variablePay));
  assert.equal(rows.variablePay.monthly, null, "variable pay is not a monthly amount");
  assert.equal(rows.employerPf.monthly, formatRupees(r.monthly.employerPf));
  assert.equal(rows.gratuity.annual, formatRupees(r.annual.gratuity));
  assert.equal(rows.grossSalary.monthly, formatRupees(r.monthly.grossSalary));
  assert.equal(rows.grossSalary.annual, formatRupees(r.annual.grossSalary));
  assert.equal(rows.employeePf.annual, formatRupees(r.annual.employeePf));
  assert.equal(rows.professionalTax.monthly, "₹200");
  assert.equal(rows.incomeTax.annual, formatRupees(r.annual.incomeTax));
  assert.equal(rows.takeHome.monthly, formatRupees(r.monthly.takeHome));
  assert.equal(rows.takeHome.annual, formatRupees(r.annual.takeHome));
});

test("breakdown leaves out components that are zero, but always shows income tax", () => {
  const r = okResult({ ctc: "600000", pfMode: "none" });
  const keys = breakdownGroups(enSalary, r).flatMap((g) => g.rows.map((row) => row.key));
  assert.deepEqual(keys, ["ctc", "grossSalary", "incomeTax", "takeHome"]);
});

test("tax rows mirror the engine's working; slabs only where income falls", () => {
  const r = okResult({ ctc: "2000000" });
  const rows = taxRows(enSalary, r);
  const byKey = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  assert.equal(byKey.taxableIncome, "₹18,05,000");
  assert.equal(byKey.taxBeforeRebate, "₹1,61,000");
  assert.equal(byKey.cess, "₹6,440");
  assert.equal(byKey.totalTax, "₹1,67,440");
  assert.equal(rows.filter((row) => row.kind === "slab").length, 5, "4–8L, 8–12L, 12–16L, 16–20L + nil slab");
  assert.ok(rows.some((row) => row.label.startsWith("₹0 to ₹4,00,000")));
  assert.equal(byKey.rebate, undefined, "no rebate row above the limit");
});

test("tax rows: rebate and surcharge marginal relief appear when the engine applies them", () => {
  const rebate = taxRows(enSalary, okResult({ ctc: "1285000", pfMode: "none" }));
  assert.equal(rebate.find((row) => row.key === "rebate")?.value, "₹51,500");
  const surcharge = taxRows(enSalary, okResult({ ctc: "5085000", pfMode: "none" }));
  assert.equal(surcharge.find((row) => row.key === "surcharge")?.value, "₹7,000");
  assert.equal(surcharge.find((row) => row.key === "marginalRelief")?.value, "₹1,01,300");
});

test("notices: standing assumptions are always shown", () => {
  const keys = notices(enSalary, okResult({ ctc: "1200000" })).map((n) => n.key);
  assert.ok(keys.includes("basicEstimated"));
  assert.ok(keys.includes("employerPfInCtc"));
  assert.ok(keys.includes("newRegimeOnly"));
  assert.ok(keys.includes("estimate"));
});

test("notices: engine flags and inputs each produce their own notice", () => {
  const keysFor = (patch: Partial<SalaryFormState>) => notices(enSalary, okResult(patch)).map((n) => n.key);
  assert.ok(keysFor({ ctc: "2000000", pfMode: "capped" }).includes("pfCapped"));
  assert.ok(keysFor({ ctc: "1200000", pfWagesPercent: "40" }).includes("wagesBelowFloor"));
  assert.ok(keysFor({ ctc: "1200000", variablePayPercent: "10" }).includes("variableNotMonthly"));
  assert.ok(keysFor({ ctc: "1200000", professionalTax: "2400" }).includes("professionalTaxNotDeductible"));
  assert.ok(keysFor({ ctc: "1285000", pfMode: "none" }).includes("rebateMarginalRelief"));
  assert.ok(keysFor({ ctc: "5085000", pfMode: "none" }).includes("surchargeMarginalRelief"));
  assert.ok(keysFor({ ctc: "2000000" }).includes("tdsSpread"));
  assert.ok(!keysFor({ ctc: "1200000", pfMode: "none" }).includes("employerPfInCtc"));
  const below = notices(enSalary, okResult({ ctc: "1200000", pfWagesPercent: "40" }));
  assert.equal(below.find((n) => n.key === "wagesBelowFloor")?.tone, "warning");
});

test("no rendered string is left with an unfilled placeholder, in either language", () => {
  const scenarios: Array<Partial<SalaryFormState>> = [
    { ctc: "1200000" },
    { ctc: "2000000", pfMode: "capped", variablePayPercent: "15", includeGratuity: true, professionalTax: "2500" },
    { ctc: "1285000", pfMode: "none", pfWagesPercent: "30" },
    { ctc: "5085000", pfMode: "none" },
  ];
  for (const d of [enSalary, hiSalary]) {
    for (const patch of scenarios) {
      const r = okResult(patch);
      const strings = [
        ...Object.values(resultSummary(d, r)).filter((s): s is string => typeof s === "string"),
        ...breakdownGroups(d, r).flatMap((g) => [g.label ?? "", ...g.rows.map((row) => row.label)]),
        ...taxRows(d, r).map((row) => row.label),
        ...notices(d, r).map((n) => n.text),
        ...Object.values(inputHints(d)).flatMap((h) => (typeof h === "string" ? [h] : Object.values(h))),
      ];
      for (const s of strings) assert.doesNotMatch(s, /\{\w+\}/, `unfilled placeholder in "${s}"`);
    }
  }
});

// --- single source of truth ------------------------------------------------------------

test("only the view-model calls the salary engine", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const pageDir = join(here, "../../app/[locale]/salary-calculator");
  const files = [
    ...readdirSync(here).map((f) => join(here, f)),
    ...readdirSync(pageDir).map((f) => join(pageDir, f)),
  ].filter((f) => /\.tsx?$/.test(f) && !f.endsWith(".test.ts") && !f.endsWith("model.ts"));

  const engineCalls = /\b(calculateSalary|tryCalculateSalary|computeIncomeTax|slabTax|surchargeRate|rebate|cess|roundRupee|round2)\s*\(/;
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, engineCalls, `${file} calls the engine directly`);
  }
  assert.ok(files.length >= 6, "expected the salary components and page to be checked");
});

import assert from "node:assert/strict";
import test from "node:test";

import { getSalaryDictionary, type SalaryDictionary } from "../i18n/index.ts";
import { enSalary } from "../../translations/en/index.ts";
import { hiSalary } from "../../translations/hi/index.ts";
import type { SalaryErrorCode } from "./types.ts";

/**
 * Same translation-key-parity contract as `../percentage/i18n.test.ts`,
 * applied to the Salary Calculator's own dictionary, plus checks that
 * tie the strings to the salary engine: every error code it can return
 * has a message, and every placeholder is one the UI can fill.
 */

function paths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function at(value: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], value);
}

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

/** Every error code `src/lib/salary` can produce. */
const ERROR_CODES: SalaryErrorCode[] = [
  "EMPTY",
  "NOT_A_NUMBER",
  "NOT_POSITIVE",
  "NEGATIVE",
  "TOO_LARGE",
  "PERCENT_OUT_OF_RANGE",
  "PROFESSIONAL_TAX_TOO_HIGH",
  "INVALID_PF_MODE",
  "IMPOSSIBLE_STRUCTURE",
  "NON_POSITIVE_TAKE_HOME",
];

// Compile-time: the errors map must accept every SalaryErrorCode
// (checked by `tsc`; a missing code is a type error).
const _errorsCoverEveryCode: Record<SalaryErrorCode, string> = enSalary.errors;
void _errorsCoverEveryCode;

/** Values the UI fills from the engine and its formatters. */
const ALLOWED_PLACEHOLDERS = new Set([
  "lakhs",
  "percent",
  "rate",
  "ceiling",
  "max",
  "year",
  "amount",
  "from",
  "to",
  "limit",
]);

test("Salary Calculator: English and Hindi dictionaries exist with the expected sections", () => {
  for (const [name, d] of [["en", enSalary], ["hi", hiSalary]] as const) {
    for (const section of ["app", "calculator", "actions", "result", "breakdown", "tax", "explain", "errors", "fieldErrors"]) {
      assert.equal(typeof d[section as keyof SalaryDictionary], "object", `${name}.${section} missing`);
    }
    // Shell keys the shared components (header, language switch, copy button, footer) rely on.
    assert.ok(d.app.title && d.app.tagline && d.app.calculatorLabel && d.app.languageLabel, `${name}.app`);
    assert.ok(d.copy.label && d.copy.copied && d.copy.failed, `${name}.copy`);
    assert.ok(d.nav.about && d.nav.privacy && d.nav.terms, `${name}.nav`);
  }
});

test("Salary Calculator: every locale has exactly the same keys", () => {
  assert.deepEqual(paths(hiSalary).sort(), paths(enSalary).sort());
});

test("Salary Calculator: no translated string is empty or left in English by accident", () => {
  for (const path of paths(enSalary)) {
    const enValue = at(enSalary, path) as string;
    const hiValue = at(hiSalary, path) as string;
    assert.equal(typeof enValue, "string", `${path} must be a string in en`);
    assert.equal(typeof hiValue, "string", `${path} must be a string in hi`);
    assert.ok(enValue.trim().length > 0, `${path} is empty in en`);
    assert.ok(hiValue.trim().length > 0, `${path} is empty in hi`);
    assert.notEqual(hiValue, enValue, `${path} is untranslated in hi`);
  }
});

test("Salary Calculator: Hindi strings are written in Devanagari, not only Latin abbreviations", () => {
  for (const path of paths(hiSalary)) {
    if (path === "localeName") continue; // the language switcher's own label
    const value = at(hiSalary, path) as string;
    assert.match(value, /[ऀ-ॿ]/, `${path} has no Hindi text: "${value}"`);
  }
});

test("Salary Calculator: placeholders match between locales", () => {
  for (const path of paths(enSalary)) {
    assert.deepEqual(
      placeholders(at(hiSalary, path) as string),
      placeholders(at(enSalary, path) as string),
      `placeholders differ at ${path}`,
    );
  }
});

test("Salary Calculator: every placeholder is one the UI can fill", () => {
  for (const path of paths(enSalary)) {
    for (const name of placeholders(at(enSalary, path) as string)) {
      assert.ok(ALLOWED_PLACEHOLDERS.has(name), `unknown placeholder {${name}} at ${path}`);
    }
  }
});

test("Salary Calculator: every engine error code has a message, and nothing else", () => {
  for (const d of [enSalary, hiSalary]) {
    assert.deepEqual(Object.keys(d.errors).sort(), [...ERROR_CODES].sort());
  }
});

test("Salary Calculator: both percentage fields have their own out-of-range message", () => {
  for (const d of [enSalary, hiSalary]) {
    assert.deepEqual(Object.keys(d.fieldErrors).sort(), ["pfWagesPercent", "variablePayPercent"]);
  }
});

test("Salary Calculator: dictionary lookup by locale, with an English fallback", () => {
  assert.equal(getSalaryDictionary("en"), enSalary);
  assert.equal(getSalaryDictionary("hi"), hiSalary);
  assert.equal(getSalaryDictionary("fr"), enSalary);
  assert.equal(getSalaryDictionary(undefined), enSalary);
});

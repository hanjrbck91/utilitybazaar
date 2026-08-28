import assert from "node:assert/strict";
import test from "node:test";

import { en } from "../../translations/en/index.ts";
import { hi } from "../../translations/hi/index.ts";
import {
  DEFAULT_LOCALE,
  LOCALES,
  getDictionary,
  getLocaleTag,
  interpolate,
  isLocale,
} from "./index.ts";

/** Every leaf path in a nested string object, e.g. "result.total". */
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

test("English is the default locale", () => {
  assert.equal(DEFAULT_LOCALE, "en");
  assert.deepEqual([...LOCALES], ["en", "hi"]);
});

test("every locale has exactly the same keys", () => {
  const enPaths = paths(en).sort();
  const hiPaths = paths(hi).sort();
  assert.deepEqual(hiPaths, enPaths);
});

test("no translated string is empty or left in English by accident", () => {
  // Keys that are intentionally identical across locales: the tax
  // component names (CGST, SGST, IGST, UTGST) appear in Latin script on
  // every Indian invoice, and the supply-treatment captions and the
  // rate label are just those acronyms.
  const shared = new Set([
    "result.cgst",
    "result.sgst",
    "result.igst",
    "share.cgst",
    "share.sgst",
    "share.igst",
    "share.gst",
    "calculator.treatmentIntra",
    "calculator.treatmentInter",
  ]);

  for (const path of paths(en)) {
    const enValue = at(en, path) as string;
    const hiValue = at(hi, path) as string;
    assert.equal(typeof hiValue, "string", `${path} must be a string`);
    assert.ok(hiValue.trim().length > 0, `${path} is empty in hi`);
    if (!shared.has(path)) {
      assert.notEqual(hiValue, enValue, `${path} is untranslated in hi`);
    }
  }
});

test("placeholders match between locales", () => {
  const placeholders = (s: string) =>
    [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

  for (const path of paths(en)) {
    assert.deepEqual(
      placeholders(at(hi, path) as string),
      placeholders(at(en, path) as string),
      `placeholders differ at ${path}`,
    );
  }
});

test("getDictionary resolves known locales and falls back safely", () => {
  assert.equal(getDictionary("en"), en);
  assert.equal(getDictionary("hi"), hi);
  assert.equal(getDictionary("fr"), en);
  assert.equal(getDictionary(undefined), en);
  assert.equal(getDictionary(null), en);
});

test("getLocaleTag returns BCP 47 tags", () => {
  assert.equal(getLocaleTag("en"), "en-IN");
  assert.equal(getLocaleTag("hi"), "hi-IN");
  assert.equal(getLocaleTag("zz"), "en-IN");
});

test("isLocale guards unknown input", () => {
  assert.equal(isLocale("hi"), true);
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("de"), false);
  assert.equal(isLocale(7), false);
  assert.equal(isLocale(undefined), false);
});

test("interpolate fills placeholders and leaves unknown ones visible", () => {
  assert.equal(interpolate("Includes {gst} GST at {rate}%", { gst: "₹1,800", rate: 18 }), "Includes ₹1,800 GST at 18%");
  assert.equal(interpolate("no placeholders"), "no placeholders");
  assert.equal(interpolate("{missing} stays", {}), "{missing} stays");
  assert.equal(interpolate("{a}{a}", { a: "x" }), "xx");
});

test("every locale has a distinct, non-empty display name", () => {
  const names = LOCALES.map((code) => getDictionary(code).localeName);
  assert.deepEqual(names, ["English", "हिन्दी"]);
  assert.equal(new Set(names).size, names.length);
});

test("official GST supply terminology and its tax treatment", () => {
  const enCalc = getDictionary("en").calculator;
  assert.equal(enCalc.taxType, "Type of supply");
  assert.equal(enCalc.intraState, "Intra-State");
  assert.equal(enCalc.interState, "Inter-State");
  // Intra-State -> CGST + SGST/UTGST; Inter-State -> IGST
  assert.equal(enCalc.treatmentIntra, "CGST + SGST / UTGST");
  assert.equal(enCalc.treatmentInter, "IGST");

  const hiCalc = getDictionary("hi").calculator;
  assert.equal(hiCalc.taxType, "आपूर्ति का प्रकार");
  assert.match(hiCalc.intraState, /राज्य/);
  assert.match(hiCalc.interState, /राज्य/);
  assert.notEqual(hiCalc.intraState, hiCalc.interState);
  // The treatment acronyms are the same on every Indian invoice.
  assert.equal(hiCalc.treatmentIntra, enCalc.treatmentIntra);
  assert.equal(hiCalc.treatmentInter, enCalc.treatmentInter);
});

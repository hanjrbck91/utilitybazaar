import assert from "node:assert/strict";
import test from "node:test";

import { calculateGst, type GstInput } from "./index.ts";
import { getDictionary } from "../i18n/index.ts";
import { buildSpeechText } from "./speech.ts";

const en = getDictionary("en");
const hi = getDictionary("hi");

const breakdown = (input: GstInput) => calculateGst(input);

const ADD_INTRA: GstInput = {
  amount: 10_000,
  mode: "add",
  gstRate: 18,
  taxType: "intraState",
};

test("Add GST, intra-state — English", () => {
  const text = buildSpeechText(breakdown(ADD_INTRA), en);
  assert.equal(
    text,
    "GST is 1,800 rupees. CGST is 900 rupees. SGST is 900 rupees. Total amount is 11,800 rupees.",
  );
});

test("Add GST, intra-state — Hindi", () => {
  const text = buildSpeechText(breakdown(ADD_INTRA), hi);
  assert.equal(
    text,
    "GST 1,800 रुपये है। CGST 900 रुपये है। SGST 900 रुपये है। कुल राशि 11,800 रुपये है।",
  );
});

test("Remove GST speaks the amount before GST instead of the total", () => {
  const text = buildSpeechText(
    breakdown({ amount: 11_800, mode: "remove", gstRate: 18, taxType: "intraState" }),
    en,
  );
  assert.match(text, /Amount before GST is 10,000 rupees\.$/);
  assert.doesNotMatch(text, /Total amount/);

  const hindi = buildSpeechText(
    breakdown({ amount: 11_800, mode: "remove", gstRate: 18, taxType: "intraState" }),
    hi,
  );
  assert.match(hindi, /GST से पहले की राशि 10,000 रुपये है।$/);
});

test("inter-state speaks IGST once, not GST twice", () => {
  const text = buildSpeechText(
    breakdown({ amount: 10_000, mode: "add", gstRate: 18, taxType: "interState" }),
    en,
  );
  assert.equal(text, "IGST is 1,800 rupees. Total amount is 11,800 rupees.");
  assert.doesNotMatch(text, /CGST|SGST/);
});

test("spoken amounts carry no currency symbol but keep Indian grouping", () => {
  const text = buildSpeechText(
    breakdown({ amount: 1_00_000, mode: "add", gstRate: 18, taxType: "interState" }),
    en,
  );
  assert.doesNotMatch(text, /₹/);
  assert.match(text, /1,18,000 rupees/);
});

test("decimal results are spoken to the paise", () => {
  const text = buildSpeechText(
    breakdown({ amount: 11_800, mode: "remove", gstRate: 1.5, taxType: "interState" }),
    en,
  );
  assert.match(text, /IGST is 174\.38 rupees/);
  assert.match(text, /11,625\.62 rupees/);
});

// --- speech text: mode x tax-type, both languages ------------------

test("speech text — add / remove x intra / inter, English and Hindi", () => {
  const cases = [
    {
      input: { amount: 10_000, mode: "add", gstRate: 18, taxType: "intraState" } as const,
      en: "GST is 1,800 rupees. CGST is 900 rupees. SGST is 900 rupees. Total amount is 11,800 rupees.",
      hi: "GST 1,800 रुपये है। CGST 900 रुपये है। SGST 900 रुपये है। कुल राशि 11,800 रुपये है।",
    },
    {
      input: { amount: 10_000, mode: "add", gstRate: 18, taxType: "interState" } as const,
      en: "IGST is 1,800 rupees. Total amount is 11,800 rupees.",
      hi: "IGST 1,800 रुपये है। कुल राशि 11,800 रुपये है।",
    },
    {
      input: { amount: 11_800, mode: "remove", gstRate: 18, taxType: "intraState" } as const,
      en: "GST is 1,800 rupees. CGST is 900 rupees. SGST is 900 rupees. Amount before GST is 10,000 rupees.",
      hi: "GST 1,800 रुपये है। CGST 900 रुपये है। SGST 900 रुपये है। GST से पहले की राशि 10,000 रुपये है।",
    },
    {
      input: { amount: 11_800, mode: "remove", gstRate: 18, taxType: "interState" } as const,
      en: "IGST is 1,800 rupees. Amount before GST is 10,000 rupees.",
      hi: "IGST 1,800 रुपये है। GST से पहले की राशि 10,000 रुपये है।",
    },
  ];

  for (const c of cases) {
    const enText = buildSpeechText(breakdown(c.input), en);
    const hiText = buildSpeechText(breakdown(c.input), hi);
    assert.equal(enText, c.en);
    assert.equal(hiText, c.hi);

    if (c.input.taxType === "interState") {
      // IGST only, spoken once — the CGST/SGST split is not mentioned and
      // the tax amount is not repeated as a separate "GST" line.
      for (const text of [enText, hiText]) {
        assert.doesNotMatch(text, /CGST|SGST/);
        assert.equal((text.match(/IGST/g) ?? []).length, 1);
      }
    }
  }
});

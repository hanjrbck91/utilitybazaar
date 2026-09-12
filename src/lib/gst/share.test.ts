import assert from "node:assert/strict";
import test from "node:test";

import { calculateGst, type GstInput } from "./index.ts";
import { getDictionary } from "../i18n/index.ts";
import { buildShareText } from "./share.ts";

const en = getDictionary("en");
const hi = getDictionary("hi");

const ADD_INTRA: GstInput = {
  amount: 10_000,
  mode: "add",
  gstRate: 18,
  taxType: "intraState",
};

test("share text lists the figures, input first and answer last", () => {
  const text = buildShareText({ breakdown: calculateGst(ADD_INTRA), dictionary: en });
  assert.equal(
    text,
    [
      "GST calculation — GST added",
      "",
      "Amount before GST: ₹10,000",
      "GST (18%): ₹1,800",
      "CGST: ₹900",
      "SGST: ₹900",
      "Total amount: ₹11,800",
    ].join("\n"),
  );
});

test("remove mode ends on the amount before GST", () => {
  const text = buildShareText({
    breakdown: calculateGst({ ...ADD_INTRA, amount: 11_800, mode: "remove" }),
    dictionary: en,
  });
  const lines = text.split("\n");
  assert.equal(lines[0], "GST calculation — GST removed");
  assert.equal(lines[2], "Total amount: ₹11,800");
  assert.equal(lines.at(-1), "Amount before GST: ₹10,000");
});

test("inter-state shows IGST instead of CGST and SGST", () => {
  const text = buildShareText({
    breakdown: calculateGst({ ...ADD_INTRA, taxType: "interState" }),
    dictionary: en,
  });
  assert.match(text, /IGST: ₹1,800/);
  assert.doesNotMatch(text, /CGST|SGST/);
});

test("shop name and url are optional and trimmed", () => {
  const breakdown = calculateGst(ADD_INTRA);

  const bare = buildShareText({ breakdown, dictionary: en });
  assert.doesNotMatch(bare, /https?:/);

  const full = buildShareText({
    breakdown,
    dictionary: en,
    businessName: "  Sharma Traders  ",
    url: "https://example.test",
  });
  assert.equal(full.split("\n")[0], "Sharma Traders");
  assert.equal(full.split("\n").at(-1), "https://example.test");

  const blank = buildShareText({ breakdown, dictionary: en, businessName: "   ", url: "  " });
  assert.equal(blank, bare);
});

test("share text is localized without touching numbers or rates", () => {
  const text = buildShareText({
    breakdown: calculateGst(ADD_INTRA),
    dictionary: hi,
  });
  assert.match(text, /GST हिसाब — GST जोड़ा गया/);
  assert.match(text, /कुल राशि: ₹11,800/);
  // Figures, currency and the rate stay identical across locales.
  assert.match(text, /GST \(18%\): ₹1,800/);
  assert.match(text, /CGST: ₹900/);
});

test("share text stays short enough for a message", () => {
  const text = buildShareText({
    breakdown: calculateGst(ADD_INTRA),
    dictionary: en,
    businessName: "Sharma Traders",
    url: "https://example.test",
  });
  assert.ok(text.length < 300, `share text was ${text.length} characters`);
  assert.ok(text.split("\n").length <= 11);
});

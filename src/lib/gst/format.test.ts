import assert from "node:assert/strict";
import test from "node:test";

import { formatINR } from "./index.ts";

test("Indian digit grouping (blueprint §6)", () => {
  assert.equal(formatINR(1_000), "₹1,000");
  assert.equal(formatINR(10_000), "₹10,000");
  assert.equal(formatINR(100_000), "₹1,00,000");
  assert.equal(formatINR(1_000_000), "₹10,00,000");
  assert.equal(formatINR(10_000_000), "₹1,00,00,000");
  assert.equal(formatINR(1_000_000_000), "₹1,00,00,00,000");
});

test("small values need no grouping", () => {
  assert.equal(formatINR(0), "₹0");
  assert.equal(formatINR(5), "₹5");
  assert.equal(formatINR(50), "₹50");
  assert.equal(formatINR(999), "₹999");
});

test("paise shown only when present (auto mode)", () => {
  assert.equal(formatINR(1_800), "₹1,800");
  assert.equal(formatINR(1_234.5), "₹1,234.50");
  assert.equal(formatINR(1_234.56), "₹1,234.56");
  assert.equal(formatINR(1_234.996), "₹1,235"); // rounds up to a whole rupee
});

test("options: symbol and fixed decimals", () => {
  assert.equal(formatINR(1_000, { symbol: false }), "1,000");
  assert.equal(formatINR(1_00_000, { symbol: false }), "1,00,000");
  assert.equal(formatINR(1_000, { decimals: 2 }), "₹1,000.00");
  assert.equal(formatINR(1_234.5, { decimals: 0 }), "₹1,235");
});

test("negative values keep the sign before the symbol", () => {
  assert.equal(formatINR(-500), "-₹500");
  assert.equal(formatINR(-1_00_000.5), "-₹1,00,000.50");
});

test("non-finite input formats as zero", () => {
  assert.equal(formatINR(Number.NaN), "₹0");
  assert.equal(formatINR(Number.POSITIVE_INFINITY), "₹0");
});

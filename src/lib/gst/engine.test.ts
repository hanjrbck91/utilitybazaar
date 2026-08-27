import assert from "node:assert/strict";
import test from "node:test";

import {
  addGst,
  calculateCgstSgst,
  calculateGst,
  calculateIgst,
  createCalculation,
  removeGst,
  roundCurrency,
  tryCalculateGst,
} from "./index.ts";

test("₹10,000 + 18% -> GST ₹1,800, total ₹11,800", () => {
  const r = calculateGst({ amount: 10_000, mode: "add", gstRate: 18, taxType: "intraState" });
  assert.equal(r.baseAmount, 10_000);
  assert.equal(r.gstAmount, 1_800);
  assert.equal(r.total, 11_800);
});

test("intra-state 18% -> CGST ₹900 + SGST ₹900", () => {
  const r = calculateGst({ amount: 10_000, mode: "add", gstRate: 18, taxType: "intraState" });
  assert.equal(r.cgst, 900);
  assert.equal(r.sgst, 900);
  assert.equal(r.igst, 0);
  assert.equal(roundCurrency(r.cgst + r.sgst), r.gstAmount);
});

test("inter-state 18% -> IGST ₹1,800", () => {
  const r = calculateGst({ amount: 10_000, mode: "add", gstRate: 18, taxType: "interState" });
  assert.equal(r.igst, 1_800);
  assert.equal(r.cgst, 0);
  assert.equal(r.sgst, 0);
});

test("₹11,800 inclusive of 18% -> base ₹10,000, GST ₹1,800", () => {
  const r = calculateGst({ amount: 11_800, mode: "remove", gstRate: 18, taxType: "intraState" });
  assert.equal(r.baseAmount, 10_000);
  assert.equal(r.gstAmount, 1_800);
  assert.equal(r.total, 11_800);
  assert.equal(r.cgst, 900);
  assert.equal(r.sgst, 900);
});

test("custom GST rates (0.25%, 1.5%, 40%)", () => {
  assert.equal(addGst(10_000, 0.25).gstAmount, 25);
  assert.equal(addGst(10_000, 1.5).gstAmount, 150);
  assert.equal(addGst(10_000, 40).gstAmount, 4_000);

  const r = calculateGst({ amount: 2_000, mode: "add", gstRate: 40, taxType: "interState" });
  assert.equal(r.igst, 800);
  assert.equal(r.total, 2_800);
});

test("0% rate -> no GST, total equals base", () => {
  const r = calculateGst({ amount: 500, mode: "add", gstRate: 0, taxType: "intraState" });
  assert.equal(r.gstAmount, 0);
  assert.equal(r.cgst, 0);
  assert.equal(r.total, 500);
});

test("decimal amounts round to paise", () => {
  // 2999.99 * 0.18 = 539.9982 -> 540.00
  const r = calculateGst({ amount: 2_999.99, mode: "add", gstRate: 18, taxType: "interState" });
  assert.equal(r.gstAmount, 540);
  assert.equal(r.igst, 540);
  assert.equal(r.total, 3_539.99);

  // 1234.56 * 0.12 = 148.1472 -> 148.15
  const r2 = calculateGst({ amount: 1_234.56, mode: "add", gstRate: 12, taxType: "intraState" });
  assert.equal(r2.gstAmount, 148.15);
  // components are each paise-accurate; totalling them for display re-rounds
  assert.equal(roundCurrency(r2.cgst + r2.sgst), 148.15);
  assert.equal(r2.total, 1_382.71);
});

test("zero and invalid input rejected", () => {
  assert.throws(
    () => calculateGst({ amount: 0, mode: "add", gstRate: 18, taxType: "intraState" }),
    /greater than zero/,
  );
  assert.throws(
    () => calculateGst({ amount: -5, mode: "add", gstRate: 18, taxType: "intraState" }),
    /negative/,
  );
  assert.throws(
    () => calculateGst({ amount: Number.NaN, mode: "add", gstRate: 18, taxType: "intraState" }),
  );
  assert.throws(
    () => calculateGst({ amount: 100, mode: "add", gstRate: -1, taxType: "intraState" }),
  );

  const bad = tryCalculateGst({ amount: 0, mode: "add", gstRate: 18, taxType: "intraState" });
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.equal(bad.code, "ZERO");
});

test("large Indian amounts stay exact", () => {
  // ₹100 crore + 18%
  const r = calculateGst({ amount: 1_000_000_000, mode: "add", gstRate: 18, taxType: "interState" });
  assert.equal(r.gstAmount, 180_000_000);
  assert.equal(r.total, 1_180_000_000);
});

test("floating-point / rounding edge cases", () => {
  assert.equal(roundCurrency(0.1 + 0.2), 0.3);
  assert.equal(roundCurrency(1.005 * 100), 100.5);
  assert.equal(roundCurrency(-0), 0);
  assert.equal(roundCurrency(Number.POSITIVE_INFINITY), 0);

  // remove -> add round-trips back to the original total
  const removed = removeGst(11_800, 18);
  assert.equal(addGst(removed.baseAmount, 18).total, 11_800);

  // invariants for an awkward amount/rate
  const r = calculateGst({ amount: 7_777.77, mode: "add", gstRate: 6, taxType: "intraState" });
  assert.equal(roundCurrency(r.baseAmount + r.gstAmount), r.total);
  assert.equal(roundCurrency(r.cgst + r.sgst), r.gstAmount);

  // odd-paise GST still splits back to the same total (re-rounded)
  const split = calculateCgstSgst(100.01);
  assert.equal(roundCurrency(split.cgst + split.sgst), 100.01);
});

test("calculateIgst mirrors the gst amount", () => {
  assert.deepEqual(calculateIgst(1_800), { igst: 1_800 });
  assert.deepEqual(calculateIgst(99.999), { igst: 100 });
});

test("createCalculation adds id + timestamp, breakdown stays deterministic", () => {
  const input = { amount: 10_000, mode: "add", gstRate: 18, taxType: "intraState" } as const;

  const fixed = createCalculation(input, { id: "fixed-id", timestamp: 1_000 });
  assert.equal(fixed.id, "fixed-id");
  assert.equal(fixed.timestamp, 1_000);
  assert.equal(fixed.amount, 10_000);
  assert.equal(fixed.total, 11_800);
  assert.equal(fixed.cgst, 900);

  const auto = createCalculation(input);
  assert.ok(auto.id.length > 0);
  assert.ok(auto.timestamp > 0);
});

import assert from "node:assert/strict";
import test from "node:test";

import { computeIncomeTax } from "./engine.ts";
import { cess, rebate, round2, roundRupee, slabTax, surcharge, surchargeRate } from "./math.ts";

// Income-tax working under the new regime (Income-tax Act 2025, s.202,
// tax year 2026-27). Every expected figure below is worked by hand from
// the slab table: 4–8L 5% = 20,000 · 8–12L 10% = 40,000 · 12–16L 15% =
// 60,000 · 16–20L 20% = 80,000 · 20–24L 25% = 1,00,000 · above 24L 30%.

// --- rounding ------------------------------------------------------------

test("roundRupee rounds half up and normalises -0", () => {
  assert.equal(roundRupee(10.5), 11);
  assert.equal(roundRupee(10.49), 10);
  assert.equal(roundRupee(28846.15), 28846);
  assert.equal(roundRupee(-0.4), 0);
  assert.equal(Object.is(roundRupee(-0.4), -0), false);
  assert.equal(roundRupee(Number.NaN), 0);
});

test("round2 rounds paise half up", () => {
  assert.equal(round2(132713.3333), 132713.33);
  assert.equal(round2(1.005), 1.01);
  assert.equal(round2(83333.335), 83333.34);
});

// --- slabs ---------------------------------------------------------------

test("slab tax: nothing up to ₹4 lakh", () => {
  assert.equal(slabTax(0).total, 0);
  assert.equal(slabTax(4_00_000).total, 0);
});

test("slab tax: each slab boundary", () => {
  assert.equal(slabTax(8_00_000).total, 20_000);
  assert.equal(slabTax(12_00_000).total, 60_000);
  assert.equal(slabTax(16_00_000).total, 1_20_000);
  assert.equal(slabTax(20_00_000).total, 2_00_000);
  assert.equal(slabTax(24_00_000).total, 3_00_000);
  assert.equal(slabTax(30_00_000).total, 4_80_000);
});

test("slab tax: rows add up to the total and cover the whole income", () => {
  const { rows, total } = slabTax(18_05_000);
  assert.equal(rows.length, 7);
  assert.equal(rows.reduce((s, r) => s + r.taxableInSlab, 0), 18_05_000);
  assert.equal(roundRupee(rows.reduce((s, r) => s + r.tax, 0)), total);
  assert.equal(total, 1_61_000);
  assert.equal(rows[6].to, null, "top slab is open-ended");
});

// --- rebate (s.156) --------------------------------------------------------

test("rebate: full tax wiped out up to ₹12 lakh", () => {
  assert.equal(rebate(10_53_000, 45_300), 45_300);
  assert.equal(rebate(12_00_000, 60_000), 60_000);
});

test("rebate: marginal relief just above ₹12 lakh", () => {
  // Income 12,10,000: tax 61,500, but tax may not exceed the 10,000 above 12L.
  assert.equal(rebate(12_10_000, 61_500), 51_500);
});

test("rebate: marginal relief ends where tax falls below the excess income", () => {
  // 60,000 + 15% of x = x  ->  x ≈ 70,588; relief exists at 12.70L, not at 12.71L.
  assert.ok(rebate(12_70_000, slabTax(12_70_000).total) > 0);
  assert.equal(rebate(12_71_000, slabTax(12_71_000).total), 0);
});

// --- surcharge -------------------------------------------------------------

test("surcharge rate by band", () => {
  assert.equal(surchargeRate(50_00_000), 0);
  assert.equal(surchargeRate(50_00_001), 0.1);
  assert.equal(surchargeRate(1_00_00_000), 0.1);
  assert.equal(surchargeRate(1_00_00_001), 0.15);
  assert.equal(surchargeRate(2_00_00_001), 0.25);
  assert.equal(surchargeRate(9_00_00_000), 0.25, "37% does not apply under s.202");
});

test("surcharge: marginal relief just above ₹50 lakh", () => {
  // Income 50,10,000: tax 10,83,000; full 10% surcharge would be 1,08,300.
  // Ceiling: tax at 50L (10,80,000) + 10,000 = 10,90,000 -> surcharge 7,000.
  const result = surcharge(50_10_000, 10_83_000);
  assert.deepEqual(result, { surcharge: 7_000, relief: 1_01_300 });
});

test("surcharge: no relief well inside a band", () => {
  const result = surcharge(99_25_000, 25_57_500);
  assert.deepEqual(result, { surcharge: 2_55_750, relief: 0 });
});

test("surcharge: marginal relief at the ₹1 crore and ₹2 crore thresholds", () => {
  // Tax+surcharge just above each threshold may exceed that at the
  // threshold by no more than the extra income.
  for (const threshold of [1_00_00_000, 2_00_00_000]) {
    const atT = computeIncomeTax(threshold + 75_000); // taxable = threshold exactly
    const justAbove = computeIncomeTax(threshold + 75_000 + 1_000);
    const before = atT.slabTax - atT.rebate + atT.surcharge;
    const after = justAbove.slabTax - justAbove.rebate + justAbove.surcharge;
    assert.ok(justAbove.surchargeRelief > 0, `relief expected above ${threshold}`);
    assert.ok(after - before <= 1_000, `jump at ${threshold} exceeds the extra income`);
  }
});

test("cess is 4% of tax plus surcharge", () => {
  assert.equal(cess(1_61_000), 6_440);
  assert.equal(cess(0), 0);
  assert.equal(cess(10_90_000), 43_600);
});

// --- full working ----------------------------------------------------------

test("income tax: standard deduction is ₹75,000 or the salary, if lower", () => {
  assert.equal(computeIncomeTax(19_50_000).standardDeduction, 75_000);
  assert.equal(computeIncomeTax(50_000).standardDeduction, 50_000);
  assert.equal(computeIncomeTax(50_000).taxableIncome, 0);
});

test("income tax: zero up to ₹12.75 lakh salary", () => {
  assert.equal(computeIncomeTax(12_75_000).totalTax, 0);
  assert.ok(computeIncomeTax(12_75_001).totalTax > 0);
});

test("income tax: ₹19.5 lakh salary", () => {
  // Taxable 18,75,000: 1,20,000 + 20% of 2,75,000 = 1,75,000; cess 7,000.
  const tax = computeIncomeTax(19_50_000);
  assert.equal(tax.slabTax, 1_75_000);
  assert.equal(tax.cess, 7_000);
  assert.equal(tax.totalTax, 1_82_000);
});

test("income tax: components always add up to the total", () => {
  for (const salary of [0, 3_00_000, 12_80_000, 25_00_000, 51_00_000, 1_01_00_000, 2_10_00_000, 10_00_00_000]) {
    const t = computeIncomeTax(salary);
    assert.equal(t.totalTax, t.slabTax - t.rebate + t.surcharge + t.cess, `salary ${salary}`);
    assert.ok(t.rebate >= 0 && t.rebate <= t.slabTax, `rebate bounds at ${salary}`);
  }
});

test("income tax never decreases as salary rises", () => {
  let previous = -1;
  for (let salary = 0; salary <= 3_00_00_000; salary += 25_000) {
    const total = computeIncomeTax(salary).totalTax;
    assert.ok(total >= previous, `tax fell at ${salary}: ${total} < ${previous}`);
    previous = total;
  }
});

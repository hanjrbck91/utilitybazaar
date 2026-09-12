import assert from "node:assert/strict";
import test from "node:test";

import { calculatePercentage, tryCalculatePercentage } from "./engine.ts";
import { formatNumber, formatPercent } from "./format.ts";
import { PercentageError } from "./types.ts";

// --- mode: "of" — a percentage of a number -----------------------------

test("percentage of a number", () => {
  const result = calculatePercentage({ mode: "of", percent: 18, number: 10_000 });
  assert.deepEqual(result, { mode: "of", percent: 18, number: 10_000, result: 1_800 });
});

test("percentage of a number: zero percent and zero number", () => {
  assert.equal(calculatePercentage({ mode: "of", percent: 0, number: 500 }).result, 0);
  assert.equal(calculatePercentage({ mode: "of", percent: 50, number: 0 }).result, 0);
});

test("percentage of a number: decimals", () => {
  const result = calculatePercentage({ mode: "of", percent: 12.5, number: 240 });
  assert.equal(result.result, 30);
});

test("percentage of a number: negative percent or number", () => {
  assert.equal(calculatePercentage({ mode: "of", percent: -20, number: 100 }).result, -20);
  assert.equal(calculatePercentage({ mode: "of", percent: 20, number: -100 }).result, -20);
});

test("percentage of a number: large values", () => {
  const result = calculatePercentage({ mode: "of", percent: 18, number: 1_00_00_000 });
  assert.equal(result.result, 18_00_000);
});

// --- mode: "isPercent" — X is what % of Y -------------------------------

test("what percentage one number is of another", () => {
  const result = calculatePercentage({ mode: "isPercent", part: 18, whole: 100 });
  assert.deepEqual(result, { mode: "isPercent", part: 18, whole: 100, result: 18 });
});

test("isPercent: part larger than whole exceeds 100%", () => {
  assert.equal(calculatePercentage({ mode: "isPercent", part: 150, whole: 100 }).result, 150);
});

test("isPercent: part is zero", () => {
  assert.equal(calculatePercentage({ mode: "isPercent", part: 0, whole: 100 }).result, 0);
});

test("isPercent: whole of zero is rejected", () => {
  assert.throws(
    () => calculatePercentage({ mode: "isPercent", part: 18, whole: 0 }),
    (err: unknown) => err instanceof PercentageError && err.code === "ZERO_BASE",
  );
});

test("isPercent: negative part or whole", () => {
  assert.equal(calculatePercentage({ mode: "isPercent", part: -18, whole: 100 }).result, -18);
});

// --- mode: "change" — percentage increase / decrease --------------------

test("percentage increase", () => {
  const result = calculatePercentage({ mode: "change", from: 100, to: 120 });
  assert.deepEqual(result, {
    mode: "change",
    from: 100,
    to: 120,
    difference: 20,
    result: 20,
    direction: "increase",
  });
});

test("percentage decrease", () => {
  const result = calculatePercentage({ mode: "change", from: 100, to: 80 });
  assert.deepEqual(result, {
    mode: "change",
    from: 100,
    to: 80,
    difference: -20,
    result: 20,
    direction: "decrease",
  });
});

test("percentage change: no change", () => {
  const result = calculatePercentage({ mode: "change", from: 100, to: 100 });
  assert.equal(result.result, 0);
  assert.ok(result.mode === "change");
  assert.equal(result.mode === "change" && result.direction, "none");
});

test("percentage change: from is zero is rejected", () => {
  assert.throws(
    () => calculatePercentage({ mode: "change", from: 0, to: 50 }),
    (err: unknown) => err instanceof PercentageError && err.code === "ZERO_BASE",
  );
});

test("percentage change: negative starting value", () => {
  const result = calculatePercentage({ mode: "change", from: -100, to: -50 });
  assert.ok(result.mode === "change");
  // from -100 to -50 moved toward zero, i.e. the magnitude decreased,
  // but the signed value itself rose — the engine reports the signed
  // direction, matching what "from -> to" reads as on the page.
  assert.equal(result.mode === "change" && result.direction, "increase");
});

test("percentage change: large values", () => {
  const result = calculatePercentage({ mode: "change", from: 1_000_000, to: 1_500_000 });
  assert.equal(result.result, 50);
});

// --- invalid input -------------------------------------------------------

test("empty and invalid input are rejected with stable error codes", () => {
  assert.throws(
    () => calculatePercentage({ mode: "of", percent: NaN, number: 10 }),
    (err: unknown) => err instanceof PercentageError && err.code === "NOT_A_NUMBER",
  );
  assert.throws(
    () => calculatePercentage({ mode: "of", number: 10 }),
    (err: unknown) => err instanceof PercentageError && err.code === "EMPTY",
  );
});

test("tryCalculatePercentage never throws", () => {
  const ok = tryCalculatePercentage({ mode: "of", percent: 18, number: 10_000 });
  assert.equal(ok.ok, true);
  assert.equal(ok.ok && ok.data.result, 1_800);

  const bad = tryCalculatePercentage({ mode: "isPercent", part: 18, whole: 0 });
  assert.equal(bad.ok, false);
  assert.equal(!bad.ok && bad.code, "ZERO_BASE");
});

// --- formatting ------------------------------------------------------------

test("formatNumber groups digits the Indian way, no currency symbol", () => {
  assert.equal(formatNumber(1_800), "1,800");
  assert.equal(formatNumber(1_00_000), "1,00,000");
  assert.equal(formatNumber(-1_800), "-1,800");
  assert.equal(formatNumber(0), "0");
});

test("formatPercent trims trailing zeros and appends %", () => {
  assert.equal(formatPercent(20), "20%");
  assert.equal(formatPercent(33.333), "33.33%");
  assert.equal(formatPercent(0), "0%");
  assert.equal(formatPercent(-18), "-18%");
});

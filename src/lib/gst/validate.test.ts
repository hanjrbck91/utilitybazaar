import assert from "node:assert/strict";
import test from "node:test";

import { validateAmount, validateRate } from "./index.ts";

test("valid amounts (number and string forms)", () => {
  assert.deepEqual(validateAmount(10_000), { valid: true, value: 10_000 });
  assert.deepEqual(validateAmount("10000"), { valid: true, value: 10_000 });
  assert.deepEqual(validateAmount("₹1,00,000"), { valid: true, value: 100_000 });
  assert.deepEqual(validateAmount("2999.99"), { valid: true, value: 2_999.99 });
  assert.deepEqual(validateAmount(".5"), { valid: true, value: 0.5 });
});

test("amounts are rounded to paise on the way in", () => {
  const r = validateAmount("10000.999");
  assert.equal(r.valid, true);
  if (r.valid) assert.equal(r.value, 10_001);
});

test("invalid amounts are rejected with the right code", () => {
  const cases: Array<[unknown, string]> = [
    ["", "EMPTY"],
    ["   ", "EMPTY"],
    [null, "EMPTY"],
    [undefined, "EMPTY"],
    ["abc", "NOT_A_NUMBER"],
    ["12abc", "NOT_A_NUMBER"],
    ["1.2.3", "NOT_A_NUMBER"],
    ["10.", "NOT_A_NUMBER"],
    [Number.NaN, "NOT_A_NUMBER"],
    [Number.POSITIVE_INFINITY, "NOT_A_NUMBER"],
    [-1, "NEGATIVE"],
    ["-5", "NOT_A_NUMBER"], // minus is stripped-free: "-5" fails the numeric pattern
    [0, "ZERO"],
    [0.001, "TOO_SMALL"],
    [1e15, "TOO_LARGE"],
  ];
  for (const [input, code] of cases) {
    const r = validateAmount(input);
    assert.equal(r.valid, false, `expected ${String(input)} to be invalid`);
    if (!r.valid) assert.equal(r.code, code, `input ${String(input)}`);
  }
});

test("valid GST rates", () => {
  assert.deepEqual(validateRate(18), { valid: true, value: 18 });
  assert.deepEqual(validateRate("18%"), { valid: true, value: 18 });
  assert.deepEqual(validateRate("0.25"), { valid: true, value: 0.25 });
  assert.deepEqual(validateRate(0), { valid: true, value: 0 });
  assert.deepEqual(validateRate(40), { valid: true, value: 40 });
});

test("invalid GST rates", () => {
  assert.equal(validateRate(-1).valid, false);
  assert.equal(validateRate(101).valid, false);
  assert.equal(validateRate("abc").valid, false);
  assert.equal(validateRate("").valid, false);

  const neg = validateRate(-1);
  if (!neg.valid) assert.equal(neg.code, "RATE_NEGATIVE");
  const big = validateRate(101);
  if (!big.valid) assert.equal(big.code, "RATE_TOO_LARGE");
});

import assert from "node:assert/strict";
import test from "node:test";

import { validateNonZero, validateNumber } from "./validate.ts";

test("validateNumber accepts plain and decimal numbers", () => {
  assert.deepEqual(validateNumber("18"), { valid: true, value: 18 });
  assert.deepEqual(validateNumber("18.5"), { valid: true, value: 18.5 });
  assert.deepEqual(validateNumber(".5"), { valid: true, value: 0.5 });
  assert.deepEqual(validateNumber(0), { valid: true, value: 0 });
});

test("validateNumber accepts negative numbers", () => {
  assert.deepEqual(validateNumber("-20"), { valid: true, value: -20 });
  assert.deepEqual(validateNumber("-.5"), { valid: true, value: -0.5 });
});

test("validateNumber tolerates copied-back formatting", () => {
  assert.deepEqual(validateNumber("1,800"), { valid: true, value: 1800 });
  assert.deepEqual(validateNumber("18%"), { valid: true, value: 18 });
  assert.deepEqual(validateNumber(" 18 "), { valid: true, value: 18 });
});

test("validateNumber rejects empty input", () => {
  const result = validateNumber("");
  assert.equal(result.valid, false);
  assert.equal(!result.valid && result.code, "EMPTY");
  assert.equal(validateNumber(undefined).valid, false);
  assert.equal((validateNumber("-") as { code: string }).code, "EMPTY");
});

test("validateNumber rejects malformed numbers", () => {
  for (const bad of ["abc", "1.2.3", "10.", "1e5", "--5"]) {
    const result = validateNumber(bad);
    assert.equal(result.valid, false, bad);
    assert.equal(!result.valid && result.code, "NOT_A_NUMBER", bad);
  }
});

test("validateNumber rejects magnitudes above the engine's bound", () => {
  const result = validateNumber(1e15);
  assert.equal(result.valid, false);
  assert.equal(!result.valid && result.code, "TOO_LARGE");
  assert.equal(validateNumber(-1e15).valid, false);
});

test("validateNonZero rejects zero, otherwise matches validateNumber", () => {
  const zero = validateNonZero("0");
  assert.equal(zero.valid, false);
  assert.equal(!zero.valid && zero.code, "ZERO_BASE");

  assert.deepEqual(validateNonZero("5"), { valid: true, value: 5 });
  assert.equal(validateNonZero("abc").valid, false);
  assert.equal((validateNonZero("abc") as { code: string }).code, "NOT_A_NUMBER");
});

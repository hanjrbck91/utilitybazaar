import { isWhatPercent, percentageChange, percentageOf } from "./math.ts";
import { validateNumber } from "./validate.ts";
import {
  PercentageError,
  type PercentageErrorCode,
  type PercentageInput,
  type PercentageResult,
} from "./types.ts";

function required(value: number | undefined, label: string): number {
  const check = validateNumber(value);
  if (!check.valid) throw new PercentageError(check.code, `${label}: ${check.message}`);
  return check.value;
}

function requireNonZero(value: number, label: string): void {
  if (value === 0) {
    throw new PercentageError("ZERO_BASE", `${label} cannot be zero.`);
  }
}

/**
 * Main entry point. Pure and deterministic.
 * Validates its input and throws {@link PercentageError} on any invalid value.
 */
export function calculatePercentage(input: PercentageInput): PercentageResult {
  switch (input.mode) {
    case "of": {
      const percent = required(input.percent, "Percentage");
      const number = required(input.number, "Number");
      return { mode: "of", percent, number, result: percentageOf(number, percent) };
    }

    case "isPercent": {
      const part = required(input.part, "Part");
      const whole = required(input.whole, "Whole");
      requireNonZero(whole, "Whole");
      return { mode: "isPercent", part, whole, result: isWhatPercent(part, whole) };
    }

    case "change": {
      const from = required(input.from, "From");
      const to = required(input.to, "To");
      requireNonZero(from, "From");
      const { difference, percent, direction } = percentageChange(from, to);
      return { mode: "change", from, to, difference, result: percent, direction };
    }
  }
}

/** Discriminated result for callers that prefer not to catch. */
export type PercentageCalcResult =
  | { ok: true; data: PercentageResult }
  | { ok: false; code: PercentageErrorCode; message: string };

/** Non-throwing wrapper around {@link calculatePercentage}, for the calculator UI. */
export function tryCalculatePercentage(input: PercentageInput): PercentageCalcResult {
  try {
    return { ok: true, data: calculatePercentage(input) };
  } catch (err) {
    if (err instanceof PercentageError) {
      return { ok: false, code: err.code, message: err.message };
    }
    throw err;
  }
}

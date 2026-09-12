/**
 * Round to 2 decimal places using round-half-up, with the same epsilon
 * nudge as the GST engine's `roundCurrency` — decimal literals like
 * `0.145` are stored slightly below their written value, which would
 * otherwise round genuine half-way results down instead of up.
 */
export function round2(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 100;
  const shifted = value * factor;
  const rounded = Math.round(shifted + Math.sign(shifted) * Number.EPSILON * Math.abs(shifted));
  const result = rounded / factor;
  return result === 0 ? 0 : result; // normalise -0
}

/** `percent`% of `number`. */
export function percentageOf(number: number, percent: number): number {
  return round2((number * percent) / 100);
}

/** What percentage `part` is of `whole`. Caller must ensure `whole !== 0`. */
export function isWhatPercent(part: number, whole: number): number {
  return round2((part / whole) * 100);
}

export interface PercentageChange {
  difference: number;
  /** Percentage change relative to `from`. Always non-negative; see `direction`. */
  percent: number;
  direction: "increase" | "decrease" | "none";
}

/** Percentage change from `from` to `to`. Caller must ensure `from !== 0`. */
export function percentageChange(from: number, to: number): PercentageChange {
  const difference = round2(to - from);
  const percent = round2((Math.abs(difference) / Math.abs(from)) * 100);
  const direction = difference > 0 ? "increase" : difference < 0 ? "decrease" : "none";
  return { difference, percent, direction };
}

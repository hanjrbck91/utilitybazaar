/**
 * Shared types for the percentage calculation engine.
 *
 * Three calculation modes, each independent of the others:
 *   - "of"        — a percentage of a number (18% of 10,000 -> 1,800)
 *   - "isPercent"  — what percentage one number is of another (18 is what % of 100 -> 18%)
 *   - "change"     — percentage increase/decrease between two numbers (100 -> 120 -> 20% increase)
 */
export type PercentageMode = "of" | "isPercent" | "change";

export type ChangeDirection = "increase" | "decrease" | "none";

/** Raw request handed to the engine. Only the fields the chosen mode needs are read. */
export interface PercentageInput {
  mode: PercentageMode;
  /** mode "of": the percentage rate to apply. */
  percent?: number;
  /** mode "of": the number the percentage is taken of. */
  number?: number;
  /** mode "isPercent": the part. */
  part?: number;
  /** mode "isPercent": the whole the part is compared against. */
  whole?: number;
  /** mode "change": the starting value. */
  from?: number;
  /** mode "change": the ending value. */
  to?: number;
}

/** Pure, deterministic result of a percentage calculation — no identity, no time. */
export type PercentageResult =
  | { mode: "of"; percent: number; number: number; result: number }
  | { mode: "isPercent"; part: number; whole: number; result: number }
  | {
      mode: "change";
      from: number;
      to: number;
      difference: number;
      result: number;
      direction: ChangeDirection;
    };

/** Stable machine-readable reasons a value was rejected. */
export type PercentageErrorCode =
  | "EMPTY"
  | "NOT_A_NUMBER"
  | "TOO_LARGE"
  | "ZERO_BASE";

export interface ValidationOk {
  valid: true;
  value: number;
}

export interface ValidationFailure {
  valid: false;
  code: PercentageErrorCode;
  /** Human-readable, English. UI may map `code` to a localized string instead. */
  message: string;
}

export type ValidationResult = ValidationOk | ValidationFailure;

/** Thrown by the strict engine entry point on invalid input. */
export class PercentageError extends Error {
  readonly code: PercentageErrorCode;

  constructor(code: PercentageErrorCode, message: string) {
    super(message);
    this.name = "PercentageError";
    this.code = code;
  }
}

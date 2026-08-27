/**
 * Shared types for the GST calculation engine.
 *
 * The data model follows blueprint §15. `GstBreakdown` is the pure
 * calculation result; `Calculation` adds identity + timestamp for
 * history / sharing.
 */

/** "add" = put GST on top of a base amount. "remove" = extract GST from an inclusive amount. */
export type GstMode = "add" | "remove";

/** Intra-state = CGST + SGST. Inter-state = IGST. */
export type TaxType = "intraState" | "interState";

/** Raw request handed to the engine. */
export interface GstInput {
  /**
   * For mode `"add"` this is the tax-exclusive (base) amount.
   * For mode `"remove"` this is the tax-inclusive (total) amount.
   */
  amount: number;
  mode: GstMode;
  /** GST percentage, e.g. `18` for 18%. Any non-negative rate is accepted. */
  gstRate: number;
  taxType: TaxType;
}

/** Pure, deterministic result of a GST calculation — no identity, no time. */
export interface GstBreakdown {
  mode: GstMode;
  taxType: TaxType;
  /** The rate actually applied (percent). */
  gstRate: number;
  /** Tax-exclusive value. */
  baseAmount: number;
  /** Total GST — equals `cgst + sgst` (intra-state) or `igst` (inter-state). */
  gstAmount: number;
  /** Central GST. `0` for inter-state. */
  cgst: number;
  /** State GST. `0` for inter-state. */
  sgst: number;
  /** Integrated GST. `0` for intra-state. */
  igst: number;
  /** Tax-inclusive value. */
  total: number;
}

/**
 * A persistable / shareable calculation (blueprint §15): a breakdown
 * plus identity and timestamp, and the original user-entered amount.
 */
export interface Calculation extends GstBreakdown {
  id: string;
  timestamp: number;
  /** The original amount the user entered (mirrors `GstInput.amount`). */
  amount: number;
}

/** Optional share-card metadata (blueprint §15). Kept here so consumers share one type source. */
export interface ShareCard {
  businessName?: string;
  item?: string;
  customer?: string;
  calculation: Calculation;
}

/** Stable machine-readable reasons a value was rejected. */
export type GstErrorCode =
  | "EMPTY"
  | "NOT_A_NUMBER"
  | "NEGATIVE"
  | "ZERO"
  | "TOO_SMALL"
  | "TOO_LARGE"
  | "RATE_NOT_A_NUMBER"
  | "RATE_NEGATIVE"
  | "RATE_TOO_LARGE";

export interface ValidationOk {
  valid: true;
  /** Parsed, paise-rounded numeric value. */
  value: number;
}

export interface ValidationFailure {
  valid: false;
  code: GstErrorCode;
  /** Human-readable, English. UI may map `code` to a localized string instead. */
  message: string;
}

export type ValidationResult = ValidationOk | ValidationFailure;

/** Thrown by the strict engine entry points on invalid input. */
export class GstError extends Error {
  readonly code: GstErrorCode;

  constructor(code: GstErrorCode, message: string) {
    super(message);
    this.name = "GstError";
    this.code = code;
  }
}

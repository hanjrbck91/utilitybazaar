import { roundCurrency } from "./math.ts";
import { validateAmount, validateRate } from "./validate.ts";
import {
  GstError,
  type Calculation,
  type GstBreakdown,
  type GstErrorCode,
  type GstInput,
} from "./types.ts";

/** Tax-exclusive / tax / tax-inclusive triple produced by add/remove. */
export interface AmountSplit {
  baseAmount: number;
  gstAmount: number;
  total: number;
}

function assertAmount(value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new GstError("NOT_A_NUMBER", "Invalid amount.");
  }
}

function assertRate(rate: number): void {
  if (!Number.isFinite(rate) || rate < 0) {
    throw new GstError("RATE_NOT_A_NUMBER", "Invalid GST rate.");
  }
}

/**
 * Add GST on top of a tax-exclusive base amount.
 *
 *   gstAmount = base × rate / 100
 *   total     = base + gstAmount
 */
export function addGst(baseAmount: number, gstRate: number): AmountSplit {
  assertAmount(baseAmount);
  assertRate(gstRate);
  const base = roundCurrency(baseAmount);
  const gstAmount = roundCurrency((base * gstRate) / 100);
  const total = roundCurrency(base + gstAmount);
  return { baseAmount: base, gstAmount, total };
}

/**
 * Extract GST from a tax-inclusive total amount.
 *
 *   base      = total / (1 + rate / 100)
 *   gstAmount = total − base
 */
export function removeGst(totalAmount: number, gstRate: number): AmountSplit {
  assertAmount(totalAmount);
  assertRate(gstRate);
  const total = roundCurrency(totalAmount);
  const baseAmount = roundCurrency(total / (1 + gstRate / 100));
  const gstAmount = roundCurrency(total - baseAmount);
  return { baseAmount, gstAmount, total };
}

/**
 * Split a GST amount into CGST + SGST (intra-state).
 * The second half is derived by subtraction so that
 * `cgst + sgst === roundCurrency(gstAmount)` exactly, even for odd paise.
 */
export function calculateCgstSgst(gstAmount: number): { cgst: number; sgst: number } {
  const g = roundCurrency(gstAmount);
  const cgst = roundCurrency(g / 2);
  const sgst = roundCurrency(g - cgst);
  return { cgst, sgst };
}

/** The full GST amount as IGST (inter-state). */
export function calculateIgst(gstAmount: number): { igst: number } {
  return { igst: roundCurrency(gstAmount) };
}

/**
 * Main entry point. Pure and deterministic.
 * Validates its input and throws {@link GstError} on any invalid value.
 */
export function calculateGst(input: GstInput): GstBreakdown {
  const amountCheck = validateAmount(input.amount);
  if (!amountCheck.valid) throw new GstError(amountCheck.code, amountCheck.message);

  const rateCheck = validateRate(input.gstRate);
  if (!rateCheck.valid) throw new GstError(rateCheck.code, rateCheck.message);

  const { mode, taxType } = input;
  const gstRate = rateCheck.value;

  const split =
    mode === "add"
      ? addGst(amountCheck.value, gstRate)
      : removeGst(amountCheck.value, gstRate);

  const { cgst, sgst } =
    taxType === "intraState"
      ? calculateCgstSgst(split.gstAmount)
      : { cgst: 0, sgst: 0 };

  const { igst } =
    taxType === "interState" ? calculateIgst(split.gstAmount) : { igst: 0 };

  return {
    mode,
    taxType,
    gstRate,
    baseAmount: split.baseAmount,
    gstAmount: split.gstAmount,
    cgst,
    sgst,
    igst,
    total: split.total,
  };
}

/** Discriminated result for callers that prefer not to catch. */
export type GstResult =
  | { ok: true; data: GstBreakdown }
  | { ok: false; code: GstErrorCode; message: string };

/**
 * Non-throwing wrapper around {@link calculateGst}, for the calculator
 * UI, audio, share and history consumers.
 */
export function tryCalculateGst(input: GstInput): GstResult {
  try {
    return { ok: true, data: calculateGst(input) };
  } catch (err) {
    if (err instanceof GstError) {
      return { ok: false, code: err.code, message: err.message };
    }
    throw err;
  }
}

export interface CalculationIdentity {
  /** Override the generated id (useful for tests / deterministic snapshots). */
  id?: string;
  /** Override the timestamp (ms since epoch). */
  timestamp?: number;
}

/**
 * Build a persistable / shareable {@link Calculation}: a full breakdown
 * plus a stable id, a timestamp, and the original input amount.
 */
export function createCalculation(
  input: GstInput,
  identity: CalculationIdentity = {},
): Calculation {
  const breakdown = calculateGst(input);
  return {
    ...breakdown,
    id: identity.id ?? generateId(),
    timestamp: identity.timestamp ?? Date.now(),
    amount: roundCurrency(input.amount),
  };
}

function generateId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  return `gst_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

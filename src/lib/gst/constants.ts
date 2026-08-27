/**
 * Numeric guard-rails and UI hints for the GST engine.
 *
 * These are ENGINE limits and INTERFACE conveniences — not tax policy.
 * The calculation functions never depend on any rate list; every
 * calculation receives an explicit `gstRate`.
 */

/** Smallest amount the engine will accept (1 paisa). */
export const MIN_AMOUNT = 0.01;

/** Largest amount the engine will accept: ₹1,00,000 crore. Well within
 *  IEEE-754 safe-integer range for paise-precision arithmetic. */
export const MAX_AMOUNT = 1_000_000_000_000;

/** GST rate is a percentage. Rates below 0 are rejected. */
export const MIN_GST_RATE = 0;

/** Upper sanity bound for a single GST rate input (percent). */
export const MAX_GST_RATE = 100;

/** Money is tracked to paise (2 decimal places). */
export const CURRENCY_DECIMALS = 2;

/**
 * Quick-pick GST rates for the UI layer ONLY.
 *
 * ⚠️  A convenience for the interface, NOT a legal source of truth. The
 * engine never reads this list — every calculation takes an explicit
 * rate, so any rate at all can be used.
 *
 * These are the three principal slabs of the structure the 56th GST
 * Council recommended on 3 September 2025, notified by CBIC in
 * Notification 09/2025-Central Tax (Rate) dated 17 September 2025 and
 * effective 22 September 2025, which merged the former 12% and 28%
 * slabs into 5% and 18% and added a 40% de-merit rate.
 *
 * Rates outside this list remain in force and are reached through the
 * Custom field: nil-rated goods (0%), rough diamonds (0.25%), precious
 * metals and jewellery (3%), and pan masala and tobacco, which stayed
 * at 28% plus cess pending the compensation-cess transition.
 *
 * Verified against CBIC/GST Council material on 27 August 2026. Re-check
 * after any subsequent Council meeting.
 */
export const SUGGESTED_GST_RATES: readonly number[] = [5, 18, 40];

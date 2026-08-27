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
 * Suggested quick-pick GST rates for the UI layer ONLY.
 *
 * ⚠️  This list is a convenience for the interface, NOT a legal source of
 * truth. The engine does not read it. Verify against current official
 * CBIC / GST Council notifications before launch, and let callers pass
 * any custom rate they need.
 */
export const SUGGESTED_GST_RATES: readonly number[] = [5, 18, 40];

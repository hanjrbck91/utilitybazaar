/**
 * GST calculation engine — public API.
 *
 * Pure, deterministic, framework-free. No React, no I/O, no side effects
 * beyond `createCalculation`'s id/timestamp (both injectable).
 *
 * Consumers (calculator UI, audio, share, history) should import only
 * from this module.
 *
 *   import { calculateGst, formatINR, validateAmount } from "@/lib/gst";
 *
 * Key exports:
 *   - calculateGst / tryCalculateGst — main entry points
 *   - addGst / removeGst              — low-level add & extract
 *   - calculateCgstSgst / calculateIgst — tax-type split
 *   - createCalculation              — breakdown + id + timestamp (blueprint §15)
 *   - validateAmount / validateRate  — input validation
 *   - roundCurrency                  — paise rounding
 *   - formatINR                      — Indian-format currency string
 *   - SUGGESTED_GST_RATES            — UI hint only, NOT authoritative
 */

export * from "./types.ts";
export * from "./constants.ts";
export * from "./math.ts";
export * from "./format.ts";
export * from "./validate.ts";
export * from "./engine.ts";

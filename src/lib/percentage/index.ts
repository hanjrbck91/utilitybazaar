/**
 * Percentage calculation engine — public API.
 *
 * Pure, deterministic, framework-free. Independent of the GST engine —
 * no imports between the two tool modules.
 *
 *   import { calculatePercentage, formatPercent } from "@/lib/percentage";
 *
 * Key exports:
 *   - calculatePercentage / tryCalculatePercentage — main entry points
 *   - percentageOf / isWhatPercent / percentageChange — low-level math
 *   - validateNumber / validateNonZero — input validation
 *   - formatNumber / formatPercent — display formatting
 */

export * from "./types.ts";
export * from "./constants.ts";
export * from "./math.ts";
export * from "./format.ts";
export * from "./validate.ts";
export * from "./engine.ts";

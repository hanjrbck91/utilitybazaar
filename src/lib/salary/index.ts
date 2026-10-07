/**
 * Salary (CTC → take-home) engine — public API.
 *
 * Pure, deterministic, framework-free. Independent of the GST and
 * Percentage engines — no imports between tool modules.
 *
 *   import { calculateSalary, formatRupees } from "@/lib/salary";
 *
 * Key exports:
 *   - calculateSalary / tryCalculateSalary — main entry points
 *   - computeIncomeTax — the new-regime tax working on its own
 *   - validateCtc and friends — input validation
 *   - formatRupees / toLakhs — display formatting
 *   - constants.ts — every statutory value, with its source
 *
 * Model, sources and simplifications:
 * docs/milestones/M15.1_SALARY_ENGINE_RESEARCH.md
 */

export * from "./types.ts";
export * from "./constants.ts";
export * from "./math.ts";
export * from "./format.ts";
export * from "./validate.ts";
export * from "./engine.ts";

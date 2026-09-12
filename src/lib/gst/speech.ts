import { formatINR, type GstBreakdown } from "./index.ts";
import { interpolate, type Dictionary } from "../i18n/index.ts";

/**
 * Build the sentence spoken aloud for a result.
 *
 * Kept short: the tax split, then the figure the user actually wanted.
 * For inter-state the GST total and IGST are the same number, so only
 * IGST is spoken rather than saying it twice.
 *
 * Amounts are formatted without the ₹ symbol — speech engines read
 * "1,800" naturally but stumble over the symbol. Lives next to the rest
 * of the GST module because the sentence it produces is GST-specific —
 * the generic voice-picking mechanics are `lib/speech/`.
 */
export function buildSpeechText(
  breakdown: GstBreakdown,
  dictionary: Dictionary,
): string {
  const s = dictionary.speech;
  const amount = (value: number) => formatINR(value, { symbol: false });

  const parts: string[] = [];

  if (breakdown.taxType === "intraState") {
    parts.push(
      interpolate(s.gst, { gst: amount(breakdown.gstAmount) }),
      interpolate(s.cgst, { cgst: amount(breakdown.cgst) }),
      interpolate(s.sgst, { sgst: amount(breakdown.sgst) }),
    );
  } else {
    parts.push(interpolate(s.igst, { igst: amount(breakdown.igst) }));
  }

  parts.push(
    breakdown.mode === "add"
      ? interpolate(s.total, { total: amount(breakdown.total) })
      : interpolate(s.base, { base: amount(breakdown.baseAmount) }),
  );

  return parts.join(" ");
}

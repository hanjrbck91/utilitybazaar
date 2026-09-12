import { formatINR, type GstBreakdown } from "./index.ts";
import { interpolate, type Dictionary } from "../i18n/index.ts";

export interface ShareSummaryInput {
  breakdown: GstBreakdown;
  dictionary: Dictionary;
  /** Optional shop or business name. Never leaves the device except in the share text itself. */
  businessName?: string;
  /** Site URL, appended as attribution when known. */
  url?: string;
}

/**
 * Build the plain-text share summary.
 *
 * Deliberately not an invoice: a heading, the figures, and an optional
 * shop name and URL. Plain `Label: value` lines rather than an aligned
 * table, because monospace alignment collapses in WhatsApp and SMS.
 *
 * Pure and framework-free so it can be tested without a DOM. Lives next
 * to the rest of the GST module because the text it produces is
 * GST-specific — the generic share/copy mechanics are `lib/share/share.ts`.
 */
export function buildShareText({
  breakdown,
  dictionary,
  businessName,
  url,
}: ShareSummaryInput): string {
  const d = dictionary.share;
  const isAdd = breakdown.mode === "add";
  const isIntra = breakdown.taxType === "intraState";

  const lines: string[] = [];

  const shop = businessName?.trim();
  if (shop) lines.push(shop);

  lines.push(`${d.heading} — ${isAdd ? d.modeAdd : d.modeRemove}`, "");

  const row = (label: string, value: number) => `${label}: ${formatINR(value)}`;

  // Input first, answer last — matches the on-screen breakdown order.
  if (isAdd) {
    lines.push(row(d.base, breakdown.baseAmount));
  } else {
    lines.push(row(d.total, breakdown.total));
  }

  lines.push(
    row(interpolate(d.gst, { rate: breakdown.gstRate }), breakdown.gstAmount),
  );

  if (isIntra) {
    lines.push(row(d.cgst, breakdown.cgst), row(d.sgst, breakdown.sgst));
  } else {
    lines.push(row(d.igst, breakdown.igst));
  }

  if (isAdd) {
    lines.push(row(d.total, breakdown.total));
  } else {
    lines.push(row(d.base, breakdown.baseAmount));
  }

  const site = url?.trim();
  if (site) lines.push("", site);

  return lines.join("\n");
}

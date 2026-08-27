"use client";

import { ChevronDown } from "lucide-react";
import { formatINR, type GstBreakdown } from "@/lib/gst";

interface ResultCardProps {
  breakdown: GstBreakdown | null;
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-sm text-muted">{label}</span>
      <span
        className={
          strong
            ? "font-mono text-sm font-semibold tabular-nums text-text"
            : "font-mono text-sm tabular-nums text-text"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function ResultCard({ breakdown }: ResultCardProps) {
  const isAdd = breakdown?.mode === "add";
  const isIntra = breakdown?.taxType === "intraState";

  const heroLabel = !breakdown
    ? "Total amount"
    : isAdd
      ? "Total amount"
      : "Amount before GST";

  const heroValue = breakdown
    ? formatINR(isAdd ? breakdown.total : breakdown.baseAmount)
    : "—";

  const summaryLine = breakdown
    ? isAdd
      ? `Includes ${formatINR(breakdown.gstAmount)} GST at ${breakdown.gstRate}%`
      : `${formatINR(breakdown.gstAmount)} of ${formatINR(breakdown.total)} is GST at ${breakdown.gstRate}%`
    : "Enter an amount above to see your GST.";

  return (
    <section
      aria-label="Result"
      className="rounded-control border border-line bg-surface-sunken p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {heroLabel}
      </p>
      <p
        className={`mt-1 overflow-x-auto whitespace-nowrap font-mono text-[2rem] font-semibold tabular-nums tracking-tight sm:text-[2.5rem] ${
          breakdown ? "text-accent" : "text-muted/40"
        }`}
      >
        {heroValue}
      </p>
      <p className="mt-2 min-h-5 text-sm text-muted">{summaryLine}</p>

      {breakdown && (
        <details className="group mt-4 border-t border-line pt-3">
          <summary className="cursor-pointer list-none rounded-[8px] py-2 outline-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <span className="flex items-center justify-between text-sm font-medium text-text">
              View breakdown
              <ChevronDown
                className="size-4 text-muted transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </span>
          </summary>
          <div className="mt-2 divide-y divide-line/70">
            <Row
              label={isAdd ? "Amount before GST" : "Total amount"}
              value={formatINR(isAdd ? breakdown.baseAmount : breakdown.total)}
            />
            {isIntra ? (
              <>
                <Row label="CGST" value={formatINR(breakdown.cgst)} />
                <Row label="SGST" value={formatINR(breakdown.sgst)} />
              </>
            ) : (
              <Row label="IGST" value={formatINR(breakdown.igst)} />
            )}
            <Row label="Total GST" value={formatINR(breakdown.gstAmount)} strong />
          </div>
        </details>
      )}

      <p className="sr-only" aria-live="polite">
        {breakdown
          ? `${heroLabel}: ${heroValue}. ${summaryLine}.`
          : ""}
      </p>
    </section>
  );
}

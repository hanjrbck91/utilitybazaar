"use client";

import { ChevronDown } from "lucide-react";
import { formatINR, type GstBreakdown } from "@/lib/gst";
import { cn } from "@/lib/cn";

interface ResultCardProps {
  breakdown: GstBreakdown | null;
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-sm text-muted">{label}</span>
      <span
        className={cn(
          "font-mono text-sm tabular-nums text-text",
          strong && "font-semibold",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function ResultCard({ breakdown }: ResultCardProps) {
  const isAdd = breakdown?.mode === "add";
  const isIntra = breakdown?.taxType === "intraState";

  const heroLabel = breakdown && !isAdd ? "Amount before GST" : "Total amount";

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
      className={cn(
        // Height is reserved so revealing the breakdown toggle after the
        // first calculation does not shift the page.
        "flex min-h-[11.125rem] flex-col rounded-control border bg-surface-sunken p-5 shadow-inset",
        "transition-[border-color] duration-200 ease-out",
        breakdown ? "border-accent-line" : "border-line",
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        {heroLabel}
      </p>

      {/* Scroll container so very large amounts stay inside the card. The
          browser makes it keyboard-focusable when it actually scrolls, so it
          carries its own focus ring and label. */}
      <div
        aria-label={heroLabel}
        className={cn(
          "mt-1.5 overflow-x-auto rounded-[6px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
        )}
      >
        <span
          key={heroValue}
          className={cn(
            "block font-mono text-[2rem] font-semibold leading-none tabular-nums tracking-tight sm:text-[2.5rem]",
            "motion-safe:animate-result-pop",
            breakdown ? "text-accent-strong" : "text-muted/45",
          )}
        >
          {heroValue}
        </span>
      </div>

      <p className="mt-2.5 min-h-5 text-sm text-muted">{summaryLine}</p>

      {breakdown && (
        <details className="group mt-auto pt-4 motion-safe:animate-fade-in">
          <summary className="-mx-2 flex cursor-pointer list-none items-center justify-between rounded-[9px] px-2 py-2 text-sm font-medium text-muted outline-none transition-colors hover:bg-surface hover:text-text group-open:text-text [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            View breakdown
            <ChevronDown
              className="size-4 shrink-0 transition-transform duration-200 ease-out group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="mt-1 divide-y divide-line/70 border-t border-line pt-1">
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
        {breakdown ? `${heroLabel}: ${heroValue}. ${summaryLine}.` : ""}
      </p>
    </section>
  );
}

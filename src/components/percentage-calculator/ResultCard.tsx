"use client";

import { formatNumber, formatPercent, type PercentageResult } from "@/lib/percentage";
import { interpolate, type PercentageDictionary } from "@/lib/i18n";
import { useDictionary } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";

interface ResultCardProps {
  result: PercentageResult | null;
}

export function ResultCard({ result }: ResultCardProps) {
  const d = useDictionary<PercentageDictionary>();

  if (!result) {
    return (
      <div className="rounded-control bg-surface-sunken px-4 py-3.5">
        <p className="text-sm text-muted">{d.result.empty}</p>
        <p className="sr-only" aria-live="polite" />
      </div>
    );
  }

  let heroLabel: string;
  let heroValue: string;
  let detail: { label: string; value: string } | null = null;

  if (result.mode === "of") {
    heroLabel = interpolate(d.result.contextOf, {
      percent: result.percent,
      number: formatNumber(result.number),
    });
    heroValue = formatNumber(result.result);
  } else if (result.mode === "isPercent") {
    heroLabel = interpolate(d.result.contextIsPercent, {
      part: formatNumber(result.part),
      whole: formatNumber(result.whole),
    });
    heroValue = formatPercent(result.result);
  } else {
    heroLabel =
      result.direction === "increase"
        ? d.result.increase
        : result.direction === "decrease"
          ? d.result.decrease
          : d.result.noChange;
    heroValue = result.direction === "none" ? formatPercent(0) : formatPercent(result.result);
    detail = {
      label: interpolate(d.result.contextChange, {
        from: formatNumber(result.from),
        to: formatNumber(result.to),
      }),
      value: `${d.result.difference}: ${formatNumber(result.difference)}`,
    };
  }

  return (
    <section
      aria-label={d.result.label}
      className="rounded-control border border-accent-line bg-surface p-5 shadow-raise motion-safe:animate-fade-in"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.09em] text-muted">{heroLabel}</p>

      <div
        aria-label={heroLabel}
        className={cn(
          "mt-1 overflow-x-auto rounded-[6px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
        )}
      >
        <span
          key={heroValue}
          className={cn(
            "block font-mono text-[2.125rem] font-bold leading-none tabular-nums tracking-tight text-accent-strong sm:text-[2.625rem]",
            "motion-safe:animate-result-pop",
          )}
        >
          {heroValue}
        </span>
      </div>

      {detail && (
        <p className="mt-2.5 text-sm text-muted">
          {detail.label} — {detail.value}
        </p>
      )}

      <p className="sr-only" aria-live="polite">
        {`${heroLabel}: ${heroValue}.`}
      </p>
    </section>
  );
}

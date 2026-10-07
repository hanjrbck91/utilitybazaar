"use client";

import { type SalaryDictionary } from "@/lib/i18n";
import { useDictionary } from "@/components/LocaleProvider";
import { CopyButton } from "@/components/CopyButton";
import { cn } from "@/lib/cn";
import { resultSummary, type SalaryView } from "./model";

interface ResultCardProps {
  view: SalaryView;
  /** Localized message for `view.status === "error"`. */
  errorText: string | null;
  /** Id of the error message, so invalid fields can point to it. */
  errorId: string;
}

/**
 * The answer: monthly in-hand salary for a regular month, large, with
 * the yearly figure and the basis of the estimate right beside it.
 * Every figure is an engine output, formatted.
 */
export function ResultCard({ view, errorText, errorId }: ResultCardProps) {
  const d = useDictionary<SalaryDictionary>();

  if (view.status !== "ok") {
    const isError = view.status === "error";
    return (
      <div className="rounded-control bg-surface-sunken px-4 py-3.5">
        <p
          id={errorId}
          role={isError ? "alert" : undefined}
          className={cn("text-sm", isError ? "text-danger" : "text-muted")}
        >
          {isError ? errorText : d.result.empty}
        </p>
      </div>
    );
  }

  const s = resultSummary(d, view.result);

  return (
    <section
      aria-label={d.result.monthlyTakeHome}
      className="rounded-control border border-accent-line bg-surface p-5 shadow-raise motion-safe:animate-fade-in"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.09em] text-muted">
        {d.result.monthlyTakeHome}
      </p>

      <div className="mt-1 flex items-center justify-between gap-3">
        <div className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span
            key={s.monthlyTakeHome}
            className="block font-mono text-[2.125rem] font-bold leading-none tabular-nums tracking-tight text-accent-strong motion-safe:animate-result-pop sm:text-[2.625rem]"
          >
            {s.monthlyTakeHome}
          </span>
        </div>
        <CopyButton
          getText={() => s.monthlyTakeHome}
          label={d.copy.label}
          copiedLabel={d.copy.copied}
          failedLabel={d.copy.failed}
        />
      </div>

      <p className="mt-2 text-sm text-muted">
        <span className="font-medium text-text">{d.result.regularMonth}</span>
        {" · "}
        {d.result.afterDeductions}
      </p>

      <dl className="mt-3.5 border-t border-line pt-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">{d.result.annualTakeHome}</dt>
          <dd className="shrink-0 whitespace-nowrap text-right font-mono font-semibold tabular-nums text-text">
            {s.annualTakeHome}
            <span className="ml-1 font-sans text-xs font-normal text-muted">{d.result.perYear}</span>
          </dd>
        </div>
      </dl>
      {s.variableNote && <p className="mt-1.5 text-xs text-muted">{s.variableNote}</p>}

      <p className="mt-3 flex flex-wrap gap-1.5 text-[0.6875rem] font-medium text-muted">
        <span className="rounded-pill bg-surface-sunken px-2 py-0.5">{s.taxRegime}</span>
        <span className="rounded-pill bg-surface-sunken px-2 py-0.5">{d.result.estimate}</span>
      </p>

      <p className="sr-only" aria-live="polite">
        {`${d.result.monthlyTakeHome}: ${s.monthlyTakeHome}. ${d.result.annualTakeHome}: ${s.annualTakeHome}.`}
      </p>
    </section>
  );
}

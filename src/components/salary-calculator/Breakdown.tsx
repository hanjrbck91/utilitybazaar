"use client";

import { useState } from "react";
import { ChevronDown, Info, TriangleAlert } from "lucide-react";
import { type SalaryBreakdown } from "@/lib/salary";
import { type SalaryDictionary } from "@/lib/i18n";
import { useDictionary } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import {
  breakdownGroups,
  notices,
  resultSummary,
  taxRows,
  type RowKind,
  type TaxRow,
} from "./model";

const SUMMARY =
  "-mx-2 flex cursor-pointer list-none items-center justify-between gap-3 rounded-[9px] px-2 py-2 text-sm font-medium text-muted outline-none transition-colors hover:bg-surface-sunken hover:text-text group-open:text-text [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const AMOUNT = "whitespace-nowrap text-right font-mono text-[0.8125rem] tabular-nums sm:text-sm";

function rowTone(kind: RowKind): string {
  if (kind === "result") return "font-semibold text-accent-strong";
  if (kind === "total") return "font-semibold text-text";
  return "text-text";
}

function taxTone(kind: TaxRow["kind"]): string {
  if (kind === "total") return "font-semibold text-text";
  if (kind === "slab") return "text-muted";
  return "text-text";
}

const TAX_SIGN: Record<TaxRow["kind"], string> = {
  plain: "",
  subtract: "− ",
  add: "+ ",
  total: "",
  slab: "",
};

/**
 * How CTC becomes take-home, then how the income tax in it is worked
 * out, then what the estimate assumes. Every number is an engine output;
 * this component only lays them out.
 */
export function Breakdown({ result }: { result: SalaryBreakdown }) {
  const d = useDictionary<SalaryDictionary>();
  const [open, setOpen] = useState(true);

  const groups = breakdownGroups(d, result);
  const tax = taxRows(d, result);
  const assumptions = notices(d, result);

  return (
    <section aria-label={d.breakdown.heading} className="mt-6 rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <details className="group" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary className={SUMMARY}>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.08em]">{d.breakdown.heading}</span>
          </span>
          <span className="flex items-center gap-1 text-xs">
            {open ? d.actions.hideBreakdown : d.actions.showBreakdown}
            <ChevronDown aria-hidden="true" className="size-4 shrink-0 transition-transform duration-200 ease-out group-open:rotate-180" />
          </span>
        </summary>

        {/* Auto layout: amounts keep their natural width (they never wrap),
            and labels take what is left and wrap — so a 375px screen
            fits "₹1,32,713.33" twice beside a two-line Hindi label. */}
        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="text-[0.6875rem] uppercase tracking-[0.08em] text-muted">
              <th scope="col" className="pb-1.5 text-left font-semibold">
                <span className="sr-only">{d.breakdown.heading}</span>
              </th>
              <th scope="col" className="pb-1.5 text-right font-semibold">{d.breakdown.monthly}</th>
              <th scope="col" className="pb-1.5 text-right font-semibold">{d.breakdown.annual}</th>
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.key} className="border-t border-line">
              {group.label && (
                <tr>
                  <th colSpan={3} scope="colgroup" className="pt-2.5 text-left text-xs font-medium text-muted">
                    {group.label}
                  </th>
                </tr>
              )}
              {group.rows.map((row) => (
                <tr key={row.key} className={rowTone(row.kind)}>
                  <th
                    scope="row"
                    className={cn(
                      "py-1.5 pr-2 text-left align-top font-[inherit]",
                      row.kind === "part" || row.kind === "deduction" ? "pl-3 font-normal" : "",
                    )}
                  >
                    {row.label}
                  </th>
                  <td className={cn(AMOUNT, "py-1.5 align-top")}>
                    {row.monthly ?? <span className="text-muted">—</span>}
                  </td>
                  <td className={cn(AMOUNT, "py-1.5 pl-2 align-top")}>{row.annual}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>

        <details className="group/tax mt-3 border-t border-line pt-1">
          <summary className={cn(SUMMARY, "group-open/tax:text-text")}>
            {d.tax.heading}
            <ChevronDown aria-hidden="true" className="size-4 shrink-0 transition-transform duration-200 ease-out group-open/tax:rotate-180" />
          </summary>
          <p className="mt-1 text-xs text-muted">{resultSummary(d, result).taxRegime}</p>
          <dl className="mt-2 divide-y divide-line/70 text-sm">
            {tax.map((row) => (
              <div key={row.key} className={cn("flex items-baseline justify-between gap-3 py-1.5", taxTone(row.kind))}>
                <dt className={cn("min-w-0", row.kind === "slab" && "pl-3 text-xs")}>{row.label}</dt>
                <dd className={AMOUNT}>
                  {TAX_SIGN[row.kind]}
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          {result.annual.incomeTax === 0 && <p className="mt-2 text-xs text-muted">{d.tax.noTax}</p>}
        </details>
      </details>

      <div className="mt-5 border-t border-line pt-4">
        <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {d.content.assumptionsHeading}
        </h3>
        <ul className="mt-2.5 space-y-2">
          {assumptions.map((notice) => (
            <li key={notice.key} className="flex gap-2 px-1 text-xs leading-relaxed">
              {notice.tone === "warning" ? (
                <TriangleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-danger" />
              ) : (
                <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted" />
              )}
              <span className={notice.tone === "warning" ? "text-text" : "text-muted"}>{notice.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

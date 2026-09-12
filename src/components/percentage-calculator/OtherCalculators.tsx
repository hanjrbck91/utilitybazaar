"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { type PercentageDictionary } from "@/lib/i18n";
import { calculatorPath } from "@/lib/routes";

/**
 * A compact list of the site's other tools, placed right below the
 * calculator so it is seen before the supporting article rather than
 * buried at the bottom of it.
 *
 * Data-driven so a future tool is one more entry, not a new component —
 * without building a generic tool registry for a list of one.
 */
export function OtherCalculators() {
  const { locale, d } = useLocale<PercentageDictionary>();

  const otherTools = [{ label: d.nav.gstCalculator, href: calculatorPath(locale) }];

  return (
    <section aria-labelledby="other-calculators" className="mt-6">
      <h2
        id="other-calculators"
        className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted"
      >
        {d.content.otherCalculatorsHeading}
      </h2>
      <div className="mt-3 space-y-2">
        {otherTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="flex items-center justify-between gap-3 rounded-control border border-line-strong bg-surface px-4 py-3 text-sm font-medium text-text transition-[color,background-color,border-color] duration-150 ease-out hover:border-accent-line hover:bg-accent-soft hover:text-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {tool.label}
            <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

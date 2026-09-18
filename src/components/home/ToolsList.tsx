"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { type HomeDictionary } from "@/lib/i18n";
import { calculatorPath, percentageCalculatorPath } from "@/lib/routes";

/**
 * The homepage's tool catalogue — a title, a one-line description and a
 * link, per tool. Deliberately its own (small) component rather than the
 * shared `OtherCalculators`: that one is a compact cross-link row used
 * from inside a tool page; this is the site's primary entry point and
 * needs room for a description, so the two never merge into one
 * over-flexible component.
 */
export function ToolsList() {
  const { locale, d } = useLocale<HomeDictionary>();

  const tools = [
    {
      title: d.nav.gstCalculator,
      description: d.tools.gstDescription,
      href: calculatorPath(locale),
    },
    {
      title: d.nav.percentageCalculator,
      description: d.tools.percentageDescription,
      href: percentageCalculatorPath(locale),
    },
  ];

  return (
    <section aria-labelledby="tools" className="mt-2">
      <h2
        id="tools"
        className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted"
      >
        {d.tools.heading}
      </h2>
      <div className="mt-3 space-y-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block rounded-card border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow] duration-150 ease-out hover:border-accent-line hover:shadow-raise focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold tracking-tight text-text">
                {tool.title}
              </h3>
              <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{tool.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

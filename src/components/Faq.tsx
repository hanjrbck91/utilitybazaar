"use client";

import { ChevronDown } from "lucide-react";
import { useDictionary } from "@/components/LocaleProvider";

/**
 * A short FAQ below the supporting content.
 *
 * Real questions people ask about GST calculation, with plain answers.
 * Presented as a collapsible list: every item starts closed so the
 * section stays short, and any number can be open at once. Built on
 * native `<details>` / `<summary>`, so keyboard support (Enter / Space),
 * focus and the expanded/collapsed state come from the browser and the
 * answers stay in the rendered HTML whether open or not.
 *
 * The questions and answers are the exact strings used to build the
 * `FAQPage` structured data on the calculator page, so the markup never
 * describes anything that is not on the page.
 */
export function Faq() {
  const d = useDictionary();

  return (
    <section aria-labelledby="faq" className="mt-10">
      <h2
        id="faq"
        className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted"
      >
        {d.content.faqHeading}
      </h2>
      <div className="mt-3 divide-y divide-line border-y border-line">
        {d.content.faq.map(({ q, a }) => (
          <details key={q} className="group">
            <summary className="list-none rounded-[6px] outline-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              <h3 className="flex cursor-pointer items-start justify-between gap-3 py-3.5 text-base font-semibold leading-snug tracking-tight text-text transition-colors group-hover:text-accent-strong">
                {q}
                <ChevronDown
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 origin-center text-muted transition-transform duration-200 ease-out group-open:rotate-180"
                />
              </h3>
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-muted motion-safe:animate-fade-in">
              {a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

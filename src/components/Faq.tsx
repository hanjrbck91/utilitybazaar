"use client";

import { useDictionary } from "@/components/LocaleProvider";

/**
 * A short FAQ below the supporting content.
 *
 * Real questions people ask about GST calculation, with plain answers.
 * The questions and answers here are the exact strings used to build the
 * `FAQPage` structured data on the calculator page, so the markup never
 * describes anything that is not visible.
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
      <dl className="mt-4 space-y-6">
        {d.content.faq.map(({ q, a }) => (
          <div key={q} className="px-1">
            <dt className="text-base font-semibold tracking-tight text-text">{q}</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-muted">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

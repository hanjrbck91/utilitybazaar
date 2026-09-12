"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { type PercentageDictionary } from "@/lib/i18n";
import { calculatorPath, STATIC_PATHS } from "@/lib/routes";

/**
 * A short explanation of what the calculator does, below the tool —
 * mirrors `gst-calculator/SupportingContent.tsx` in shape, with its own
 * percentage-specific facts. Ends with a link back to the GST calculator,
 * the same way the GST page links forward to this one.
 */
export function SupportingContent() {
  const { locale, d } = useLocale<PercentageDictionary>();
  const c = d.content;

  const sections = [
    { title: c.whatTitle, body: c.whatBody },
    { title: c.ofTitle, body: c.ofBody },
    { title: c.isPercentTitle, body: c.isPercentBody },
    { title: c.increaseTitle, body: c.increaseBody },
    { title: c.decreaseTitle, body: c.decreaseBody },
  ];

  return (
    <section aria-labelledby="supporting-content" className="mt-10">
      <h2
        id="supporting-content"
        className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted"
      >
        {c.heading}
      </h2>
      <div className="mt-4 space-y-6">
        {sections.map((section) => (
          <article key={section.title} className="px-1">
            <h3 className="text-base font-semibold tracking-tight text-text">
              {section.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{section.body}</p>
          </article>
        ))}
      </div>
      <p className="mt-5 px-1 text-xs leading-relaxed text-muted">
        {c.privacyNote}{" "}
        <Link
          href={STATIC_PATHS.privacy}
          className="rounded-[4px] font-medium text-accent-strong underline underline-offset-2 transition-colors hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {c.privacyLinkText}
        </Link>
      </p>
      <p className="mt-2 px-1 text-xs leading-relaxed text-muted">
        {c.crossLinkText}{" "}
        <Link
          href={calculatorPath(locale)}
          className="rounded-[4px] font-medium text-accent-strong underline underline-offset-2 transition-colors hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {d.nav.gstCalculator}
        </Link>
      </p>
    </section>
  );
}

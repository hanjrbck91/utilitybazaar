"use client";

import Link from "next/link";
import { useDictionary } from "@/components/LocaleProvider";
import { STATIC_PATHS } from "@/lib/routes";

/**
 * A short explanation of what the calculator does, below the tool.
 *
 * Enough for a reader who does not already know what "GST-inclusive" or
 * CGST means, and short enough that the calculator stays the point of
 * the page. Not written for a crawler: the Hindi version is written
 * natively rather than translated. Every tax fact here is from official
 * Government of India material (56th GST Council / CBIC Notification
 * 09/2025-Central Tax (Rate)).
 */
export function SupportingContent() {
  const d = useDictionary();
  const c = d.content;

  const sections = [
    { title: c.howTitle, body: c.howBody },
    { title: c.exclusiveTitle, body: c.exclusiveBody },
    { title: c.inclusiveTitle, body: c.inclusiveBody },
    { title: c.reverseTitle, body: c.reverseBody },
    { title: c.splitTitle, body: c.splitBody },
    { title: c.ratesTitle, body: c.ratesBody },
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
    </section>
  );
}

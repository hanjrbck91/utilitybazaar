"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { type SalaryDictionary } from "@/lib/i18n";
import { STATIC_PATHS } from "@/lib/routes";

/**
 * A short explanation below the tool, in the same collapsed
 * `<details>` shape as the other calculators' `SupportingContent`:
 * what CTC is, why in-hand pay is lower than CTC ÷ 12, how the estimate
 * is built, and what it assumes. Stays in the HTML when collapsed.
 */
export function SupportingContent() {
  const { d } = useLocale<SalaryDictionary>();
  const c = d.content;

  const sections = [
    { title: c.whatTitle, body: c.whatBody },
    { title: c.lowerTitle, body: c.lowerBody },
    { title: c.howTitle, body: c.howBody },
    { title: c.estimateTitle, body: c.estimateBody },
  ];

  return (
    <details className="group mt-10">
      <summary className="list-none cursor-pointer rounded-[6px] px-1 outline-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <h2 className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted transition-colors group-hover:text-accent-strong">
          {c.heading}
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 origin-center motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out group-open:rotate-180"
          />
        </h2>
      </summary>

      <div className="mt-4 space-y-6 motion-safe:animate-fade-in">
        {sections.map((section) => (
          <article key={section.title} className="px-1">
            <h3 className="text-base font-semibold tracking-tight text-text">{section.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{section.body}</p>
          </article>
        ))}

        <p className="px-1 text-xs leading-relaxed text-muted">
          {c.privacyNote}{" "}
          <Link
            href={STATIC_PATHS.privacy}
            className="rounded-[4px] font-medium text-accent-strong underline underline-offset-2 transition-colors hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {c.privacyLinkText}
          </Link>
        </p>
      </div>
    </details>
  );
}

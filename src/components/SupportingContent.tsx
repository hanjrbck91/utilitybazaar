"use client";

import { useDictionary } from "@/components/LocaleProvider";

/**
 * A short explanation of what the calculator does, below the tool.
 *
 * Four sections, one paragraph each — enough for a reader who does not
 * already know what CGST is, and short enough that the calculator stays
 * the point of the page. Not an article, and not written for a crawler:
 * the Hindi version is written natively rather than translated.
 */
export function SupportingContent() {
  const d = useDictionary();

  const sections = [
    { title: d.content.whatIsGstTitle, body: d.content.whatIsGstBody },
    { title: d.content.addTitle, body: d.content.addBody },
    { title: d.content.removeTitle, body: d.content.removeBody },
    { title: d.content.splitTitle, body: d.content.splitBody },
  ];

  return (
    <section aria-labelledby="supporting-content" className="mt-10">
      <h2
        id="supporting-content"
        className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted"
      >
        {d.content.heading}
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
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface OtherCalculatorLink {
  label: string;
  href: string;
}

interface OtherCalculatorsProps {
  heading: string;
  tools: OtherCalculatorLink[];
}

/**
 * A compact, data-driven list of the site's other tools.
 *
 * Shared because the pattern — a small heading plus a list of link rows —
 * is genuinely the same on every calculator page; the tool list itself is
 * not. Each page builds its own `tools` array from its own dictionary and
 * locale and passes it in, so this component owns no tool-specific data
 * and needs no registry.
 */
export function OtherCalculators({ heading, tools }: OtherCalculatorsProps) {
  return (
    <section aria-labelledby="other-calculators" className="mt-6">
      <h2
        id="other-calculators"
        className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted"
      >
        {heading}
      </h2>
      <div className="mt-3 space-y-2">
        {tools.map((tool) => (
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

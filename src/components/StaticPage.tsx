import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { STATIC_PATHS, calculatorPath } from "@/lib/routes";
import { getDictionary } from "@/lib/i18n";

const FOOTER_LINK =
  "inline-flex min-h-9 items-center rounded-[6px] px-1 transition-colors hover:text-text " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Shared shell for /about, /privacy and /terms.
 *
 * A server component — these pages are plain text and ship no
 * interactive JavaScript of their own.
 */
export function StaticPage({
  title,
  paragraphs,
}: {
  title: string;
  paragraphs: readonly string[];
}) {
  const d = getDictionary("en");

  return (
    <main className="mx-auto flex w-full max-w-[464px] flex-1 flex-col px-5 pb-20 pt-10 sm:pt-16 lg:pt-24">
      <Link
        href={calculatorPath("en")}
        className="mb-6 -ml-1 inline-flex w-fit items-center gap-1.5 rounded-[7px] px-1 py-1 text-sm text-muted transition-colors hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {d.nav.backToCalculator}
      </Link>

      <article className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <h1 className="text-[1.375rem] font-semibold leading-tight tracking-tight text-text">
          {title}
        </h1>
        <div className="mt-4 space-y-4">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      <AdSlot slot="static-below" />

      <footer className="mt-10 border-t border-line pt-5">
        <nav
          aria-label={d.nav.siteLinks}
          className="flex flex-wrap items-center gap-x-4 px-1 text-xs text-muted"
        >
          <Link href={calculatorPath("en")} className={FOOTER_LINK}>
            {d.nav.calculator}
          </Link>
          <Link href={STATIC_PATHS.about} className={FOOTER_LINK}>
            {d.nav.about}
          </Link>
          <Link href={STATIC_PATHS.privacy} className={FOOTER_LINK}>
            {d.nav.privacy}
          </Link>
          <Link href={STATIC_PATHS.terms} className={FOOTER_LINK}>
            {d.nav.terms}
          </Link>
        </nav>
      </footer>
    </main>
  );
}

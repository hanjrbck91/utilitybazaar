"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLocale } from "@/components/LocaleProvider";
import type { Locale } from "@/lib/i18n";
import { homePath } from "@/lib/routes";
import { SITE_NAME } from "@/lib/seo/metadata";

interface PageHeaderProps {
  /** Passed through to {@link LanguageToggle} — see its own doc comment. */
  languageHrefs?: Record<Locale, string>;
  /**
   * The homepage's own header. Its title already is "UtilityBazaar", so
   * it gets no brand link back to itself and keeps its original layout.
   */
  isHome?: boolean;
}

/**
 * Page title, tagline and language switch.
 *
 * On a tool page the top row is a site bar — the "UtilityBazaar" brand
 * linking to the localized homepage, and the language switch — with the
 * tool's own title below it, so every tool reads as part of one site.
 * The brand is a name, the same in every locale, so it is `SITE_NAME`
 * rather than a dictionary string.
 */
export function PageHeader({ languageHrefs, isHome = false }: PageHeaderProps = {}) {
  const { locale, d } = useLocale<{ app: { title: string; tagline: string } }>();

  const title = (
    <>
      <h1 className="text-[1.375rem] font-semibold leading-tight tracking-tight text-text">
        {d.app.title}
      </h1>
      <p className="mt-1.5 text-sm text-muted">{d.app.tagline}</p>
    </>
  );

  if (isHome) {
    return (
      <header className="mb-6 flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">{title}</div>
        <div className="-mr-2 shrink-0 pt-0.5">
          <LanguageToggle hrefs={languageHrefs} />
        </div>
      </header>
    );
  }

  return (
    <header className="mb-6 px-1">
      <div className="-mt-2 mb-3 flex items-center justify-between gap-4">
        <Link
          href={homePath(locale)}
          className="-ml-1 inline-flex min-h-9 items-center rounded-[7px] px-1 text-sm font-semibold tracking-tight text-muted transition-colors hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {SITE_NAME}
        </Link>
        <div className="-mr-2 shrink-0">
          <LanguageToggle hrefs={languageHrefs} />
        </div>
      </div>
      {title}
    </header>
  );
}

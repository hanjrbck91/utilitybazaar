"use client";

import Link from "next/link";
import { useDictionary } from "@/components/LocaleProvider";
import { STATIC_PATHS } from "@/lib/routes";

const LINK =
  "inline-flex min-h-9 items-center rounded-[6px] px-1 transition-colors hover:text-text " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Minimal footer: the three supporting pages and nothing else. */
export function SiteFooter() {
  const d = useDictionary();

  return (
    <footer className="mt-10 border-t border-line pt-5">
      <nav
        aria-label={d.nav.siteLinks}
        className="flex flex-wrap items-center gap-x-4 px-1 text-xs text-muted"
      >
        <Link href={STATIC_PATHS.about} className={LINK}>
          {d.nav.about}
        </Link>
        <Link href={STATIC_PATHS.privacy} className={LINK}>
          {d.nav.privacy}
        </Link>
        <Link href={STATIC_PATHS.terms} className={LINK}>
          {d.nav.terms}
        </Link>
      </nav>
    </footer>
  );
}

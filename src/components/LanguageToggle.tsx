"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/cn";
import { LOCALES, getDictionary, getLocaleTag, type Locale } from "@/lib/i18n";
import { calculatorPath } from "@/lib/routes";

/**
 * English | हिन्दी
 *
 * Real links rather than a client toggle: each language is its own URL,
 * so a crawler can follow both and a reader can bookmark or share the
 * one they want. Deliberately the quietest control on the page.
 */
export function LanguageToggle() {
  const { locale, d } = useLocale();

  return (
    <nav aria-label={d.app.languageLabel} className="flex items-center gap-0.5">
      {LOCALES.map((code: Locale, index) => {
        const active = code === locale;
        return (
          <span key={code} className="flex items-center">
            {index > 0 && (
              <span aria-hidden="true" className="px-0.5 text-xs text-muted/50">
                |
              </span>
            )}
            <Link
              href={calculatorPath(code)}
              hrefLang={getLocaleTag(code)}
              aria-current={active ? "page" : undefined}
              onClick={() => {
                if (!active) track("language_changed", { locale: code });
              }}
              className={cn(
                // min-h-9 keeps it a comfortable touch target even though it
                // is visually the quietest control on the page.
                "flex min-h-9 select-none items-center rounded-[7px] px-2 text-xs transition-colors duration-150",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                active ? "font-semibold text-text" : "font-medium text-muted hover:text-text",
              )}
            >
              {getDictionary(code).localeName}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}

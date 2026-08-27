"use client";

import { LOCALES, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";

/**
 * English | हिन्दी
 *
 * Deliberately quiet — the calculator is the product, this is a
 * preference. Native radios keep it a single arrow-navigable group.
 */
export function LanguageToggle() {
  const { locale, setLocale, d } = useLocale();

  return (
    <fieldset className="flex items-center gap-0.5">
      <legend className="sr-only">{d.app.languageLabel}</legend>
      {LOCALES.map((code: Locale, index) => {
        const active = code === locale;
        return (
          <span key={code} className="flex items-center">
            {index > 0 && (
              <span aria-hidden="true" className="px-0.5 text-xs text-muted/50">
                |
              </span>
            )}
            <label
              className={cn(
                // min-h-9 keeps it a comfortable touch target even though it
                // is visually the quietest control on the page.
                "flex min-h-9 cursor-pointer select-none items-center rounded-[7px] px-2 text-xs transition-colors duration-150",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                active
                  ? "font-semibold text-text"
                  : "font-medium text-muted hover:text-text",
              )}
            >
              <input
                type="radio"
                name="locale"
                value={code}
                checked={active}
                onChange={() => setLocale(code)}
                className="sr-only"
              />
              {getDictionary(code).localeName}
            </label>
          </span>
        );
      })}
    </fieldset>
  );
}

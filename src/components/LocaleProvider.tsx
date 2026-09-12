"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { getDictionary, getLocaleTag, type Dictionary, type Locale } from "@/lib/i18n";

interface LocaleContextValue<T> {
  locale: Locale;
  /** BCP 47 tag, e.g. "hi-IN". */
  tag: string;
  d: T;
}

const LocaleContext = createContext<LocaleContextValue<unknown> | null>(null);

/**
 * Supplies the active locale to the client tree.
 *
 * The locale comes from the route segment and is read-only here: the URL
 * is the single source of truth, which is what makes the two languages
 * separately linkable, indexable and shareable.
 *
 * `dictionary` defaults to the GST calculator's dictionary — every
 * existing call site is unaffected. A tool with its own dictionary (see
 * `getPercentageDictionary`) passes it explicitly, so two tools' string
 * tables are never merged into one and never read from each other.
 */
export function LocaleProvider<T = Dictionary>({
  children,
  initialLocale,
  dictionary,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  dictionary?: T;
}) {
  const value = useMemo<LocaleContextValue<T>>(
    () => ({
      locale: initialLocale,
      tag: getLocaleTag(initialLocale),
      d: dictionary ?? (getDictionary(initialLocale) as unknown as T),
    }),
    [initialLocale, dictionary],
  );

  // The server already renders the right `lang`. This only keeps it
  // correct after a client-side navigation between the two locales.
  useEffect(() => {
    document.documentElement.lang = value.tag;
  }, [value.tag]);

  return (
    <LocaleContext.Provider value={value as LocaleContextValue<unknown>}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale<T = Dictionary>(): LocaleContextValue<T> {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside <LocaleProvider>");
  }
  return context as LocaleContextValue<T>;
}

/** Convenience for components that only need the strings. */
export function useDictionary<T = Dictionary>(): T {
  return useLocale<T>().d;
}

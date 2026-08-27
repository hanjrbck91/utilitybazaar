"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { getDictionary, getLocaleTag, type Dictionary, type Locale } from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  /** BCP 47 tag, e.g. "hi-IN". */
  tag: string;
  d: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Supplies the active locale to the client tree.
 *
 * The locale comes from the route segment and is read-only here: the URL
 * is the single source of truth, which is what makes the two languages
 * separately linkable, indexable and shareable.
 */
export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale: initialLocale,
      tag: getLocaleTag(initialLocale),
      d: getDictionary(initialLocale),
    }),
    [initialLocale],
  );

  // The server already renders the right `lang`. This only keeps it
  // correct after a client-side navigation between the two locales.
  useEffect(() => {
    document.documentElement.lang = value.tag;
  }, [value.tag]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside <LocaleProvider>");
  }
  return context;
}

/** Convenience for components that only need the strings. */
export function useDictionary(): Dictionary {
  return useLocale().d;
}

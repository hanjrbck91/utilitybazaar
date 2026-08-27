"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  getDictionary,
  getLocaleTag,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  /** BCP 47 tag, e.g. "hi-IN". */
  tag: string;
  d: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Holds the active locale for the client tree.
 *
 * `initialLocale` is a prop rather than internal state so that when
 * localized routes land (`/` and `/hi/`), the route segment can seed it
 * without touching any consumer.
 */
export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  // Keep <html lang> honest: assistive tech and speech synthesis both
  // read it, and the server rendered whatever the route said.
  useEffect(() => {
    document.documentElement.lang = getLocaleTag(locale);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      tag: getLocaleTag(locale),
      d: getDictionary(locale),
      setLocale,
    }),
    [locale],
  );

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

/** Stable no-op guard so consumers can toggle without re-creating handlers. */
export function useSetLocale(): (locale: Locale) => void {
  const { setLocale } = useLocale();
  return useCallback((next: Locale) => setLocale(next), [setLocale]);
}

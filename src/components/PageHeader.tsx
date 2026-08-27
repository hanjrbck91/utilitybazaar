"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { useDictionary } from "@/components/LocaleProvider";

export function PageHeader() {
  const d = useDictionary();

  return (
    <header className="mb-6 flex items-start justify-between gap-4 px-1">
      <div className="min-w-0">
        <h1 className="text-[1.375rem] font-semibold leading-tight tracking-tight text-text">
          {d.app.title}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{d.app.tagline}</p>
      </div>
      <div className="-mr-2 shrink-0 pt-0.5">
        <LanguageToggle />
      </div>
    </header>
  );
}

"use client";

import { OtherCalculators as OtherCalculatorsList } from "@/components/OtherCalculators";
import { useLocale } from "@/components/LocaleProvider";
import { type PercentageDictionary } from "@/lib/i18n";
import { calculatorPath } from "@/lib/routes";

/** Percentage Calculator's own tool list for the shared {@link OtherCalculatorsList}. */
export function OtherCalculators() {
  const { locale, d } = useLocale<PercentageDictionary>();

  return (
    <OtherCalculatorsList
      heading={d.nav.otherCalculators}
      tools={[{ label: d.nav.gstCalculator, href: calculatorPath(locale) }]}
    />
  );
}

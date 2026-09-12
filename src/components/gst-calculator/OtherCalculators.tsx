"use client";

import { OtherCalculators as OtherCalculatorsList } from "@/components/OtherCalculators";
import { useLocale } from "@/components/LocaleProvider";
import { percentageCalculatorPath } from "@/lib/routes";

/** GST Calculator's own tool list for the shared {@link OtherCalculatorsList}. */
export function OtherCalculators() {
  const { locale, d } = useLocale();

  return (
    <OtherCalculatorsList
      heading={d.nav.otherCalculators}
      tools={[{ label: d.nav.percentageCalculator, href: percentageCalculatorPath(locale) }]}
    />
  );
}

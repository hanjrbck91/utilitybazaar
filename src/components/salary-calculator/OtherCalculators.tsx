"use client";

import { OtherCalculators as OtherCalculatorsList } from "@/components/OtherCalculators";
import { useLocale } from "@/components/LocaleProvider";
import { type SalaryDictionary } from "@/lib/i18n";
import { calculatorPath, percentageCalculatorPath } from "@/lib/routes";

/** Salary Calculator's own tool list for the shared {@link OtherCalculatorsList}. */
export function OtherCalculators() {
  const { locale, d } = useLocale<SalaryDictionary>();

  return (
    <OtherCalculatorsList
      heading={d.nav.otherCalculators}
      tools={[
        { label: d.nav.gstCalculator, href: calculatorPath(locale) },
        { label: d.nav.percentageCalculator, href: percentageCalculatorPath(locale) },
      ]}
    />
  );
}

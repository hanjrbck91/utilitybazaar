import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Faq } from "@/components/Faq";
import { LocaleProvider } from "@/components/LocaleProvider";
import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Calculator } from "@/components/salary-calculator/Calculator";
import { OtherCalculators } from "@/components/salary-calculator/OtherCalculators";
import { SupportingContent } from "@/components/salary-calculator/SupportingContent";
import { getSalaryDictionary, isLocale, LOCALES, type Locale } from "@/lib/i18n";
import { salaryCalculatorPath } from "@/lib/routes";
import { metadataBase } from "@/lib/seo/metadata";

/**
 * Provisional metadata. The page's SEO (title/description spec,
 * canonical, hreflang, Open Graph, JSON-LD, sitemap) belongs to M15.4;
 * until then the page asks not to be indexed, so an early deploy cannot
 * put a half-finished page into search results.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const d = getSalaryDictionary(locale);

  return {
    metadataBase: metadataBase(),
    title: `${d.app.title} — ${d.app.purpose}`,
    description: d.app.tagline,
    robots: { index: false, follow: true },
  };
}

export default async function SalaryCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const languageHrefs = Object.fromEntries(
    LOCALES.map((code) => [code, salaryCalculatorPath(code)]),
  ) as Record<Locale, string>;

  return (
    <main className="mx-auto flex w-full max-w-[464px] flex-1 flex-col px-5 pb-20 pt-10 sm:max-w-xl sm:pt-16 lg:max-w-2xl lg:pt-24">
      <LocaleProvider initialLocale={locale} dictionary={getSalaryDictionary(locale)}>
        <PageHeader languageHrefs={languageHrefs} />
        <Calculator />
        <OtherCalculators />
        {/* Advertising, when configured, sits after the whole tool —
            never between a control and its result. */}
        <AdSlot slot="calculator-below" />
        <SupportingContent />
        <Faq />
        <SiteFooter />
      </LocaleProvider>
    </main>
  );
}

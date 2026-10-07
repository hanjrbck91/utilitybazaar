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
import {
  buildSalaryCalculatorJsonLd,
  buildSalaryFaqJsonLd,
  buildWebSiteJsonLd,
  serializeJsonLd,
} from "@/lib/seo/jsonld";
import { buildSalaryCalculatorSeo, metadataBase } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const seo = buildSalaryCalculatorSeo(locale);

  return {
    metadataBase: metadataBase(),
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: seo.canonical,
      languages: seo.languages,
    },
    openGraph: {
      title: seo.openGraph.title,
      description: seo.openGraph.description,
      url: seo.openGraph.url,
      siteName: seo.openGraph.siteName,
      locale: seo.openGraph.locale,
      alternateLocale: seo.openGraph.alternateLocales,
      type: seo.openGraph.type,
    },
    twitter: {
      card: seo.twitter.card,
      title: seo.twitter.title,
      description: seo.twitter.description,
    },
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
      <script
        type="application/ld+json"
        // Built from static, non-user data — see lib/seo/jsonld.ts.
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildSalaryCalculatorJsonLd(locale)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildWebSiteJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        // FAQ questions/answers are the same strings rendered by <Faq />.
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildSalaryFaqJsonLd(locale)),
        }}
      />
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

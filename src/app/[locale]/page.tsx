import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocaleProvider } from "@/components/LocaleProvider";
import { PageHeader } from "@/components/PageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ToolsList } from "@/components/home/ToolsList";
import { getHomeDictionary, isLocale, LOCALES, type Locale } from "@/lib/i18n";
import { homePath } from "@/lib/routes";
import { buildWebSiteJsonLd, serializeJsonLd } from "@/lib/seo/jsonld";
import { buildHomeSeo, metadataBase } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const seo = buildHomeSeo(locale);

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

/**
 * The UtilityBazaar homepage / tools hub — the site's front door at
 * `/en` and `/hi`. Deliberately minimal: an identity header (reusing
 * `PageHeader`, so the language switch behaves exactly like every other
 * page), the tool catalogue, and the shared footer. No calculator logic
 * lives here.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const languageHrefs = Object.fromEntries(
    LOCALES.map((code) => [code, homePath(code)]),
  ) as Record<Locale, string>;

  return (
    <main className="mx-auto flex w-full max-w-[464px] flex-1 flex-col px-5 pb-20 pt-10 sm:max-w-xl sm:pt-16 lg:max-w-2xl lg:pt-24">
      <script
        type="application/ld+json"
        // Site-wide identity only — no tool-specific schema belongs on
        // the homepage. See lib/seo/jsonld.ts.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildWebSiteJsonLd()) }}
      />
      <LocaleProvider initialLocale={locale} dictionary={getHomeDictionary(locale)}>
        <PageHeader languageHrefs={languageHrefs} />
        <ToolsList />
        <SiteFooter />
      </LocaleProvider>
    </main>
  );
}

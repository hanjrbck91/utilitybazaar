import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { AdSenseScript } from "@/components/AdSlot";
import { Analytics } from "@/components/Analytics";
import { fontVariables } from "@/lib/fonts";
import { LOCALES, getLocaleTag, isLocale } from "@/lib/i18n";
import { metadataBase } from "@/lib/seo/metadata";

/** Site-wide base for resolving any relative metadata URL. Pages still set
 *  their own absolute canonical / OG URLs; this is the fallback. */
export const metadata: Metadata = {
  metadataBase: metadataBase(),
};

export const viewport: Viewport = {
  // The page is light for everyone, so the browser chrome matches it.
  themeColor: "#fbfaf7",
};

/** Both locales are known at build time, so both pages prerender. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Root layout for the localized calculator.
 *
 * It owns `<html>` so `lang` can be the real locale in the served HTML —
 * setting it on the client afterwards would leave crawlers and screen
 * readers with the wrong language on first paint.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={getLocaleTag(locale)} className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg text-text">
        {children}
        <Analytics />
        <AdSenseScript />
      </body>
    </html>
  );
}

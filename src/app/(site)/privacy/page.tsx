import type { Metadata } from "next";
import { StaticPage } from "@/components/StaticPage";
import { getDictionary } from "@/lib/i18n";
import { STATIC_PATHS } from "@/lib/routes";
import { buildStaticPageSeo, metadataBase } from "@/lib/seo/metadata";

const d = getDictionary("en").privacy;
const seo = buildStaticPageSeo({
  path: STATIC_PATHS.privacy,
  title: d.title,
  description: d.description,
});

export const metadata: Metadata = {
  metadataBase: metadataBase(),
  title: seo.title,
  description: seo.description,
  alternates: { canonical: seo.canonical },
  openGraph: {
    title: seo.openGraph.title,
    description: seo.openGraph.description,
    url: seo.openGraph.url,
    siteName: seo.openGraph.siteName,
    locale: seo.openGraph.locale,
    type: seo.openGraph.type,
  },
  twitter: {
    card: seo.twitter.card,
    title: seo.twitter.title,
    description: seo.twitter.description,
  },
};

export default function Page() {
  return <StaticPage title={d.title} paragraphs={d.body} />;
}

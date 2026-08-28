import type { Viewport } from "next";
import "../globals.css";
import { AdSenseScript } from "@/components/AdSlot";
import { Analytics } from "@/components/Analytics";
import { fontVariables } from "@/lib/fonts";
import { LOCALE_TAGS } from "@/lib/i18n";

export const viewport: Viewport = {
  themeColor: "#fbfaf7",
};

/**
 * Root layout for the supporting pages. These are English-only, so the
 * language is fixed rather than routed.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={LOCALE_TAGS.en} className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg text-text">
        {children}
        <Analytics />
        <AdSenseScript />
      </body>
    </html>
  );
}

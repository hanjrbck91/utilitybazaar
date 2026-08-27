import Script from "next/script";
import { GA_MEASUREMENT_ID, isAnalyticsEnabled } from "@/lib/config";

/**
 * Google Analytics 4 tag.
 *
 * Renders nothing at all when no measurement ID is configured, so a
 * deployment without analytics ships no third-party script and sets no
 * cookies. Loaded `afterInteractive` so it never blocks the calculator.
 *
 * `send_page_view` stays on for page-level reporting; individual events
 * go through `track()`, which strips everything outside its allowlist.
 */
export function Analytics() {
  if (!isAnalyticsEnabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}

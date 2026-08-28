import Script from "next/script";
import { ADSENSE_CLIENT_ID, isAdsEnabled } from "@/lib/config";

/**
 * An advertising position.
 *
 * With no publisher ID configured this renders **nothing at all** — no
 * placeholder, no border, no reserved height. An unconfigured
 * deployment (including local development) looks exactly like a site
 * with no ads, because that is what it is.
 *
 * With a publisher ID it reserves a modest responsive block so that a
 * served ad does not shift the page. There is no border or "Ad" caption:
 * an unfilled auto-format slot collapses itself, and AdSense creatives
 * bring their own frame.
 *
 * Placement rules live at the call sites: after the whole tool, before
 * the supporting content, never between a control and its result, never
 * over a control, and never close enough to a tappable element to catch
 * a mis-tap.
 */
export function AdSlot({ slot }: { slot?: string }) {
  if (!isAdsEnabled) return null;

  return (
    <aside aria-label="Advertisement" className="mt-8 overflow-hidden">
      <ins
        className="adsbygoogle block min-h-[90px] w-full sm:min-h-[120px]"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id={`adsense-push-${slot ?? "auto"}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </aside>
  );
}

/**
 * The AdSense loader. Rendered once per document, and only when a
 * publisher ID exists.
 */
export function AdSenseScript() {
  if (!isAdsEnabled) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

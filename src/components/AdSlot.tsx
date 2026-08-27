import Script from "next/script";
import { ADSENSE_CLIENT_ID, isAdsEnabled } from "@/lib/config";

/**
 * A reserved advertising position.
 *
 * With no publisher ID configured this renders **nothing** — no
 * placeholder, no empty box, no reserved gap. An unapproved or
 * unconfigured deployment looks exactly like a site with no ads, which
 * is the honest state and also the one that reviews best.
 *
 * Placement rules live at the call sites: never inside the amount input,
 * never between the controls and the result, never over a control, and
 * never close enough to a tappable element to catch a mis-tap.
 */
export function AdSlot({ slot }: { slot?: string }) {
  if (!isAdsEnabled) return null;

  return (
    <aside
      aria-label="Advertisement"
      className="mt-8 overflow-hidden rounded-control border border-line"
    >
      <ins
        className="adsbygoogle block"
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

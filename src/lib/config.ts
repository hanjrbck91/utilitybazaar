/**
 * Deployment configuration.
 *
 * Everything here is optional: with nothing configured the calculator
 * still works completely, no analytics is loaded and no ad markup is
 * rendered. Only public (`NEXT_PUBLIC_`) values are used — there are no
 * secrets, because there is no backend.
 */

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

/** Raw value as configured; empty when the deployment has not set it. */
const configuredSiteUrl = clean(process.env.NEXT_PUBLIC_SITE_URL).replace(/\/+$/, "");

/**
 * True once a real site URL has been configured.
 *
 * Used to keep an unconfigured deployment out of search results rather
 * than letting it be indexed under a placeholder origin.
 */
export const isSiteUrlConfigured = configuredSiteUrl !== "";

/** Absolute site origin. Falls back to localhost for local development. */
export const SITE_URL = isSiteUrlConfigured ? configuredSiteUrl : "http://localhost:3000";

/** Google Analytics 4 measurement ID. Empty disables analytics entirely. */
export const GA_MEASUREMENT_ID = clean(process.env.NEXT_PUBLIC_GA_ID);

/** AdSense publisher ID (`ca-pub-…`). Empty renders no ad markup at all. */
export const ADSENSE_CLIENT_ID = clean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID);

export const isAnalyticsEnabled = GA_MEASUREMENT_ID !== "";
export const isAdsEnabled = ADSENSE_CLIENT_ID !== "";

/** Join a site-relative path onto the configured origin. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

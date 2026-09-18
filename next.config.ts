import type { NextConfig } from "next";

/**
 * Hosts other than the production domain that can still serve this app
 * (the Vercel production alias and every preview/deployment URL). They
 * must never be indexed as duplicates of utilitybazaar.in, so every
 * response on a `*.vercel.app` host carries `X-Robots-Tag: noindex`.
 * A header — not a redirect — because redirects on those hosts could
 * interfere with Vercel preview and deployment-protection flows.
 */
const NON_CANONICAL_HOST = "(.*\\.)?vercel\\.app";

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Only features the app genuinely never uses. Left untouched: clipboard
  // and Web Share (result sharing), plus anything AdSense may need later.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Drop the `X-Powered-By: Next.js` banner.
  poweredByHeader: false,

  async redirects() {
    return [
      // `/` is not a page of its own: English is the default experience,
      // so the root sends visitors and crawlers to the homepage's
      // canonical URL. `/en` and `/hi` are real pages (the tools hub, see
      // src/app/[locale]/page.tsx) and no longer need a redirect of
      // their own.
      { source: "/", destination: "/en", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: NON_CANONICAL_HOST }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;

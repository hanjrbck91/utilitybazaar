import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // `/` is not a page of its own: English is the default experience,
      // so the root sends visitors and crawlers to its canonical URL.
      { source: "/", destination: "/en/gst-calculator", permanent: true },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  async redirects() {
    // The admin panel moved to /studio. Old links get a permanent (308)
    // redirect so bookmarks and any indexed URLs keep working.
    return [
      { source: "/admin", destination: "/studio", permanent: true },
      { source: "/admin/:path*", destination: "/studio/:path*", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);

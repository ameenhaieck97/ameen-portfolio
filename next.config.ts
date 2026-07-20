import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Images uploaded through the studio are served from Supabase Storage (an
// external host) rather than /public — next/image refuses to optimize any
// remote host that isn't explicitly allow-listed here, so without this every
// CMS-uploaded cover/gallery image silently fails to render on the public
// site while local seed images (same-origin) keep working fine.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async redirects() {
    // The admin panel moved to /studio. Old links get a permanent (308)
    // redirect so bookmarks and any indexed URLs keep working.
    return [
      { source: "/admin", destination: "/studio", permanent: true },
      { source: "/admin/:path*", destination: "/studio/:path*", permanent: true },
      // The CMS sidebar was reorganized to mirror the public website's
      // structure instead of the database — old table-named routes redirect
      // to their new website-structured locations.
      {
        source: "/studio/projects",
        destination: "/studio/website/portfolio",
        permanent: true,
      },
      {
        source: "/studio/projects/:path*",
        destination: "/studio/website/portfolio/:path*",
        permanent: true,
      },
      { source: "/studio/testimonials", destination: "/studio/clients", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);

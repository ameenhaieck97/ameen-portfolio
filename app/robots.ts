import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin CMS and token-secured client/receipt statements — never meant
      // to be indexed, regardless of any direct link that surfaces them.
      disallow: ["/studio", "/client", "/receipt"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

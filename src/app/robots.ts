import type { MetadataRoute } from "next";

import { isProductionSite, siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionSite) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio/", "/api/", "/auth/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

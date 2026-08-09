import type { MetadataRoute } from "next";

import { isProductionSite, siteConfig } from "@/lib/site";

export function createRobots(
  production = isProductionSite,
): MetadataRoute.Robots {
  if (!production) {
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
        allow: ["/", "/api/og/product/"],
        disallow: ["/studio", "/studio/", "/api/", "/auth/"],
      },
    ],
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
    host: new URL(siteConfig.url).origin,
  };
}

export default function robots(): MetadataRoute.Robots {
  return createRobots();
}

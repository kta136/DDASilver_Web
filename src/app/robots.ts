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
      {
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "Perplexity-User",
          "Claude-SearchBot",
          "Claude-User",
        ],
        allow: ["/", "/api/og/product/"],
        disallow: ["/studio", "/studio/", "/api/", "/auth/"],
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "Google-Extended"],
        disallow: "/",
      },
    ],
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
    host: new URL(siteConfig.url).origin,
  };
}

export default function robots(): MetadataRoute.Robots {
  return createRobots();
}

import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";
import { getPublishedCatalog } from "@/sanity/lib/catalog";

const staticRoutes = [
  "",
  "/products",
  "/rates",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/rates-disclaimer",
  "/cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories, collections } = await getPublishedCatalog();
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: new URL(route || "/", siteConfig.url).toString(),
      lastModified: now,
      changeFrequency: route === "/rates" ? ("daily" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.7,
    })),
    ...products.map((product) => ({
      url: new URL(`/products/${product.slug}`, siteConfig.url).toString(),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: new URL(`/category/${category.slug}`, siteConfig.url).toString(),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...collections.map((collection) => ({
      url: new URL(`/collections/${collection.slug}`, siteConfig.url).toString(),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

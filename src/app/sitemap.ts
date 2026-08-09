import type { MetadataRoute } from "next";

import {
  getPopulatedCategories,
  getPopulatedCollections,
} from "@/lib/catalog-seo";
import { toAbsoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getPublishedCatalog } from "@/sanity/lib/catalog";

const staticRoutes = [
  "",
  "/products",
  "/rates",
  "/about",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories, collections } = await getPublishedCatalog();
  const populatedCategories = getPopulatedCategories(categories, products);
  const populatedCollections = getPopulatedCollections(collections, products);

  return [
    ...staticRoutes.map((route) => ({
      url: new URL(route || "/", siteConfig.url).toString(),
      changeFrequency:
        route === "/rates" ? ("daily" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.7,
    })),
    ...products.map((product) => ({
      url: new URL(`/products/${product.slug}`, siteConfig.url).toString(),
      ...(product.updatedAt ? { lastModified: product.updatedAt } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: product.images.map((image) => toAbsoluteUrl(image.src)),
    })),
    ...populatedCategories.map((category) => ({
      url: new URL(`/category/${category.slug}`, siteConfig.url).toString(),
      ...(category.updatedAt ? { lastModified: category.updatedAt } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: [toAbsoluteUrl(category.image.src)],
    })),
    ...populatedCollections.map((collection) => ({
      url: new URL(`/collections/${collection.slug}`, siteConfig.url).toString(),
      ...(collection.updatedAt ? { lastModified: collection.updatedAt } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: [toAbsoluteUrl(collection.heroImage.src)],
    })),
  ];
}

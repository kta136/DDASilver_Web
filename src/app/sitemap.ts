import type { MetadataRoute } from "next";

import {
  getPopulatedCategories,
  getPopulatedCollections,
} from "@/lib/catalog-seo";
import { toAbsoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getSitemapCatalog } from "@/sanity/lib/catalog";

const staticRoutes = ["", "/products", "/rates", "/about", "/contact"];

function getLatestModified(...candidates: Array<string | undefined>) {
  let latest: { value: string; timestamp: number } | undefined;

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const timestamp = Date.parse(candidate);
    if (Number.isNaN(timestamp)) {
      continue;
    }

    if (!latest || timestamp > latest.timestamp) {
      latest = { value: candidate, timestamp };
    }
  }

  return latest?.value;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories, collections } = await getSitemapCatalog();
  const populatedCategories = getPopulatedCategories(categories, products);
  const populatedCollections = getPopulatedCollections(collections, products);
  const catalogLastModified = getLatestModified(
    ...products.map((product) => product.updatedAt),
    ...categories.map((category) => category.updatedAt),
    ...collections.map((collection) => collection.updatedAt),
  );
  const latestProductUpdateByCategory = new Map<string, string>();
  const latestProductUpdateByCollection = new Map<string, string>();

  for (const product of products) {
    const categoryUpdate = getLatestModified(
      latestProductUpdateByCategory.get(product.categorySlug),
      product.updatedAt,
    );
    if (categoryUpdate) {
      latestProductUpdateByCategory.set(product.categorySlug, categoryUpdate);
    }

    for (const collectionSlug of product.collectionSlugs) {
      const collectionUpdate = getLatestModified(
        latestProductUpdateByCollection.get(collectionSlug),
        product.updatedAt,
      );
      if (collectionUpdate) {
        latestProductUpdateByCollection.set(collectionSlug, collectionUpdate);
      }
    }
  }

  return [
    ...staticRoutes.map((route) => ({
      url: new URL(route || "/", siteConfig.url).toString(),
      ...((route === "" || route === "/products") && catalogLastModified
        ? { lastModified: catalogLastModified }
        : {}),
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
    ...populatedCategories.map((category) => {
      const lastModified = getLatestModified(
        category.updatedAt,
        latestProductUpdateByCategory.get(category.slug),
      );

      return {
        url: new URL(`/category/${category.slug}`, siteConfig.url).toString(),
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images: [toAbsoluteUrl(category.image.src)],
      };
    }),
    ...populatedCollections.map((collection) => {
      const lastModified = getLatestModified(
        collection.updatedAt,
        latestProductUpdateByCollection.get(collection.slug),
      );

      return {
        url: new URL(
          `/collections/${collection.slug}`,
          siteConfig.url,
        ).toString(),
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images: [toAbsoluteUrl(collection.heroImage.src)],
      };
    }),
  ];
}

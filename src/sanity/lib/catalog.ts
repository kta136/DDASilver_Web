import { cache } from "react";
import { draftMode } from "next/headers";

import {
  fallbackCategories,
  fallbackCollections,
  fallbackProducts,
} from "@/data/catalog";
import { isSanityConfigured } from "@/sanity/env";
import {
  sanityClient,
  sanityPreviewClient,
} from "@/sanity/lib/client";
import {
  categoriesQuery,
  collectionsQuery,
  productsQuery,
} from "@/sanity/lib/queries";
import type { Category, Collection, Product } from "@/types/catalog";

type Catalog = {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  source: "sanity" | "fallback";
};

function getFallbackCatalog(): Catalog {
  return {
    products: fallbackProducts,
    categories: fallbackCategories,
    collections: fallbackCollections,
    source: "fallback",
  };
}

async function fetchCatalog(
  client: typeof sanityClient,
): Promise<Catalog> {
  const [products, categories, collections] = await Promise.all([
    client.fetch<Product[]>(
      productsQuery,
      {},
      { next: { tags: ["product"] } },
    ),
    client.fetch<Category[]>(
      categoriesQuery,
      {},
      { next: { tags: ["category"] } },
    ),
    client.fetch<Collection[]>(
      collectionsQuery,
      {},
      { next: { tags: ["collection"] } },
    ),
  ]);

  // Keep the private preview usable while the new DDA Silver dataset is being
  // populated. Sanity becomes authoritative as soon as it has both products
  // and categories; collections may remain empty because they are optional.
  if (products.length === 0 || categories.length === 0) {
    return getFallbackCatalog();
  }

  return {
    products,
    categories,
    collections,
    source: "sanity",
  };
}

export const getPublishedCatalog = cache(async (): Promise<Catalog> => {
  if (!isSanityConfigured) {
    return getFallbackCatalog();
  }

  return fetchCatalog(sanityClient);
});

export const getCatalog = cache(async (): Promise<Catalog> => {
  if (!isSanityConfigured) {
    return getFallbackCatalog();
  }

  const { isEnabled } = await draftMode();
  return fetchCatalog(isEnabled ? sanityPreviewClient : sanityClient);
});

export const getProduct = cache(async (slug: string) => {
  const catalog = await getCatalog();
  return catalog.products.find((product) => product.slug === slug);
});

export const getCategory = cache(async (slug: string) => {
  const catalog = await getCatalog();
  return catalog.categories.find((category) => category.slug === slug);
});

export const getCollection = cache(async (slug: string) => {
  const catalog = await getCatalog();
  return catalog.collections.find((collection) => collection.slug === slug);
});

import { cache } from "react";
import { draftMode } from "next/headers";
import { z } from "zod";

import {
  fallbackCategories,
  fallbackCollections,
  fallbackProducts,
} from "@/data/catalog";
import {
  isSanityConfigured,
  sanityDataset,
  sanityProjectId,
} from "@/sanity/env";
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

const boundedText = z.string().trim().min(1).max(500);
const slug = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const updatedAt = z.string().datetime({ offset: true }).optional();
const sanityImageUrlPrefix = `https://cdn.sanity.io/images/${sanityProjectId}/${sanityDataset}/`;
const catalogImageSchema = z.object({
  src: z
    .string()
    .url()
    .refine((value) => value.startsWith(sanityImageUrlPrefix)),
  alt: z.string().trim().max(240),
  width: z.number().int().positive().max(20_000),
  height: z.number().int().positive().max(20_000),
  objectPosition: z
    .enum(["left center", "right center", "center center"])
    .optional(),
});
const categorySchema = z.object({
  title: boundedText,
  slug,
  description: boundedText,
  image: catalogImageSchema,
  displayOrder: z.number().int().min(0).max(100_000),
  updatedAt,
});
const collectionSchema = z.object({
  title: boundedText,
  slug,
  description: boundedText,
  heroImage: catalogImageSchema,
  productSlugs: z.array(slug).max(1_000),
  displayOrder: z.number().int().min(0).max(100_000),
  updatedAt,
});
const deitySchema = z.object({
  title: boundedText,
  slug,
});
const productSchema = z.object({
  title: boundedText,
  slug,
  shortDescription: boundedText,
  images: z.array(catalogImageSchema).min(1).max(20),
  categorySlug: slug,
  collectionSlugs: z.array(slug).max(100),
  featured: z.boolean(),
  displayOrder: z.number().int().min(0).max(100_000),
  reference: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .nullish()
    .transform((value) => value ?? undefined),
  purity: z
    .enum(["92.5", "99.80"])
    .nullish()
    .transform((value) => value ?? undefined),
  weightGrams: z
    .number()
    .positive()
    .max(100_000)
    .nullish()
    .transform((value) => value ?? undefined),
  heightInches: z
    .number()
    .positive()
    .max(1_000)
    .nullish()
    .transform((value) => value ?? undefined),
  widthInches: z
    .number()
    .positive()
    .max(1_000)
    .nullish()
    .transform((value) => value ?? undefined),
  diameterInches: z
    .number()
    .positive()
    .max(1_000)
    .nullish()
    .transform((value) => value ?? undefined),
  singhasanWidthInches: z
    .number()
    .positive()
    .max(1_000)
    .nullish()
    .transform((value) => value ?? undefined),
  singhasanDepthInches: z
    .number()
    .positive()
    .max(1_000)
    .nullish()
    .transform((value) => value ?? undefined),
  utensilType: z
    .enum(["glass", "bowl", "plate", "jug", "kalash", "spoon"])
    .nullish()
    .transform((value) => value ?? undefined),
  idolConstruction: z
    .enum(["hollow", "solid", "semi-solid"])
    .nullish()
    .transform((value) => value ?? undefined),
  deities: z.array(deitySchema).max(50),
  coinShape: z
    .enum(["round", "oval", "square", "rectangle"])
    .nullish()
    .transform((value) => value ?? undefined),
  updatedAt,
});
const catalogSchema = z.object({
  products: z.array(productSchema).max(1_000),
  categories: z.array(categorySchema).max(100),
  collections: z.array(collectionSchema).max(100),
});

function getFallbackCatalog(): Catalog {
  return {
    products: fallbackProducts,
    categories: fallbackCategories,
    collections: fallbackCollections,
    source: "fallback",
  };
}

async function fetchCatalogPayload(
  client: typeof sanityClient,
): Promise<[unknown, unknown, unknown]> {
  return Promise.all([
    client.fetch<unknown>(
      productsQuery,
      {},
      { next: { tags: ["product"] } },
    ),
    client.fetch<unknown>(
      categoriesQuery,
      {},
      { next: { tags: ["category"] } },
    ),
    client.fetch<unknown>(
      collectionsQuery,
      {},
      { next: { tags: ["collection"] } },
    ),
  ]);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Sanity error";
}

export async function fetchCatalog(
  client: typeof sanityClient,
): Promise<Catalog> {
  let payload: [unknown, unknown, unknown];

  try {
    payload = await fetchCatalogPayload(client);
  } catch (primaryError) {
    try {
      payload = await fetchCatalogPayload(
        client.withConfig({ useCdn: false }),
      );
    } catch (retryError) {
      console.error("Sanity catalog fetch failed; using fallback catalog.", {
        primary: getErrorMessage(primaryError),
        retry: getErrorMessage(retryError),
      });
      return getFallbackCatalog();
    }
  }

  const [products, categories, collections] = payload;
  const parsed = catalogSchema.safeParse({
    products,
    categories,
    collections,
  });

  // Keep the private preview usable while the new DDA Silver dataset is being
  // populated. Sanity becomes authoritative as soon as it has both products
  // and categories; collections may remain empty because they are optional.
  if (
    !parsed.success ||
    parsed.data.products.length === 0 ||
    parsed.data.categories.length === 0
  ) {
    return getFallbackCatalog();
  }

  return {
    products: parsed.data.products,
    categories: parsed.data.categories,
    collections: parsed.data.collections,
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

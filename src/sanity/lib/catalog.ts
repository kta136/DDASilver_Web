import { cache } from "react";
import { draftMode } from "next/headers";
import { z } from "zod";
import type { QueryParams } from "next-sanity";

import {
  fallbackCategories,
  fallbackCollections,
  fallbackProducts,
} from "@/data/catalog";
import {
  catalogLimits,
  catalogSlugSchema,
  getCategoryKind,
} from "@/lib/catalog-domain";
import {
  filterProducts,
  getCatalogFilterAvailability,
  getFacetAvailability,
  type CatalogFilters,
} from "@/lib/catalog-filter";
import { parseCatalogSearchParams } from "@/lib/catalog-url";
import { getCatalogImageWithSeo } from "@/lib/sanity-image";
import { getProductSeoName } from "@/lib/seo";
import { isSanityConfigured } from "@/sanity/env";
import { sanityClient, sanityPreviewClient } from "@/sanity/lib/client";
import {
  catalogImageSchema,
  categorySchema,
  collectionSchema,
  decodeDocuments,
  facetSchema,
  productSchema,
} from "@/sanity/lib/contract";
import * as queries from "@/sanity/lib/queries";
import { CatalogUnavailableError, createSanityReader } from "@/sanity/lib/read";
import type { SnapshotStore } from "@/sanity/lib/snapshot";
import type {
  CatalogFacet,
  CatalogPage,
  Category,
  Collection,
  Product,
} from "@/types/catalog";

export type Catalog = {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  source: "sanity" | "stale" | "fallback";
};
export const CATALOG_PAGE_SIZE = 24;
type Reader = ReturnType<typeof createSanityReader>;
const publishedReader = createSanityReader(sanityClient);
const previewReader = createSanityReader(sanityPreviewClient, { draft: true });
const getReader = cache(async () =>
  (await draftMode()).isEnabled ? previewReader : publishedReader,
);

function demoAllowed() {
  return (
    process.env.NEXT_PUBLIC_SITE_ENV !== "production" && !isSanityConfigured
  );
}
function demoCatalog(): Catalog {
  if (!demoAllowed()) throw new CatalogUnavailableError();
  return {
    products: fallbackProducts,
    categories: fallbackCategories,
    collections: fallbackCollections,
    source: "fallback",
  };
}
function productImageSeo<
  T extends Pick<Product, "title" | "reference" | "slug" | "images">,
>(product: T): T {
  const name = getProductSeoName(product.title, product.reference);
  return {
    ...product,
    images: product.images.map((image, index) =>
      getCatalogImageWithSeo(image, {
        fallbackAlt:
          index === 0
            ? `${name} from DDA Silver`
            : `${name}, alternate view ${index + 1}, from DDA Silver`,
        vanityFilename:
          index === 0 ? product.slug : `${product.slug}-view-${index + 1}`,
      }),
    ),
  };
}
function categoryImageSeo(category: Category): Category {
  return {
    ...category,
    productKind: getCategoryKind(category),
    image: getCatalogImageWithSeo(category.image, {
      fallbackAlt: `${category.title} category at DDA Silver`,
      vanityFilename: `${category.slug}-category`,
    }),
    ...(category.firstProductImage
      ? {
          firstProductImage: getCatalogImageWithSeo(
            category.firstProductImage,
            {
              fallbackAlt: `${category.title} from DDA Silver`,
              vanityFilename: `${category.slug}-featured-product`,
            },
          ),
        }
      : {}),
  };
}
function collectionImageSeo(collection: Collection): Collection {
  return {
    ...collection,
    heroImage: getCatalogImageWithSeo(collection.heroImage, {
      fallbackAlt: `${collection.title} collection at DDA Silver`,
      vanityFilename: `${collection.slug}-collection`,
    }),
  };
}
async function readNavigation(read: Reader) {
  const [categories, collections] = await Promise.all([
    read(queries.categoriesQuery, {}, (raw, previous?: Category[]) =>
      decodeDocuments(categorySchema, raw, "category", previous),
    ),
    read(queries.collectionsQuery, {}, (raw, previous?: Collection[]) =>
      decodeDocuments(collectionSchema, raw, "collection", previous),
    ),
  ]);
  return {
    categories: categories.value.map(categoryImageSeo),
    collections: collections.value.map(collectionImageSeo),
    degraded: Boolean(categories.degraded || collections.degraded),
  };
}
export const getCatalogNavigation = cache(async () => {
  if (!isSanityConfigured) {
    const { categories, collections, products } = demoCatalog();
    return {
      categories: categories.map((category) => ({
        ...category,
        productKind: getCategoryKind(category),
        firstProductImage: products.find(
          (product) => product.categorySlug === category.slug,
        )?.images[0],
        productCount: products.filter(
          (product) => product.categorySlug === category.slug,
        ).length,
      })),
      collections,
      degraded: false,
    };
  }
  return readNavigation(await getReader());
});

async function readProductList(
  read: Reader,
  query: string,
  params: QueryParams = {},
) {
  const result = await read(query, params, (raw, previous?: Product[]) =>
    decodeDocuments(productSchema, raw, "product", previous),
  );
  return {
    value: result.value.map(productImageSeo),
    degraded: result.degraded,
  };
}

type Batch<T> = { items: T[]; cursor: string; hasMore: boolean };
export async function readAllDocuments<T>(
  read: Reader,
  query: string,
  schema: z.ZodType<T>,
  type: string,
) {
  const items: T[] = [];
  let afterId = "";
  let degraded = false;
  for (;;) {
    const result = await read(
      query,
      { afterId },
      (raw, previous?: Batch<T>) => {
        const decoded = decodeDocuments(schema, raw, type, previous?.items);
        const rows = raw as { _id?: string }[];
        const hasMore = rows.length === 200;
        const cursor = rows.at(-1)?._id ?? "";
        if (hasMore && cursor <= afterId)
          throw new Error("Sanity cursor did not advance.");
        return {
          value: { items: decoded.value, cursor, hasMore },
          degraded: decoded.degraded,
        };
      },
    );
    items.push(...result.value.items);
    degraded ||= Boolean(result.degraded);
    if (!result.value.hasMore) break;
    afterId = result.value.cursor;
  }
  return { value: items, degraded };
}

// Full reads are reserved for exports and maintenance. Customer routes use the
// focused helpers below, so catalog size does not determine detail-page cost.
export async function fetchCatalog(
  client: typeof sanityClient,
  options: { draft?: boolean; store?: SnapshotStore } = {},
): Promise<Catalog> {
  const read = createSanityReader(client, options);
  try {
    const [products, navigation] = await Promise.all([
      readAllDocuments(read, queries.productsQuery, productSchema, "product"),
      readNavigation(read),
    ]);
    return {
      products: products.value.map(productImageSeo),
      categories: navigation.categories,
      collections: navigation.collections,
      source: products.degraded || navigation.degraded ? "stale" : "sanity",
    };
  } catch (error) {
    if (demoAllowed() && !options.draft) return demoCatalog();
    throw error;
  }
}
export const getPublishedCatalog = cache(async () =>
  isSanityConfigured ? fetchCatalog(sanityClient) : demoCatalog(),
);
export const getCatalog = cache(async () => {
  if (!isSanityConfigured) return demoCatalog();
  const draft = (await draftMode()).isEnabled;
  return fetchCatalog(draft ? sanityPreviewClient : sanityClient, { draft });
});

async function findProduct(read: Reader, slug: string) {
  if (!catalogSlugSchema.safeParse(slug).success) return undefined;
  return (await readProductList(read, queries.productQuery, { slug })).value[0];
}
export const getProduct = cache(async (slug: string) =>
  isSanityConfigured
    ? findProduct(await getReader(), slug)
    : demoCatalog().products.find((product) => product.slug === slug),
);
export const getPublishedProduct = cache(async (slug: string) =>
  isSanityConfigured
    ? findProduct(publishedReader, slug)
    : demoCatalog().products.find((product) => product.slug === slug),
);
export const getCategory = cache(async (slug: string) =>
  (await getCatalogNavigation()).categories.find(
    (category) => category.slug === slug,
  ),
);
export const getCollection = cache(async (slug: string) =>
  (await getCatalogNavigation()).collections.find(
    (collection) => collection.slug === slug,
  ),
);
export const getRelatedProducts = cache(
  async (category: string, slug: string) =>
    isSanityConfigured
      ? (
          await readProductList(
            await getReader(),
            queries.relatedProductsQuery,
            { category, slug },
          )
        ).value
      : demoCatalog()
          .products.filter(
            (product) =>
              product.categorySlug === category && product.slug !== slug,
          )
          .slice(0, 3),
);
export const getHomepageCatalog = cache(async () => {
  const [navigation, products] = await Promise.all([
    getCatalogNavigation(),
    isSanityConfigured
      ? getReader().then((read) =>
          readProductList(read, queries.featuredProductsQuery),
        )
      : Promise.resolve({
          value: demoCatalog()
            .products.filter((product) => product.featured)
            .slice(0, 4),
          degraded: false,
        }),
  ]);
  return {
    ...navigation,
    products: products.value,
    degraded: navigation.degraded || Boolean(products.degraded),
  };
});

function demoFacets(
  products: Product[],
  categories: Category[],
): CatalogFacet[] {
  return categories.map(({ slug }) => {
    const values = getCatalogFilterAvailability(products, slug);
    return {
      categorySlug: slug,
      productCount: products.filter((product) => product.categorySlug === slug)
        .length,
      purities: [...values.purities],
      idolConstructions: [...values.idolConstructions],
      deities: [...values.deities].map(([slug, title]) => ({ slug, title })),
      coinShapes: [...values.coinShapes],
      utensilTypes: [...values.utensilTypes],
    };
  });
}
const pageEnvelope = z.object({
  products: z.array(z.unknown()),
  total: z.number().int().nonnegative(),
});
export function getListingParams(
  filters: CatalogFilters,
  page: number,
  collection: string,
) {
  return {
    category: filters.category ?? "",
    collection,
    purity: filters.purity ?? "",
    idol: filters.idolConstruction ?? "",
    deity: filters.deitySlug ?? "",
    shape: filters.coinShape ?? "",
    item: filters.utensilType ?? "",
    terms: (
      filters.query?.toLocaleLowerCase("en-IN").match(/[\p{L}\p{N}]+/gu) ?? []
    )
      .slice(0, 12)
      .map((term) => `${term}*`),
    start: (page - 1) * CATALOG_PAGE_SIZE,
    end: page * CATALOG_PAGE_SIZE,
  };
}
async function loadCatalogListing(
  searchParams: URLSearchParams,
  defaultCategory = "",
  collection = "",
) {
  const navigation = await getCatalogNavigation();
  const selectedCollection = navigation.collections.some(
    (item) => item.slug === collection,
  )
    ? collection
    : "";
  const read = isSanityConfigured ? await getReader() : undefined;
  const demoProducts = read
    ? []
    : demoCatalog().products.filter(
        (product) =>
          !selectedCollection ||
          product.collectionSlugs.includes(selectedCollection),
      );
  const facetResult = read
    ? await read(
        queries.catalogFacetsQuery,
        { collection: selectedCollection },
        (raw, previous?: CatalogFacet[]) =>
          decodeDocuments(facetSchema, raw, "catalog facets", previous),
      )
    : {
        value: demoFacets(demoProducts, navigation.categories),
        degraded: false,
      };
  const params = new URLSearchParams(searchParams);
  if (!params.has("category") && defaultCategory)
    params.set("category", defaultCategory);
  const filters = parseCatalogSearchParams(params, {
    categorySlugs: navigation.categories.map((category) => category.slug),
    categoryKinds: Object.fromEntries(
      navigation.categories.map((category) => [
        category.slug,
        getCategoryKind(category),
      ]),
    ),
    deitySlugs: facetResult.value.flatMap((facet) =>
      facet.deities.map((deity) => deity.slug),
    ),
  });
  const availability = getFacetAvailability(
    facetResult.value,
    filters.category,
  );
  if (filters.purity && !availability.purities.has(filters.purity))
    filters.purity = "";
  if (
    filters.idolConstruction &&
    !availability.idolConstructions.has(filters.idolConstruction)
  )
    filters.idolConstruction = "";
  if (filters.deitySlug && !availability.deities.has(filters.deitySlug))
    filters.deitySlug = "";
  if (filters.coinShape && !availability.coinShapes.has(filters.coinShape))
    filters.coinShape = "";
  if (
    filters.utensilType &&
    !availability.utensilTypes.has(filters.utensilType)
  )
    filters.utensilType = "";
  let page = Math.max(
    1,
    Math.min(100_000, Math.floor(Number(params.get("page")) || 1)),
  );
  let products: Product[];
  let total: number;
  let degraded = navigation.degraded || Boolean(facetResult.degraded);
  if (read) {
    const fetchPage = (pageNumber: number) =>
      read(
        queries.productPageQuery,
        getListingParams(filters, pageNumber, selectedCollection),
        (raw, previous?: { products: Product[]; total: number }) => {
          const envelope = pageEnvelope.parse(raw);
          const decoded = decodeDocuments(
            productSchema,
            envelope.products,
            "product",
            previous?.products,
          );
          return {
            value: { products: decoded.value, total: envelope.total },
            degraded: decoded.degraded,
          };
        },
      );
    let result = await fetchPage(page);
    const lastPage = Math.max(
      1,
      Math.ceil(result.value.total / CATALOG_PAGE_SIZE),
    );
    if (page > lastPage) {
      page = lastPage;
      result = await fetchPage(page);
    }
    products = result.value.products.map(productImageSeo);
    total = result.value.total;
    degraded ||= Boolean(result.degraded);
  } else {
    const matching = filterProducts(demoProducts, filters);
    total = matching.length;
    page = Math.min(page, Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE)));
    products = matching.slice(
      (page - 1) * CATALOG_PAGE_SIZE,
      page * CATALOG_PAGE_SIZE,
    );
  }
  const result: CatalogPage = {
    products,
    total,
    page,
    pageSize: CATALOG_PAGE_SIZE,
    facets: facetResult.value,
    degraded,
  };
  return { ...navigation, filters, result };
}

const cachedCatalogListing = cache((search: string, defaultCategory: string, collection: string) => loadCatalogListing(new URLSearchParams(search), defaultCategory, collection));
export function getCatalogListing(searchParams: URLSearchParams, defaultCategory = "", collection = "") {
  return cachedCatalogListing(searchParams.toString(), defaultCategory, collection);
}

const sitemapProductSchema = z.object({
  _id: z.string(),
  title: z.string().min(1).max(catalogLimits.title),
  reference: z
    .string()
    .nullish()
    .transform((value) => value ?? undefined),
  slug: catalogSlugSchema,
  images: z.array(catalogImageSchema).min(1).max(catalogLimits.gallery),
  categorySlug: catalogSlugSchema,
  collectionSlugs: z.array(catalogSlugSchema),
  updatedAt: z.string().datetime({ offset: true }),
});
export const getSitemapCatalog = cache(async () => {
  if (!isSanityConfigured) return demoCatalog();
  const [products, navigation] = await Promise.all([
    readAllDocuments(
      publishedReader,
      queries.sitemapProductsQuery,
      sitemapProductSchema,
      "sitemap product",
    ),
    readNavigation(publishedReader),
  ]);
  return {
    products: products.value.map(productImageSeo),
    categories: navigation.categories,
    collections: navigation.collections,
  };
});

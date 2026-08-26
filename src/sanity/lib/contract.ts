import type {
  CategoriesQueryResult,
  CollectionsQueryResult,
  ProductsQueryResult,
  CatalogFacetsQueryResult,
} from "@/sanity/types";
import { z } from "zod";

import {
  catalogLimits,
  catalogSlugSchema,
  categoryKinds,
  coinShapes,
  dimensionSchema,
  displayOrderSchema,
  idolConstructions,
  productMaterials,
  productPurities,
  sizeVariantSchema,
  utensilTypes,
  weightSchema,
} from "@/lib/catalog-domain";
import { sanityDataset, sanityProjectId } from "@/sanity/env";

const nullable = <T extends z.ZodType>(schema: T) =>
  schema.nullish().transform((value) => value ?? undefined);
const identity = {
  _id: z.string().optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
};
const text = (max: number) => z.string().trim().min(1).max(max);
const slug = catalogSlugSchema;
const editorialSections = nullable(
  z
    .array(
      z.object({
        heading: text(100),
        body: text(1200),
      }),
    )
    .max(6),
);

export const catalogImageSchema = z.object({
  src: z
    .url()
    .refine((value) =>
      value.startsWith(
        `https://cdn.sanity.io/images/${sanityProjectId}/${sanityDataset}/`,
      ),
    ),
  // Legacy imports can omit alt; rendering supplies a descriptive fallback. New
  // documents must pass the stricter shared write contract.
  alt: z
    .string()
    .trim()
    .max(catalogLimits.alt)
    .nullish()
    .transform((value) => value ?? ""),
  width: z.number().int().positive().max(20_000),
  height: z.number().int().positive().max(20_000),
  objectPosition: z
    .enum(["left center", "right center", "center center"])
    .optional(),
});

export const categorySchema = z.object({
  ...identity,
  title: text(80),
  slug,
  description: text(240),
  editorialSections,
  image: catalogImageSchema,
  displayOrder: displayOrderSchema,
  productKind: nullable(z.enum(categoryKinds)),
  showOnHomepage: nullable(z.boolean()),
  homepageOrder: nullable(displayOrderSchema),
  homepageImageSource: nullable(z.enum(["category", "product"])),
  firstProductImage: nullable(catalogImageSchema),
  productCount: z.number().int().nonnegative().optional(),
} satisfies Record<keyof CategoriesQueryResult[number], z.ZodType>);
export const collectionSchema = z.object({
  ...identity,
  title: text(100),
  slug,
  description: text(320),
  editorialSections,
  heroImage: catalogImageSchema,
  productSlugs: z.array(slug),
  displayOrder: displayOrderSchema,
  productCount: z.number().int().nonnegative().optional(),
} satisfies Record<keyof CollectionsQueryResult[number], z.ZodType>);
const deitySchema = z.object({ title: text(80), slug });
export const productSchema = z.object({
  ...identity,
  title: text(catalogLimits.title),
  slug,
  shortDescription: text(catalogLimits.description),
  seoTitle: nullable(text(100)),
  images: z.array(catalogImageSchema).min(1).max(catalogLimits.gallery),
  categorySlug: slug,
  categoryKind: nullable(z.enum(categoryKinds)),
  collectionSlugs: z.array(slug).max(catalogLimits.collections),
  featured: z
    .boolean()
    .nullish()
    .transform((value) => value ?? false),
  displayOrder: displayOrderSchema,
  reference: nullable(text(catalogLimits.reference)),
  material: nullable(z.enum(productMaterials)),
  purity: nullable(z.enum(productPurities)),
  weightGrams: nullable(weightSchema),
  heightInches: nullable(dimensionSchema),
  widthInches: nullable(dimensionSchema),
  depthInches: nullable(dimensionSchema),
  diameterInches: nullable(dimensionSchema),
  singhasanWidthInches: nullable(dimensionSchema),
  singhasanDepthInches: nullable(dimensionSchema),
  sizeVariants: z.array(sizeVariantSchema).max(catalogLimits.variants),
  utensilType: nullable(z.enum(utensilTypes)),
  idolConstruction: nullable(z.enum(idolConstructions)),
  deities: z.array(deitySchema).max(catalogLimits.deities),
  coinShape: nullable(z.enum(coinShapes)),
} satisfies Record<keyof ProductsQueryResult[number], z.ZodType>);

export const facetSchema = z.object({
  categorySlug: slug,
  productCount: z.number().int().nonnegative(),
  purities: z.array(z.enum(productPurities)),
  idolConstructions: z.array(z.enum(idolConstructions)),
  deities: z.array(deitySchema),
  coinShapes: z.array(z.enum(coinShapes)),
  utensilTypes: z.array(z.enum(utensilTypes)),
} satisfies Record<keyof CatalogFacetsQueryResult[number], z.ZodType>);

export type Decoded<T> = { value: T; degraded?: boolean };

function documentKey(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return;
  const item = value as {
    _id?: unknown;
    slug?: unknown;
    categorySlug?: unknown;
  };
  return [item._id, item.slug, item.categorySlug].find(
    (key): key is string => typeof key === "string",
  );
}

export function decodeDocuments<T>(
  schema: z.ZodType<T>,
  raw: unknown,
  type: string,
  previous: T[] = [],
): Decoded<T[]> {
  if (!Array.isArray(raw))
    throw new Error(`Invalid ${type} response: expected an array.`);
  const previousById = new Map(
    previous.map((item) => [documentKey(item), item]),
  );
  const seen = new Set<string>();
  let degraded = false;
  const value: T[] = [];
  for (const document of raw) {
    const parsed = schema.safeParse(document);
    const key = documentKey(document);
    let item: T | undefined;
    if (!parsed.success) {
      degraded = true;
      console.error("Sanity document failed validation", {
        type,
        document: key ?? "unknown",
        issueCount: parsed.error.issues.length,
        issues: parsed.error.issues
          .slice(0, 10)
          .map(({ path, code, message }) => ({
            field: path.join("."),
            code,
            message,
          })),
      });
      item = key ? previousById.get(key) : undefined;
    } else item = parsed.data;
    if (item !== undefined) {
      const publicKey = (item as { slug?: string }).slug ?? key;
      if (publicKey && seen.has(publicKey)) {
        degraded = true;
        console.error("Sanity duplicate document key", {
          type,
          document: key,
          slug: publicKey,
        });
        continue;
      }
      if (publicKey) seen.add(publicKey);
      value.push(item);
    }
  }
  return { value, degraded };
}

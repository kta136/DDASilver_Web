import { z } from "zod";

// Shared by Studio, import commands, URL filters and the read boundary.
export const catalogLimits = {
  title: 100,
  description: 240,
  alt: 180,
  slug: 96,
  reference: 60,
  gallery: 20,
  displayOrder: 100_000,
  weight: 100_000,
  dimension: 1_000,
  variants: 20,
  deities: 50,
  collections: 100,
} as const;

export const productMaterials = ["silver", "gold"] as const;
export const productPurities = ["91.60", "92.5", "99.50", "99.80"] as const;
export const idolConstructions = ["hollow", "solid", "semi-solid"] as const;
export const coinShapes = [
  "round",
  "oval",
  "square",
  "rectangle",
  "scalloped",
] as const;
export const utensilTypes = [
  "glass",
  "bowl",
  "plate",
  "jug",
  "kalash",
  "bottle",
  "spoon",
  "pooja-thali-set",
] as const;
export const categoryKinds = [
  "general",
  "coin",
  "gold",
  "idol",
  "utensil",
  "purse",
  "jhula",
] as const;
export type CategoryKind = (typeof categoryKinds)[number];

// Compatibility for existing categories. New categories store their kind explicitly;
// names, slugs and document IDs are otherwise free to change.
const legacyCategoryKinds: Record<string, CategoryKind> = {
  coin: "coin",
  gold: "gold",
  idols: "idol",
  utensils: "utensil",
  purse: "purse",
  jhula: "jhula",
};

export function getCategoryKind(category?: {
  productKind?: CategoryKind;
  slug?: string | { current?: string };
}): CategoryKind {
  const slug =
    typeof category?.slug === "string"
      ? category.slug
      : category?.slug?.current;
  return category?.productKind ?? legacyCategoryKinds[slug ?? ""] ?? "general";
}

export const catalogSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(catalogLimits.slug)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const displayOrderSchema = z
  .number()
  .int()
  .min(0)
  .max(catalogLimits.displayOrder);
export const weightSchema = z.number().positive().max(catalogLimits.weight);
export const dimensionSchema = z
  .number()
  .positive()
  .max(catalogLimits.dimension);
export const sizeVariantSchema = z.object({
  weightGrams: weightSchema,
  diameterInches: dimensionSchema,
});
export const productMeasurements = {
  weightGrams: weightSchema.optional(),
  heightInches: dimensionSchema.optional(),
  widthInches: dimensionSchema.optional(),
  depthInches: dimensionSchema.optional(),
  diameterInches: dimensionSchema.optional(),
  singhasanWidthInches: dimensionSchema.optional(),
  singhasanDepthInches: dimensionSchema.optional(),
  sizeVariants: z
    .array(sizeVariantSchema)
    .max(catalogLimits.variants)
    .optional(),
};

const referenceSchema = z.object({
  _type: z.literal("reference"),
  _ref: z.string().min(1),
});
export const productDocumentSchema = z.object({
  _id: z.string().min(1),
  _type: z.literal("product"),
  title: z.string().trim().min(1).max(catalogLimits.title),
  slug: z.object({ current: catalogSlugSchema }),
  shortDescription: z.string().trim().min(1).max(catalogLimits.description),
  seoTitle: z.string().trim().min(1).max(100).optional(),
  gallery: z
    .array(
      z.object({
        _key: z.string().min(1),
        _type: z.literal("image"),
        asset: referenceSchema,
        alt: z.string().trim().min(12).max(catalogLimits.alt),
      }),
    )
    .min(1)
    .max(catalogLimits.gallery),
  category: referenceSchema,
  collections: z
    .array(referenceSchema)
    .max(catalogLimits.collections)
    .optional(),
  featured: z.boolean(),
  displayOrder: displayOrderSchema,
  reference: z.string().trim().min(1).max(catalogLimits.reference).optional(),
  material: z.enum(productMaterials).optional(),
  purity: z.enum(productPurities),
  utensilType: z.enum(utensilTypes).optional(),
  idolConstruction: z.enum(idolConstructions).optional(),
  coinShape: z.enum(coinShapes).optional(),
  deities: z.array(referenceSchema).max(catalogLimits.deities).optional(),
  ...productMeasurements,
});

export const galleryManifestProductSchema = productDocumentSchema
  .pick({
    title: true,
    shortDescription: true,
    reference: true,
    material: true,
    purity: true,
    utensilType: true,
    idolConstruction: true,
    coinShape: true,
    weightGrams: true,
    heightInches: true,
    widthInches: true,
    depthInches: true,
    diameterInches: true,
    singhasanWidthInches: true,
    singhasanDepthInches: true,
    sizeVariants: true,
  })
  .extend({
    id: z.string().min(1),
    slug: catalogSlugSchema,
    alt: z.string().trim().min(12).max(catalogLimits.alt),
  });

type ProductAttributes = Partial<z.infer<typeof productDocumentSchema>>;
export function getProductAttributeIssues(
  product: ProductAttributes,
  kind: CategoryKind,
) {
  const issues: { field: string; message: string }[] = [];
  const check = (condition: boolean, field: string, message: string) => {
    if (!condition) issues.push({ field, message });
  };
  check(
    kind === "gold" ? product.material === "gold" : product.material !== "gold",
    "material",
    "Gold material requires a category with Gold product fields.",
  );
  check(
    kind === "utensil" ? Boolean(product.utensilType) : !product.utensilType,
    "utensilType",
    "Choose an item type only for a category with Utensil product fields.",
  );
  check(
    kind === "idol"
      ? Boolean(product.idolConstruction)
      : !product.idolConstruction,
    "idolConstruction",
    "Choose construction only for a category with Idol product fields.",
  );
  check(
    kind === "idol"
      ? Boolean(product.deities?.length)
      : !product.deities?.length,
    "deities",
    "Choose deities only for a category with Idol product fields.",
  );
  check(
    kind === "coin" || kind === "gold"
      ? Boolean(product.coinShape)
      : !product.coinShape,
    "coinShape",
    "Choose a shape only for a category with Coin or Gold product fields.",
  );
  if (kind === "purse")
    check(
      Boolean(product.weightGrams),
      "weightGrams",
      "Enter the verified purse weight.",
    );
  const hasWidth = product.singhasanWidthInches !== undefined;
  const hasDepth = product.singhasanDepthInches !== undefined;
  check(
    hasWidth === hasDepth && (!(hasWidth || hasDepth) || kind === "jhula"),
    "singhasanWidthInches",
    "Enter both singhasan dimensions, and only for Jhula product fields.",
  );
  return issues;
}

export function assertProductDocument(
  document: unknown,
  kind?: CategoryKind,
): void {
  const parsed = productDocumentSchema.parse(document);
  const issues = kind ? getProductAttributeIssues(parsed, kind) : [];
  if (
    new Set(parsed.gallery.map((image) => image._key)).size !==
    parsed.gallery.length
  ) {
    issues.push({ field: "gallery", message: "Gallery keys must be unique." });
  }
  if (issues.length)
    throw new Error(
      `${parsed._id}: ${issues.map(({ field, message }) => `${field}: ${message}`).join("; ")}`,
    );
}

// Runtime-safe catalog constants and taxonomy helpers. Keep this module free of
// validation libraries because it is imported by the client-side catalog.
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

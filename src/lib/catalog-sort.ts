import type { Product } from "@/types/catalog";

export const catalogSortValues = [
  "price-asc",
  "price-desc",
  "weight-asc",
  "weight-desc",
] as const;

export type CatalogSort = (typeof catalogSortValues)[number];
export type CatalogSortState = CatalogSort | "";

function productWeight(product: Product) {
  const variantWeights = product.sizeVariants?.map((variant) => variant.weightGrams);
  if (variantWeights?.length) return Math.min(...variantWeights);
  return product.weightGrams ?? null;
}

function productPrice(product: Product) {
  return product.estimate?.status === "available"
    ? product.estimate.minimum
    : null;
}

function compareDisplayOrder(first: Product, second: Product) {
  return first.displayOrder - second.displayOrder;
}

export function sortCatalogProducts(
  products: Product[],
  sort: CatalogSortState,
) {
  if (!sort) return products.toSorted(compareDisplayOrder);

  const descending = sort.endsWith("desc");
  const key = sort.startsWith("price-") ? productPrice : productWeight;

  return products.toSorted((first, second) => {
    const firstValue = key(first);
    const secondValue = key(second);

    if (firstValue === null && secondValue !== null) return 1;
    if (firstValue !== null && secondValue === null) return -1;
    if (firstValue !== null && secondValue !== null && firstValue !== secondValue)
      return (firstValue - secondValue) * (descending ? -1 : 1);

    return compareDisplayOrder(first, second);
  });
}

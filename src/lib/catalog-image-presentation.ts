import type { Product } from "@/types/catalog";

type ProductImagePresentation = Pick<
  Product,
  "categorySlug" | "coinShape"
>;

export function shouldContainProductImage(
  product: ProductImagePresentation,
  compactImage = false,
) {
  return (
    product.categorySlug === "jhula" ||
    product.categorySlug === "purse" ||
    (Boolean(product.coinShape) && !compactImage)
  );
}

export function shouldUseSquareProductCardImage(
  product: Pick<Product, "categorySlug">,
) {
  return product.categorySlug === "jhula";
}

import { getCategoryKind } from "@/lib/catalog-domain";
import type { Product } from "@/types/catalog";

type ProductImagePresentation = Pick<
  Product,
  "categorySlug" | "categoryKind" | "coinShape"
>;

export function shouldContainProductImage(
  product: ProductImagePresentation,
  compactImage = false,
) {
  const kind = getCategoryKind({
    slug: product.categorySlug,
    productKind: product.categoryKind,
  });
  return (
    kind === "jhula" ||
    kind === "purse" ||
    (Boolean(product.coinShape) && !compactImage)
  );
}

export function shouldUseSquareProductCardImage(
  product: Pick<Product, "categorySlug" | "categoryKind">,
) {
  return (
    getCategoryKind({
      slug: product.categorySlug,
      productKind: product.categoryKind,
    }) === "jhula"
  );
}

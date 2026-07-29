import type {
  CoinShape,
  IdolConstruction,
  Product,
  ProductPurity,
} from "@/types/catalog";

export type CatalogFilters = {
  query?: string;
  category?: string;
  collection?: string;
  purity?: ProductPurity | "";
  idolConstruction?: IdolConstruction | "";
  coinShape?: CoinShape | "";
};

export function filterProducts(
  products: Product[],
  filters: CatalogFilters,
) {
  const query = filters.query?.trim().toLocaleLowerCase("en-IN");
  const queryTerms = query?.split(/\s+/).filter(Boolean) ?? [];

  return products
    .filter((product) => {
      if (filters.category && product.categorySlug !== filters.category) {
        return false;
      }

      if (
        filters.collection &&
        !product.collectionSlugs.includes(filters.collection)
      ) {
        return false;
      }

      if (filters.purity && product.purity !== filters.purity) {
        return false;
      }

      if (
        filters.idolConstruction &&
        product.idolConstruction !== filters.idolConstruction
      ) {
        return false;
      }

      if (filters.coinShape && product.coinShape !== filters.coinShape) {
        return false;
      }

      if (!query) {
        return true;
      }

      const words = `${product.title} ${product.shortDescription}`
        .toLocaleLowerCase("en-IN")
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean);

      return queryTerms.every((term) =>
        words.some((word) => word.startsWith(term)),
      );
    })
    .toSorted((a, b) => a.displayOrder - b.displayOrder);
}

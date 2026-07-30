import type {
  CoinShape,
  IdolConstruction,
  Product,
  ProductPurity,
} from "@/types/catalog";

export type CatalogFilters = {
  query?: string;
  category?: string;
  purity?: ProductPurity | "";
  idolConstruction?: IdolConstruction | "";
  deitySlug?: string;
  coinShape?: CoinShape | "";
};

export type CatalogFilterAvailability = {
  categorySlugs: ReadonlySet<string>;
  purities: ReadonlySet<ProductPurity>;
  idolConstructions: ReadonlySet<IdolConstruction>;
  deities: ReadonlyMap<string, string>;
  coinShapes: ReadonlySet<CoinShape>;
};

export function getCatalogFilterAvailability(
  products: Product[],
  category = "",
): CatalogFilterAvailability {
  const categorySlugs = new Set<string>();
  const purities = new Set<ProductPurity>();
  const idolConstructions = new Set<IdolConstruction>();
  const deities = new Map<string, string>();
  const coinShapes = new Set<CoinShape>();

  for (const product of products) {
    categorySlugs.add(product.categorySlug);

    if (category && product.categorySlug !== category) {
      continue;
    }

    if (product.purity) {
      purities.add(product.purity);
    }
    if (product.idolConstruction) {
      idolConstructions.add(product.idolConstruction);
    }
    for (const deity of product.deities) {
      deities.set(deity.slug, deity.title);
    }
    if (product.coinShape) {
      coinShapes.add(product.coinShape);
    }
  }

  return {
    categorySlugs,
    purities,
    idolConstructions,
    deities,
    coinShapes,
  };
}

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

      if (filters.purity && product.purity !== filters.purity) {
        return false;
      }

      if (
        filters.idolConstruction &&
        product.idolConstruction !== filters.idolConstruction
      ) {
        return false;
      }

      if (
        filters.deitySlug &&
        !product.deities.some((deity) => deity.slug === filters.deitySlug)
      ) {
        return false;
      }

      if (filters.coinShape && product.coinShape !== filters.coinShape) {
        return false;
      }

      if (!query) {
        return true;
      }

      const words =
        `${product.title} ${product.shortDescription} ${product.deities.map((deity) => deity.title).join(" ")}`
        .toLocaleLowerCase("en-IN")
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean);

      return queryTerms.every((term) =>
        words.some((word) => word.startsWith(term)),
      );
    })
    .toSorted((a, b) => a.displayOrder - b.displayOrder);
}

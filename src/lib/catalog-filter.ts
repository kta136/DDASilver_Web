import type {
  CatalogFacet,
  CoinShape,
  IdolConstruction,
  Product,
  ProductPurity,
  UtensilType,
} from "@/types/catalog";

export type CatalogFilters = {
  query?: string;
  category?: string;
  purity?: ProductPurity | "";
  idolConstruction?: IdolConstruction | "";
  deitySlug?: string;
  coinShape?: CoinShape | "";
  utensilType?: UtensilType | "";
};

export type CatalogFilterAvailability = {
  categorySlugs: ReadonlySet<string>;
  purities: ReadonlySet<ProductPurity>;
  idolConstructions: ReadonlySet<IdolConstruction>;
  deities: ReadonlyMap<string, string>;
  coinShapes: ReadonlySet<CoinShape>;
  utensilTypes: ReadonlySet<UtensilType>;
};

export function getFacetAvailability(
  facets: CatalogFacet[],
  category = "",
): CatalogFilterAvailability {
  const selected = facets.filter(
    (facet) => !category || facet.categorySlug === category,
  );
  return {
    categorySlugs: new Set(
      facets
        .filter((facet) => facet.productCount > 0)
        .map((facet) => facet.categorySlug),
    ),
    purities: new Set(selected.flatMap((facet) => facet.purities)),
    idolConstructions: new Set(
      selected.flatMap((facet) => facet.idolConstructions),
    ),
    deities: new Map(
      selected.flatMap((facet) =>
        facet.deities.map(({ slug, title }) => [slug, title] as const),
      ),
    ),
    coinShapes: new Set(selected.flatMap((facet) => facet.coinShapes)),
    utensilTypes: new Set(selected.flatMap((facet) => facet.utensilTypes)),
  };
}

export function getCatalogFilterAvailability(
  products: Product[],
  category = "",
): CatalogFilterAvailability {
  const categorySlugs = new Set<string>();
  const purities = new Set<ProductPurity>();
  const idolConstructions = new Set<IdolConstruction>();
  const deities = new Map<string, string>();
  const coinShapes = new Set<CoinShape>();
  const utensilTypes = new Set<UtensilType>();

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
    if (product.utensilType) {
      utensilTypes.add(product.utensilType);
    }
  }

  return {
    categorySlugs,
    purities,
    idolConstructions,
    deities,
    coinShapes,
    utensilTypes,
  };
}

export function filterProducts(products: Product[], filters: CatalogFilters) {
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

      if (filters.utensilType && product.utensilType !== filters.utensilType) {
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

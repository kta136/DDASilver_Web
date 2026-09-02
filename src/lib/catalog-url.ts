import type { CatalogFilters } from "@/lib/catalog-filter";
import {
  getCategoryKind,
  productPurities,
  idolConstructions as constructionValues,
  coinShapes as shapeValues,
  utensilTypes as utensilValues,
  type CategoryKind,
} from "@/lib/catalog-taxonomy";
import type {
  CoinShape,
  IdolConstruction,
  ProductPurity,
  UtensilType,
} from "@/types/catalog";

const purities = new Set<ProductPurity>(productPurities);
const idolConstructions = new Set<IdolConstruction>(constructionValues);
const coinShapes = new Set<CoinShape>(shapeValues);
const utensilTypes = new Set<UtensilType>(utensilValues);

export type CatalogUrlOptions = {
  categorySlugs: readonly string[];
  deitySlugs?: readonly string[];
  categoryKinds?: Record<string, CategoryKind>;
};

export type CatalogUrlState = {
  query: string;
  category: string;
  purity: ProductPurity | "";
  idolConstruction: IdolConstruction | "";
  deitySlug: string;
  coinShape: CoinShape | "";
  utensilType: UtensilType | "";
};

export function getCatalogPagePath(path: `/${string}`, page: number): `/${string}` {
  return page > 1 ? `${path}?page=${page}` : path;
}

function allowedValue<T extends string>(
  value: string | null,
  allowed: ReadonlySet<T>,
): T | "" {
  return value && allowed.has(value as T) ? (value as T) : "";
}

export function toCatalogSearchParams(
  values: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) params.set(key, first);
  }
  return params;
}

export function parseCatalogSearchParams(
  searchParams: Pick<URLSearchParams, "get">,
  options: CatalogUrlOptions,
): CatalogUrlState {
  const categorySlugs = new Set(options.categorySlugs);
  const deitySlugs = new Set(options.deitySlugs ?? []);
  const category = allowedValue(searchParams.get("category"), categorySlugs);
  const kind = getCategoryKind({
    slug: category,
    productKind: options.categoryKinds?.[category],
  });

  return {
    query: (searchParams.get("q") ?? "").trim().slice(0, 80),
    category,
    purity: allowedValue(searchParams.get("purity"), purities),
    idolConstruction:
      kind === "idol"
        ? allowedValue(searchParams.get("idol"), idolConstructions)
        : "",
    deitySlug:
      kind === "idol"
        ? allowedValue(searchParams.get("deity"), deitySlugs)
        : "",
    coinShape:
      kind === "coin" || kind === "gold"
        ? allowedValue(searchParams.get("shape"), coinShapes)
        : "",
    utensilType:
      kind === "utensil"
        ? allowedValue(searchParams.get("item"), utensilTypes)
        : "",
  };
}

export function serializeCatalogFilters(
  filters: CatalogFilters,
  current = new URLSearchParams(),
) {
  const next = new URLSearchParams(current);
  const entries = {
    q: filters.query?.trim().slice(0, 80) ?? "",
    category: filters.category ?? "",
    collection: "",
    purity: filters.purity ?? "",
    idol: filters.idolConstruction ?? "",
    deity: filters.deitySlug ?? "",
    shape: filters.coinShape ?? "",
    item: filters.utensilType ?? "",
  };

  for (const [key, value] of Object.entries(entries)) {
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
  }

  return next;
}

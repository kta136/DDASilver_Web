import type {
  CatalogFilters,
} from "@/lib/catalog-filter";
import type {
  CoinShape,
  IdolConstruction,
  ProductPurity,
} from "@/types/catalog";

const purities = new Set<ProductPurity>(["92.5", "99.80"]);
const idolConstructions = new Set<IdolConstruction>([
  "hollow",
  "solid",
  "semi-solid",
]);
const coinShapes = new Set<CoinShape>([
  "round",
  "oval",
  "square",
  "rectangle",
]);

export type CatalogUrlOptions = {
  categorySlugs: readonly string[];
};

export type CatalogUrlState = {
  query: string;
  category: string;
  purity: ProductPurity | "";
  idolConstruction: IdolConstruction | "";
  coinShape: CoinShape | "";
};

function allowedValue<T extends string>(
  value: string | null,
  allowed: ReadonlySet<T>,
): T | "" {
  return value && allowed.has(value as T) ? (value as T) : "";
}

export function parseCatalogSearchParams(
  searchParams: Pick<URLSearchParams, "get">,
  options: CatalogUrlOptions,
): CatalogUrlState {
  const categorySlugs = new Set(options.categorySlugs);
  const category = allowedValue(searchParams.get("category"), categorySlugs);

  return {
    query: (searchParams.get("q") ?? "").trim().slice(0, 80),
    category,
    purity: allowedValue(searchParams.get("purity"), purities),
    idolConstruction:
      category === "idols"
        ? allowedValue(searchParams.get("idol"), idolConstructions)
        : "",
    coinShape:
      category === "coin"
        ? allowedValue(searchParams.get("shape"), coinShapes)
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
    shape: filters.coinShape ?? "",
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

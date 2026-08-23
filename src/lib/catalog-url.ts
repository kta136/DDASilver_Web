import type {
  CatalogFilters,
} from "@/lib/catalog-filter";
import type {
  CoinShape,
  IdolConstruction,
  ProductPurity,
  UtensilType,
} from "@/types/catalog";

const purities = new Set<ProductPurity>([
  "91.60",
  "92.5",
  "99.50",
  "99.80",
]);
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
  "scalloped",
]);
const utensilTypes = new Set<UtensilType>([
  "glass",
  "bowl",
  "plate",
  "jug",
  "kalash",
  "bottle",
  "spoon",
  "pooja-thali-set",
]);

export type CatalogUrlOptions = {
  categorySlugs: readonly string[];
  deitySlugs?: readonly string[];
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
  const deitySlugs = new Set(options.deitySlugs ?? []);
  const category = allowedValue(searchParams.get("category"), categorySlugs);

  return {
    query: (searchParams.get("q") ?? "").trim().slice(0, 80),
    category,
    purity: allowedValue(searchParams.get("purity"), purities),
    idolConstruction:
      category === "idols"
        ? allowedValue(searchParams.get("idol"), idolConstructions)
        : "",
    deitySlug:
      category === "idols"
        ? allowedValue(searchParams.get("deity"), deitySlugs)
        : "",
    coinShape:
      category === "coin" || category === "gold"
        ? allowedValue(searchParams.get("shape"), coinShapes)
        : "",
    utensilType:
      category === "utensils"
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

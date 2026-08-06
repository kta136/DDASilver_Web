"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import clsx from "clsx";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ProductCard } from "@/components/catalog/product-card";
import {
  filterProducts,
  getCatalogFilterAvailability,
  type CatalogFilters,
} from "@/lib/catalog-filter";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import {
  coinShapeLabels,
  idolConstructionLabels,
  purityLabels,
  utensilTypeLabels,
} from "@/lib/catalog-labels";
import {
  parseCatalogSearchParams,
  serializeCatalogFilters,
  type CatalogUrlState,
} from "@/lib/catalog-url";
import type {
  Category,
  CoinShape,
  IdolConstruction,
  Product,
  ProductPurity,
  UtensilType,
} from "@/types/catalog";

const productPurityOptions = Object.entries(purityLabels) as [
  ProductPurity,
  string,
][];
const idolConstructionOptions = Object.entries(idolConstructionLabels) as [
  IdolConstruction,
  string,
][];
const coinShapeOptions = Object.entries(coinShapeLabels) as [
  CoinShape,
  string,
][];
const utensilTypeOptions = Object.entries(utensilTypeLabels) as [
  UtensilType,
  string,
][];

type CatalogBrowserProps = {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialFilters?: CatalogUrlState;
  syncUrl?: boolean;
};

export function CatalogBrowser({
  products,
  categories,
  initialCategory = "",
  initialFilters,
  syncUrl = false,
}: CatalogBrowserProps) {
  const [query, setQuery] = useState(initialFilters?.query ?? "");
  const [category, setCategory] = useState(
    initialFilters?.category ?? initialCategory,
  );
  const initialCategoryValue = initialFilters?.category ?? initialCategory;
  const [purity, setPurity] = useState<ProductPurity | "">(() => {
    const initialPurity = initialFilters?.purity ?? "";
    const availability = getCatalogFilterAvailability(
      products,
      initialCategoryValue,
    );
    return initialPurity && availability.purities.has(initialPurity)
      ? initialPurity
      : "";
  });
  const [idolConstruction, setIdolConstruction] =
    useState<IdolConstruction | "">(() => {
      const initialIdolConstruction =
        initialFilters?.idolConstruction ?? "";
      const availability = getCatalogFilterAvailability(
        products,
        initialCategoryValue,
      );
      return initialIdolConstruction &&
        availability.idolConstructions.has(initialIdolConstruction)
        ? initialIdolConstruction
        : "";
    });
  const [deitySlug, setDeitySlug] = useState(() => {
    const initialDeitySlug = initialFilters?.deitySlug ?? "";
    const availability = getCatalogFilterAvailability(
      products,
      initialCategoryValue,
    );
    return initialDeitySlug && availability.deities.has(initialDeitySlug)
      ? initialDeitySlug
      : "";
  });
  const [coinShape, setCoinShape] = useState<CoinShape | "">(() => {
    const initialCoinShape = initialFilters?.coinShape ?? "";
    const availability = getCatalogFilterAvailability(
      products,
      initialCategoryValue,
    );
    return initialCoinShape && availability.coinShapes.has(initialCoinShape)
      ? initialCoinShape
      : "";
  });
  const [utensilType, setUtensilType] = useState<UtensilType | "">(() => {
    const initialUtensilType = initialFilters?.utensilType ?? "";
    const availability = getCatalogFilterAvailability(
      products,
      initialCategoryValue,
    );
    return initialUtensilType &&
      availability.utensilTypes.has(initialUtensilType)
      ? initialUtensilType
      : "";
  });
  const deferredQuery = useDeferredValue(query);
  const filterAvailability = useMemo(
    () => getCatalogFilterAvailability(products, category),
    [products, category],
  );
  const availableCategories = useMemo(
    () =>
      categories.filter((item) =>
        filterAvailability.categorySlugs.has(item.slug),
      ),
    [categories, filterAvailability],
  );
  const urlOptions = useMemo(
    () => ({
      categorySlugs: availableCategories.map((item) => item.slug),
      deitySlugs: [
        ...new Set(
          products.flatMap((product) =>
            product.deities.map((deity) => deity.slug),
          ),
        ),
      ],
    }),
    [availableCategories, products],
  );
  const availablePurityOptions = productPurityOptions.filter(([value]) =>
    filterAvailability.purities.has(value),
  );
  const availableIdolConstructionOptions =
    idolConstructionOptions.filter(([value]) =>
      filterAvailability.idolConstructions.has(value),
    );
  const availableDeityOptions = [...filterAvailability.deities].toSorted(
    ([, firstTitle], [, secondTitle]) =>
      firstTitle.localeCompare(secondTitle, "en-IN"),
  );
  const availableCoinShapeOptions = coinShapeOptions.filter(([value]) =>
    filterAvailability.coinShapes.has(value),
  );
  const availableUtensilTypeOptions = utensilTypeOptions.filter(([value]) =>
    filterAvailability.utensilTypes.has(value),
  );
  const filterControlCount =
    2 +
    (availablePurityOptions.length > 0 ? 1 : 0) +
    (category === "idols" &&
    availableIdolConstructionOptions.length > 0
      ? 1
      : 0) +
    (category === "idols" && availableDeityOptions.length > 0 ? 1 : 0) +
    (category === "coin" && availableCoinShapeOptions.length > 0
      ? 1
      : 0) +
    (category === "utensils" && availableUtensilTypeOptions.length > 0
      ? 1
      : 0);

  const visibleProducts = useMemo(
    () =>
      filterProducts(products, {
        query: deferredQuery,
        category,
        purity,
        idolConstruction,
        deitySlug,
        coinShape,
        utensilType,
      }),
    [
      products,
      deferredQuery,
      category,
      purity,
      idolConstruction,
      deitySlug,
      coinShape,
      utensilType,
    ],
  );

  useEffect(() => {
    if (!syncUrl) {
      return;
    }

    const onPopState = () => {
      const next = parseCatalogSearchParams(
        new URLSearchParams(window.location.search),
        urlOptions,
      );
      const availability = getCatalogFilterAvailability(
        products,
        next.category,
      );
      setQuery(next.query);
      setCategory(next.category);
      setPurity(
        next.purity && availability.purities.has(next.purity)
          ? next.purity
          : "",
      );
      setIdolConstruction(
        next.idolConstruction &&
          availability.idolConstructions.has(next.idolConstruction)
          ? next.idolConstruction
          : "",
      );
      setDeitySlug(
        next.deitySlug && availability.deities.has(next.deitySlug)
          ? next.deitySlug
          : "",
      );
      setCoinShape(
        next.coinShape && availability.coinShapes.has(next.coinShape)
          ? next.coinShape
          : "",
      );
      setUtensilType(
        next.utensilType &&
          availability.utensilTypes.has(next.utensilType)
          ? next.utensilType
          : "",
      );
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [products, syncUrl, urlOptions]);

  useEffect(() => {
    if (!syncUrl) {
      return;
    }

    const filters: CatalogFilters = {
      query,
      category,
      purity,
      idolConstruction,
      deitySlug,
      coinShape,
      utensilType,
    };
    const next = serializeCatalogFilters(
      filters,
      new URLSearchParams(window.location.search),
    );
    const search = next.toString();
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [
    category,
    coinShape,
    deitySlug,
    idolConstruction,
    purity,
    query,
    syncUrl,
    utensilType,
  ]);

  function trackFilter(filterType: string, publicSlug: string) {
    trackAnalyticsEvent("catalog_filter", {
      filter_type: filterType,
      public_slug: publicSlug || "all",
    });
  }

  return (
    <div>
      <div
        className={clsx(
          "grid gap-3 border-y border-line py-5 md:grid-cols-2",
          filterControlCount === 5 &&
            "lg:grid-cols-3 xl:grid-cols-[minmax(14rem,1fr)_repeat(4,minmax(8.5rem,11rem))]",
          filterControlCount === 4 &&
            "lg:grid-cols-[minmax(16rem,1fr)_repeat(3,minmax(9rem,11rem))]",
          filterControlCount === 3 &&
            "lg:grid-cols-[minmax(16rem,1fr)_repeat(2,minmax(10rem,13rem))]",
          filterControlCount === 2 && "lg:grid-cols-2",
        )}
      >
        <label className="relative">
          <span className="sr-only">Search products</span>
          <MagnifyingGlassIcon
            size={20}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => {
              if (query.trim()) {
                trackAnalyticsEvent("catalog_search", {
                  query_length: query.trim().length,
                  result_count: visibleProducts.length,
                });
              }
            }}
            placeholder="Search designs"
            className="min-h-14 w-full rounded-full border border-line bg-white pr-5 pl-12 text-sm outline-none focus:border-copper"
          />
        </label>

        <label>
          <span className="sr-only">Filter by category</span>
          <select
            value={category}
            onChange={(event) => {
              const nextCategory = event.target.value;
              const nextAvailability = getCatalogFilterAvailability(
                products,
                nextCategory,
              );
              setCategory(nextCategory);
              setPurity((currentPurity) =>
                currentPurity &&
                !nextAvailability.purities.has(currentPurity)
                  ? ""
                  : currentPurity,
              );
              if (nextCategory !== "idols") {
                setIdolConstruction("");
                setDeitySlug("");
              }
              if (nextCategory !== "coin") {
                setCoinShape("");
              }
              if (nextCategory !== "utensils") {
                setUtensilType("");
              } else {
                setUtensilType((currentUtensilType) =>
                  currentUtensilType &&
                  !nextAvailability.utensilTypes.has(currentUtensilType)
                    ? ""
                    : currentUtensilType,
                );
              }
              trackFilter("category", nextCategory);
            }}
            className="min-h-14 w-full rounded-full border border-line bg-white px-5 text-sm outline-none focus:border-copper"
          >
            <option value="">All categories</option>
            {availableCategories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>

        {availablePurityOptions.length > 0 ? (
          <label>
            <span className="sr-only">Filter by purity</span>
            <select
              value={purity}
              onChange={(event) => {
                const nextPurity = event.target.value as ProductPurity | "";
                setPurity(nextPurity);
                trackFilter("purity", nextPurity);
              }}
              className="min-h-14 w-full rounded-full border border-line bg-white px-5 text-sm outline-none focus:border-copper"
            >
              <option value="">All purities</option>
              {availablePurityOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {category === "idols" &&
        availableIdolConstructionOptions.length > 0 ? (
          <label>
            <span className="sr-only">Filter by idol construction</span>
            <select
              value={idolConstruction}
              onChange={(event) => {
                const nextIdolConstruction = event.target
                  .value as IdolConstruction | "";
                setIdolConstruction(nextIdolConstruction);
                trackFilter("idol_construction", nextIdolConstruction);
              }}
              className="min-h-14 w-full rounded-full border border-line bg-white px-5 text-sm outline-none focus:border-copper"
            >
              <option value="">All constructions</option>
              {availableIdolConstructionOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {category === "idols" && availableDeityOptions.length > 0 ? (
          <label>
            <span className="sr-only">Filter by deity</span>
            <select
              value={deitySlug}
              onChange={(event) => {
                const nextDeitySlug = event.target.value;
                setDeitySlug(nextDeitySlug);
                trackFilter("deity", nextDeitySlug);
              }}
              className="min-h-14 w-full rounded-full border border-line bg-white px-5 text-sm outline-none focus:border-copper"
            >
              <option value="">All deities</option>
              {availableDeityOptions.map(([slug, title]) => (
                <option key={slug} value={slug}>
                  {title}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {category === "coin" && availableCoinShapeOptions.length > 0 ? (
          <label>
            <span className="sr-only">Filter by coin shape</span>
            <select
              value={coinShape}
              onChange={(event) => {
                const nextCoinShape = event.target.value as CoinShape | "";
                setCoinShape(nextCoinShape);
                trackFilter("coin_shape", nextCoinShape);
              }}
              className="min-h-14 w-full rounded-full border border-line bg-white px-5 text-sm outline-none focus:border-copper"
            >
              <option value="">All shapes</option>
              {availableCoinShapeOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {category === "utensils" &&
        availableUtensilTypeOptions.length > 0 ? (
          <label>
            <span className="sr-only">Filter by utensil item type</span>
            <select
              value={utensilType}
              onChange={(event) => {
                const nextUtensilType = event.target
                  .value as UtensilType | "";
                setUtensilType(nextUtensilType);
                trackFilter("utensil_type", nextUtensilType);
              }}
              className="min-h-14 w-full rounded-full border border-line bg-white px-5 text-sm outline-none focus:border-copper"
            >
              <option value="">All utensil items</option>
              {availableUtensilTypeOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-5">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {visibleProducts.length}{" "}
          {visibleProducts.length === 1 ? "design" : "designs"}
        </p>
        {query ||
        category ||
        purity ||
        idolConstruction ||
        deitySlug ||
        coinShape ||
        utensilType ? (
          <button
            type="button"
            className="text-sm font-semibold underline decoration-line-strong"
            onClick={() => {
              setQuery("");
              setCategory("");
              setPurity("");
              setIdolConstruction("");
              setDeitySlug("");
              setCoinShape("");
              setUtensilType("");
            }}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {visibleProducts.length > 0 ? (
        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              priority={index < 4}
              headingLevel={2}
              compactImage
            />
          ))}
        </div>
      ) : (
        <div className="mt-9 border-y border-line py-12 text-center">
          <h2 className="font-display text-4xl font-semibold">
            No designs match those filters.
          </h2>
          <p className="mt-3 text-ink-muted">
            Try a broader search or clear the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}

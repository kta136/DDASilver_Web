"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import clsx from "clsx";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCategoryKind } from "@/lib/catalog-taxonomy";
import { useCatalogPage } from "@/components/catalog/use-catalog-page";
import { ProductCard } from "@/components/catalog/product-card";
import {
  filterProducts,
  getCatalogFilterAvailability,
  getFacetAvailability,
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
  CatalogPage,
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
  initialPage?: CatalogPage;
  collectionSlug?: string;
};

export function CatalogBrowser({
  products,
  categories,
  initialCategory = "",
  initialFilters,
  syncUrl = false,
  initialPage,
  collectionSlug = "",
}: CatalogBrowserProps) {
  const getAvailability = useCallback(
    (selected = "") =>
      initialPage
        ? getFacetAvailability(initialPage.facets, selected)
        : getCatalogFilterAvailability(products, selected),
    [initialPage, products],
  );
  const [page, setPage] = useState(initialPage?.page ?? 1);
  const [query, setQuery] = useState(initialFilters?.query ?? "");
  const [category, setCategory] = useState(
    initialFilters?.category ?? initialCategory,
  );
  const initialCategoryValue = initialFilters?.category ?? initialCategory;
  const [purity, setPurity] = useState<ProductPurity | "">(() => {
    const initialPurity = initialFilters?.purity ?? "";
    const availability = getAvailability(initialCategoryValue);
    return initialPurity && availability.purities.has(initialPurity)
      ? initialPurity
      : "";
  });
  const [idolConstruction, setIdolConstruction] = useState<
    IdolConstruction | ""
  >(() => {
    const initialIdolConstruction = initialFilters?.idolConstruction ?? "";
    const availability = getAvailability(initialCategoryValue);
    return initialIdolConstruction &&
      availability.idolConstructions.has(initialIdolConstruction)
      ? initialIdolConstruction
      : "";
  });
  const [deitySlug, setDeitySlug] = useState(() => {
    const initialDeitySlug = initialFilters?.deitySlug ?? "";
    const availability = getAvailability(initialCategoryValue);
    return initialDeitySlug && availability.deities.has(initialDeitySlug)
      ? initialDeitySlug
      : "";
  });
  const [coinShape, setCoinShape] = useState<CoinShape | "">(() => {
    const initialCoinShape = initialFilters?.coinShape ?? "";
    const availability = getAvailability(initialCategoryValue);
    return initialCoinShape && availability.coinShapes.has(initialCoinShape)
      ? initialCoinShape
      : "";
  });
  const [utensilType, setUtensilType] = useState<UtensilType | "">(() => {
    const initialUtensilType = initialFilters?.utensilType ?? "";
    const availability = getAvailability(initialCategoryValue);
    return initialUtensilType &&
      availability.utensilTypes.has(initialUtensilType)
      ? initialUtensilType
      : "";
  });
  const deferredQuery = useDeferredValue(query);
  const filterAvailability = useMemo(
    () => getAvailability(category),
    [getAvailability, category],
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
      categoryKinds: Object.fromEntries(
        categories.map((item) => [item.slug, getCategoryKind(item)]),
      ),
      deitySlugs: [...getAvailability().deities.keys()],
    }),
    [availableCategories, categories, getAvailability],
  );
  const availablePurityOptions = productPurityOptions.filter(([value]) =>
    filterAvailability.purities.has(value),
  );
  const availableIdolConstructionOptions = idolConstructionOptions.filter(
    ([value]) => filterAvailability.idolConstructions.has(value),
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
  const categoryKind = getCategoryKind(
    categories.find((item) => item.slug === category) ?? { slug: category },
  );
  const isCoinOrGoldCategory =
    categoryKind === "coin" || categoryKind === "gold";
  const filterControlCount =
    2 +
    (availablePurityOptions.length > 0 ? 1 : 0) +
    (categoryKind === "idol" && availableIdolConstructionOptions.length > 0
      ? 1
      : 0) +
    (categoryKind === "idol" && availableDeityOptions.length > 0 ? 1 : 0) +
    (isCoinOrGoldCategory && availableCoinShapeOptions.length > 0 ? 1 : 0) +
    (categoryKind === "utensil" && availableUtensilTypeOptions.length > 0
      ? 1
      : 0);

  const localProducts = useMemo(
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

  const filters = {
    query,
    category,
    purity,
    idolConstruction,
    deitySlug,
    coinShape,
    utensilType,
  };
  const requestParams = serializeCatalogFilters(filters);
  requestParams.set("page", String(page));
  if (collectionSlug) requestParams.set("collection", collectionSlug);
  const remote = useCatalogPage(initialPage, requestParams.toString());
  const visibleProducts = initialPage
    ? (remote.result?.products ?? [])
    : localProducts;
  const total = initialPage
    ? (remote.result?.total ?? 0)
    : visibleProducts.length;
  const currentPage = remote.result?.page ?? page;
  const pageCount = initialPage
    ? Math.max(1, Math.ceil(total / initialPage.pageSize))
    : 1;

  function pageHref(nextPage: number) {
    const params = serializeCatalogFilters(filters);
    params.set("page", String(nextPage));
    if (initialCategory && !category) params.set("category", "");
    return `?${params}`;
  }

  useEffect(() => {
    if (!syncUrl) {
      return;
    }

    const onPopState = () => {
      const next = parseCatalogSearchParams(
        new URLSearchParams(window.location.search),
        urlOptions,
      );
      const availability = getAvailability(next.category);
      setPage(
        Math.max(
          1,
          Math.floor(
            Number(new URLSearchParams(window.location.search).get("page")) ||
              1,
          ),
        ),
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
        next.utensilType && availability.utensilTypes.has(next.utensilType)
          ? next.utensilType
          : "",
      );
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [getAvailability, syncUrl, urlOptions]);

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
    if (initialCategory && !category) next.set("category", "");
    if (page > 1) next.set("page", String(page));
    else next.delete("page");
    const search = next.toString();
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [
    initialCategory,
    page,
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
    <div aria-busy={remote.loading}>
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
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            onBlur={() => {
              if (query.trim()) {
                trackAnalyticsEvent("catalog_search", {
                  query_length: query.trim().length,
                  result_count: total,
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
              setPage(1);
              const nextCategory = event.target.value;
              const nextAvailability = getAvailability(nextCategory);
              const nextKind = getCategoryKind(
                categories.find((item) => item.slug === nextCategory) ?? {
                  slug: nextCategory,
                },
              );
              setCategory(nextCategory);
              setPurity((currentPurity) =>
                currentPurity && !nextAvailability.purities.has(currentPurity)
                  ? ""
                  : currentPurity,
              );
              if (nextKind !== "idol") {
                setIdolConstruction("");
                setDeitySlug("");
              }
              if (nextKind !== "coin" && nextKind !== "gold") {
                setCoinShape("");
              }
              if (nextKind !== "utensil") {
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
                setPage(1);
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

        {categoryKind === "idol" &&
        availableIdolConstructionOptions.length > 0 ? (
          <label>
            <span className="sr-only">Filter by idol construction</span>
            <select
              value={idolConstruction}
              onChange={(event) => {
                setPage(1);
                const nextIdolConstruction = event.target.value as
                  IdolConstruction | "";
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

        {categoryKind === "idol" && availableDeityOptions.length > 0 ? (
          <label>
            <span className="sr-only">Filter by deity</span>
            <select
              value={deitySlug}
              onChange={(event) => {
                setPage(1);
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

        {isCoinOrGoldCategory && availableCoinShapeOptions.length > 0 ? (
          <label>
            <span className="sr-only">Filter by coin or bar shape</span>
            <select
              value={coinShape}
              onChange={(event) => {
                setPage(1);
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

        {categoryKind === "utensil" &&
        availableUtensilTypeOptions.length > 0 ? (
          <label>
            <span className="sr-only">Filter by utensil item type</span>
            <select
              value={utensilType}
              onChange={(event) => {
                setPage(1);
                const nextUtensilType = event.target.value as UtensilType | "";
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
          {total} {total === 1 ? "design" : "designs"}
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
              setPage(1);
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

      {remote.loading ? (
        <p role="status" className="mt-4 text-sm text-ink-muted">
          Updating designs…
        </p>
      ) : null}
      {remote.error ? (
        <p role="alert" className="mt-4 text-sm">
          Could not update the gallery. Previous results are shown.{" "}
          <button type="button" onClick={remote.retry} className="underline">
            Try again
          </button>
        </p>
      ) : null}
      {remote.result?.degraded ? (
        <p role="status" className="mt-4 text-sm text-ink-muted">
          Some catalog information may be temporarily unavailable or out of
          date.
        </p>
      ) : null}
      {visibleProducts.length > 0 ? (
        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
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
      {pageCount > 1 ? (
        <nav
          aria-label="Product pagination"
          className="mt-10 flex items-center justify-center gap-6 border-t border-line pt-6"
        >
          {currentPage > 1 ? (
            <a
              href={pageHref(currentPage - 1)}
              onClick={(event) => {
                if (
                  event.ctrlKey ||
                  event.metaKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                window.history.pushState(null, "", pageHref(currentPage - 1));
                setPage(currentPage - 1);
              }}
              className="underline"
            >
              Previous
            </a>
          ) : null}
          <span>
            Page {currentPage} of {pageCount}
          </span>
          {currentPage < pageCount ? (
            <a
              href={pageHref(currentPage + 1)}
              onClick={(event) => {
                if (
                  event.ctrlKey ||
                  event.metaKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                window.history.pushState(null, "", pageHref(currentPage + 1));
                setPage(currentPage + 1);
              }}
              className="underline"
            >
              Next
            </a>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}

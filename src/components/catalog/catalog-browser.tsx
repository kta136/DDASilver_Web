"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import clsx from "clsx";
import { useDeferredValue, useMemo, useState } from "react";

import { ProductCard } from "@/components/catalog/product-card";
import { readConsent } from "@/components/consent/consent";
import { filterProducts } from "@/lib/catalog-filter";
import type {
  Category,
  CoinShape,
  Collection,
  IdolConstruction,
  Product,
  ProductPurity,
} from "@/types/catalog";

type CatalogBrowserProps = {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  initialCategory?: string;
  initialCollection?: string;
};

export function CatalogBrowser({
  products,
  categories,
  collections,
  initialCategory = "",
  initialCollection = "",
}: CatalogBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [collection, setCollection] = useState(initialCollection);
  const [purity, setPurity] = useState<ProductPurity | "">("");
  const [idolConstruction, setIdolConstruction] =
    useState<IdolConstruction | "">("");
  const [coinShape, setCoinShape] = useState<CoinShape | "">("");
  const deferredQuery = useDeferredValue(query);

  const visibleProducts = useMemo(
    () =>
      filterProducts(products, {
        query: deferredQuery,
        category,
        collection,
        purity,
        idolConstruction,
        coinShape,
      }),
    [
      products,
      deferredQuery,
      category,
      collection,
      purity,
      idolConstruction,
      coinShape,
    ],
  );

  function trackFilter(eventName: string) {
    if (readConsent()?.analytics && window.gtag) {
      window.gtag("event", eventName, {
        page_path: window.location.pathname,
      });
    }
  }

  return (
    <div>
      <div
        className={clsx(
          "grid gap-3 border-y border-line py-5 md:grid-cols-2",
          category === "idols" || category === "coin"
            ? "lg:grid-cols-[minmax(16rem,1fr)_repeat(4,minmax(9rem,11rem))]"
            : "lg:grid-cols-[minmax(16rem,1fr)_repeat(3,minmax(10rem,13rem))]",
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
                trackFilter("catalog_search");
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
              setCategory(nextCategory);
              if (nextCategory !== "idols") {
                setIdolConstruction("");
              }
              if (nextCategory !== "coin") {
                setCoinShape("");
              }
              trackFilter("catalog_category_filter");
            }}
            className="min-h-14 w-full rounded-full border border-line bg-white px-5 text-sm outline-none focus:border-copper"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Filter by purity</span>
          <select
            value={purity}
            onChange={(event) => {
              setPurity(event.target.value as ProductPurity | "");
              trackFilter("catalog_purity_filter");
            }}
            className="min-h-14 w-full rounded-full border border-line bg-white px-5 text-sm outline-none focus:border-copper"
          >
            <option value="">All purities</option>
            <option value="92.5">92.5%</option>
            <option value="99.80">99.80%</option>
          </select>
        </label>

        {category === "idols" ? (
          <label>
            <span className="sr-only">Filter by idol subcategory</span>
            <select
              value={idolConstruction}
              onChange={(event) => {
                setIdolConstruction(
                  event.target.value as IdolConstruction | "",
                );
                trackFilter("catalog_idol_subcategory_filter");
              }}
              className="min-h-14 w-full rounded-full border border-line bg-white px-5 text-sm outline-none focus:border-copper"
            >
              <option value="">All idol types</option>
              <option value="hollow">Hollow</option>
              <option value="solid">Solid</option>
              <option value="semi-solid">Semi Solid</option>
            </select>
          </label>
        ) : null}

        {category === "coin" ? (
          <label>
            <span className="sr-only">Filter by coin shape</span>
            <select
              value={coinShape}
              onChange={(event) => {
                setCoinShape(event.target.value as CoinShape | "");
                trackFilter("catalog_coin_shape_filter");
              }}
              className="min-h-14 w-full rounded-full border border-line bg-white px-5 text-sm outline-none focus:border-copper"
            >
              <option value="">All shapes</option>
              <option value="round">Round</option>
              <option value="oval">Oval</option>
              <option value="square">Square</option>
              <option value="rectangle">Rectangle</option>
            </select>
          </label>
        ) : null}

        <label>
          <span className="sr-only">Filter by collection</span>
          <select
            value={collection}
            onChange={(event) => {
              setCollection(event.target.value);
              trackFilter("catalog_collection_filter");
            }}
            className="min-h-14 w-full rounded-full border border-line bg-white px-5 text-sm outline-none focus:border-copper"
          >
            <option value="">All collections</option>
            {collections.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between gap-5">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {visibleProducts.length}{" "}
          {visibleProducts.length === 1 ? "design" : "designs"}
        </p>
        {query ||
        category ||
        collection ||
        purity ||
        idolConstruction ||
        coinShape ? (
          <button
            type="button"
            className="text-sm font-semibold underline decoration-line-strong"
            onClick={() => {
              setQuery("");
              setCategory("");
              setCollection("");
              setPurity("");
              setIdolConstruction("");
              setCoinShape("");
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

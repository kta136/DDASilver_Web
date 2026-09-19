import Link from "next/link";

import { CatalogNavigation } from "@/components/catalog/catalog-navigation";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { CatalogStructuredData } from "@/components/seo/catalog-structured-data";
import { getCatalogPagePath, toCatalogSearchParams } from "@/lib/catalog-url";
import { createPageMetadata } from "@/lib/seo";
import { getCatalogListing } from "@/sanity/lib/catalog";

const productsDescription =
  "Explore in-stock silver jewellery, coins, idols, gifts and utensils from DDA Silver in Agra. Browse the collection and enquire on WhatsApp.";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: ProductsPageProps) {
  const { result } = await getCatalogListing(
    toCatalogSearchParams(await searchParams),
  );
  return createPageMetadata({
    title: "Silver Products in Agra",
    description: productsDescription,
    path: getCatalogPagePath("/products", result.page),
  });
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const {
    result,
    filters: initialFilters,
    categories,
    collections,
  } = await getCatalogListing(toCatalogSearchParams(await searchParams));
  const products = result.products;
  const populatedCategories = categories.filter(
    (category) => (category.productCount ?? 0) > 0,
  );
  const populatedCollections = collections.filter(
    (collection) =>
      (collection.productCount ?? collection.productSlugs.length) > 0,
  );

  return (
    <main id="main-content" className="section-shell catalog-page">
      <CatalogStructuredData
        name="Silver products in Agra"
        description={productsDescription}
        path={getCatalogPagePath("/products", result.page)}
        products={products}
        total={result.total}
        offset={(result.page - 1) * result.pageSize}
      />
      <div className="site-container">
        <p className="eyebrow">Digital showroom</p>
        <div className="catalog-heading">
          <h1 className="font-display text-balance text-5xl leading-tight sm:text-6xl">
            The silver collection.
          </h1>
          <p className="text-base leading-8 text-ink-muted">
            Search and filter the showroom catalog. Prices and inventory are
            confirmed directly by the DDA Silver team.
          </p>
        </div>
        <div className="catalog-layout">
          <CatalogNavigation>
            <nav
              aria-label="Browse the silver catalog"
              className="catalog-taxonomy"
            >
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                  Browse by category
                </h2>
                <ul className="mt-4 grid gap-3">
                  {populatedCategories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/category/${category.slug}`}
                        className="text-sm font-semibold no-underline underline-offset-4 hover:underline"
                      >
                        {category.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {populatedCollections.length > 0 ? (
                <div>
                  <h2 className="min-h-4 text-xs font-bold leading-4 uppercase tracking-[0.16em] text-ink-muted">
                    Browse curated collections
                  </h2>
                  <ul className="mt-4 grid gap-3">
                    {populatedCollections.map((collection) => (
                      <li key={collection.slug}>
                        <Link
                          href={`/collections/${collection.slug}`}
                          className="text-sm font-semibold no-underline underline-offset-4 hover:underline"
                        >
                          {collection.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </nav>
          </CatalogNavigation>
          <div className="min-w-0">
            <CatalogBrowser
              products={products}
              categories={populatedCategories}
              initialFilters={initialFilters}
              initialPage={result}
              syncUrl
            />
          </div>
        </div>
      </div>
    </main>
  );
}

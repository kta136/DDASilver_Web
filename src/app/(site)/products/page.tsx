import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { parseCatalogSearchParams } from "@/lib/catalog-url";
import { getPopulatedCategories } from "@/lib/catalog-seo";
import { createPageMetadata } from "@/lib/seo";
import { getCatalog } from "@/sanity/lib/catalog";

export const metadata = createPageMetadata({
  title: "Silver Products in Agra",
  description:
    "Explore silver jewellery, coins, idols, gifts and utensils from DDA Silver in Agra. Browse the collection and enquire on WhatsApp for availability.",
  path: "/products",
});

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { products, categories } = await getCatalog();
  const populatedCategories = getPopulatedCategories(categories, products);
  const rawSearchParams = await searchParams;
  const normalizedSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(rawSearchParams)) {
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (firstValue) {
      normalizedSearchParams.set(key, firstValue);
    }
  }
  const initialFilters = parseCatalogSearchParams(normalizedSearchParams, {
    categorySlugs: [
      ...new Set(products.map((product) => product.categorySlug)),
    ],
    deitySlugs: [
      ...new Set(
        products.flatMap((product) =>
          product.deities.map((deity) => deity.slug),
        ),
      ),
    ],
  });

  return (
    <main id="main-content" className="section-shell">
      <div className="site-container">
        <p className="eyebrow">Digital showroom</p>
        <div className="mt-4 grid gap-7 lg:grid-cols-[1fr_28rem] lg:items-end">
          <h1 className="font-display text-balance text-6xl font-semibold leading-[0.9] sm:text-8xl">
            Explore silver,
            <br />
            your way.
          </h1>
          <p className="text-base leading-8 text-ink-muted">
            Search and filter the showroom catalog. Prices and inventory are
            confirmed directly by the DDA Silver team.
          </p>
        </div>
        <div className="mt-9">
          <CatalogBrowser
            products={products}
            categories={populatedCategories}
            initialFilters={initialFilters}
            syncUrl
          />
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";

import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { getCatalog } from "@/sanity/lib/catalog";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse DDA Silver jewellery, coins, pooja pieces, gifts, and homeware. Enquire on WhatsApp to confirm availability.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const { products, categories, collections } = await getCatalog();

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
            categories={categories}
            collections={collections}
          />
        </div>
      </div>
    </main>
  );
}

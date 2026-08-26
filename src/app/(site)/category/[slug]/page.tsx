import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { CatalogStructuredData } from "@/components/seo/catalog-structured-data";
import { getCatalogPagePath, toCatalogSearchParams } from "@/lib/catalog-url";
import { createPageMetadata } from "@/lib/seo";
import { getCatalogListing, getCategory } from "@/sanity/lib/catalog";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const [category, listing] = await Promise.all([
    getCategory(slug),
    searchParams.then((values) => getCatalogListing(toCatalogSearchParams(values), slug, "")),
  ]);
  const hasPublishedProducts = (category?.productCount ?? 0) > 0;

  return category
    ? createPageMetadata({
        title: `Silver ${category.title} in Agra`,
        description: `Explore ${category.title.toLowerCase()} at DDA Silver in Agra. ${category.description}`,
        path: getCatalogPagePath(`/category/${category.slug}`, listing.result.page),
        image: category.image,
        noIndex: !hasPublishedProducts,
        noFollow: false,
      })
    : createPageMetadata({
        title: "Category Not Found",
        description:
          "The requested DDA Silver product category could not be found.",
        path: `/category/${slug}`,
        canonical: false,
        noIndex: true,
      });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const [category, listing] = await Promise.all([
    getCategory(slug),
    searchParams.then((values) =>
      getCatalogListing(toCatalogSearchParams(values), slug),
    ),
  ]);

  if (!category) {
    notFound();
  }

  const populatedCategories = listing.categories.filter(
    (item) => (item.productCount ?? 0) > 0,
  );
  const categoryProducts = listing.result.products;
  const categoryDescription = `Explore ${category.title.toLowerCase()} at DDA Silver in Agra. ${category.description}`;

  return (
    <main id="main-content" className="pt-6 pb-12 sm:pt-8 sm:pb-14 lg:pt-9">
      <CatalogStructuredData
        name={`Silver ${category.title} in Agra`}
        description={categoryDescription}
        path={getCatalogPagePath(`/category/${category.slug}`, listing.result.page)}
        total={listing.result.total}
        offset={(listing.result.page - 1) * listing.result.pageSize}
        products={categoryProducts}
      />
      <div className="site-container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: category.title },
          ]}
        />
        <header className="mt-6 grid gap-4 border-l-2 border-copper pl-5 sm:mt-7 sm:pl-7 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,34rem)] lg:items-end lg:gap-12">
          <div>
            <p className="eyebrow">Category</p>
            <h1 className="font-display mt-2 text-5xl font-semibold leading-[0.88] sm:text-6xl lg:text-7xl">
              {category.title}
            </h1>
          </div>
          <p className="max-w-[34rem] text-sm leading-7 text-ink-muted sm:text-base lg:justify-self-end">
            {category.description}
          </p>
        </header>
        <div className="mt-7">
          <CatalogBrowser
            products={listing.result.products}
            categories={populatedCategories}
            initialCategory={category.slug}
            initialFilters={listing.filters}
            initialPage={listing.result}
            syncUrl
          />
        </div>
      </div>
    </main>
  );
}

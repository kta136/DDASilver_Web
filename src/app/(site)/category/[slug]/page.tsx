import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { getPopulatedCategories } from "@/lib/catalog-seo";
import { createPageMetadata } from "@/lib/seo";
import {
  getCatalog,
  getCategory,
  getPublishedCatalog,
} from "@/sanity/lib/catalog";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { categories } = await getPublishedCatalog();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const category = catalog.categories.find((item) => item.slug === slug);
  const hasPublishedProducts = catalog.products.some(
    (product) => product.categorySlug === slug,
  );

  return category
    ? createPageMetadata({
        title: `Explore ${category.title} in Agra`,
        description: `Explore ${category.title.toLowerCase()} at DDA Silver in Agra. ${category.description}`,
        path: `/category/${category.slug}`,
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, catalog] = await Promise.all([
    getCategory(slug),
    getCatalog(),
  ]);

  if (!category) {
    notFound();
  }

  const populatedCategories = getPopulatedCategories(
    catalog.categories,
    catalog.products,
  );

  return (
    <main id="main-content" className="pt-6 pb-12 sm:pt-8 sm:pb-14 lg:pt-9">
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
            products={catalog.products}
            categories={populatedCategories}
            initialCategory={category.slug}
          />
        </div>
      </div>
    </main>
  );
}

import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
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
  const category = await getCategory(slug);

  return category
    ? createPageMetadata({
        title: `Explore ${category.title} in Agra`,
        description: `Explore ${category.title.toLowerCase()} at DDA Silver in Agra. ${category.description}`,
        path: `/category/${category.slug}`,
        image: category.image,
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

  return (
    <main id="main-content" className="section-shell">
      <div className="site-container">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: category.title },
          ]}
        />
        <p className="eyebrow mt-8">Category</p>
        <div className="mt-4 grid gap-7 lg:grid-cols-[1fr_28rem] lg:items-end">
          <h1 className="font-display text-7xl font-semibold leading-[0.9] sm:text-8xl">
            {category.title}
          </h1>
          <p className="text-base leading-8 text-ink-muted">
            {category.description}
          </p>
        </div>
        <div className="mt-9">
          <CatalogBrowser
            products={catalog.products}
            categories={catalog.categories}
            initialCategory={category.slug}
          />
        </div>
      </div>
    </main>
  );
}

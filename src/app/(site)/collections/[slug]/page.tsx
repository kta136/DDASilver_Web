import Image from "next/image";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { CatalogStructuredData } from "@/components/seo/catalog-structured-data";
import { getCatalogPagePath, toCatalogSearchParams } from "@/lib/catalog-url";
import { createPageMetadata } from "@/lib/seo";
import { getCatalogListing, getCollection } from "@/sanity/lib/catalog";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const [collection, listing] = await Promise.all([
    getCollection(slug),
    searchParams.then((values) => getCatalogListing(toCatalogSearchParams(values), "", slug)),
  ]);
  const hasPublishedProducts =
    (collection?.productCount ?? collection?.productSlugs.length ?? 0) > 0;

  return collection
    ? createPageMetadata({
        title: `${collection.title} Silver Collection`,
        description: `Explore the ${collection.title} collection at DDA Silver in Agra. ${collection.description}`,
        path: getCatalogPagePath(`/collections/${collection.slug}`, listing.result.page),
        image: collection.heroImage,
        noIndex: !hasPublishedProducts,
        noFollow: false,
      })
    : createPageMetadata({
        title: "Collection Not Found",
        description:
          "The requested DDA Silver collection could not be found in the current catalog.",
        path: `/collections/${slug}`,
        canonical: false,
        noIndex: true,
      });
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;
  const [collection, listing] = await Promise.all([
    getCollection(slug),
    searchParams.then((values) =>
      getCatalogListing(toCatalogSearchParams(values), "", slug),
    ),
  ]);

  if (!collection) {
    notFound();
  }

  const collectionProducts = listing.result.products;
  const populatedCategories = listing.categories;
  const collectionDescription = `Explore the ${collection.title} collection at DDA Silver in Agra. ${collection.description}`;

  return (
    <main id="main-content">
      <CatalogStructuredData
        name={`${collection.title} silver collection`}
        description={collectionDescription}
        path={getCatalogPagePath(`/collections/${collection.slug}`, listing.result.page)}
        total={listing.result.total}
        offset={(listing.result.page - 1) * listing.result.pageSize}
        products={collectionProducts}
      />
      <section className="grid border-b border-line lg:min-h-[29rem] lg:grid-cols-2">
        <div className="flex items-center px-5 py-10 sm:px-10 sm:py-12 lg:px-[max(3rem,calc((100vw-90rem)/2))]">
          <div>
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                { label: collection.title },
              ]}
            />
            <p className="eyebrow mt-7">Collection</p>
            <h1 className="font-display mt-4 text-6xl font-semibold leading-[0.86] sm:text-7xl">
              {collection.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-ink-muted">
              {collection.description}
            </p>
          </div>
        </div>
        <div className="relative min-h-[24rem] bg-[#e8e4df]">
          <Image
            src={collection.heroImage.src}
            alt={collection.heroImage.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            style={{
              objectPosition: collection.heroImage.objectPosition ?? "center",
            }}
          />
        </div>
      </section>
      <section className="section-shell">
        <div className="site-container">
          <CatalogBrowser
            products={collectionProducts}
            categories={populatedCategories}
            initialFilters={listing.filters}
            initialPage={listing.result}
            collectionSlug={slug}
            syncUrl
          />
        </div>
      </section>
    </main>
  );
}

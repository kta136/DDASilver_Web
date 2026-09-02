import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductDetails } from "@/components/catalog/product-details";
import { AnalyticsBeacon } from "@/components/consent/analytics-beacon";
import { getProductStructuredDataProperties } from "@/lib/catalog-seo";
import {
  createPageMetadata,
  getProductIdentity,
  getProductSocialImage,
  serializeJsonLd,
  toAbsoluteUrl,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import {
  getCatalogNavigation,
  getProduct,
  getRelatedProducts,
} from "@/sanity/lib/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return createPageMetadata({
      title: "Product Not Found",
      description:
        "The requested DDA Silver product could not be found in the current catalog.",
      path: `/products/${slug}`,
      canonical: false,
      noIndex: true,
    });
  }

  const productName = getProductIdentity(product);

  return createPageMetadata({
    title: product.seoTitle || productName,
    description: `${productName} at DDA Silver in Agra. ${product.shortDescription}`,
    path: `/products/${product.slug}`,
    image: getProductSocialImage(product.slug, productName),
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, catalog] = await Promise.all([
    getProduct(slug),
    getCatalogNavigation(),
  ]);

  if (!product) {
    notFound();
  }

  const productName = getProductIdentity(product);

  const category = catalog.categories.find(
    (item) => item.slug === product.categorySlug,
  );
  const productCollections = catalog.collections.filter((collection) =>
    product.collectionSlugs.includes(collection.slug),
  );
  const related = await getRelatedProducts(product.categorySlug, product.slug);
  const additionalProperty = getProductStructuredDataProperties(product);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${toAbsoluteUrl(`/products/${product.slug}`)}#product`,
    name: productName,
    description: product.shortDescription,
    image: product.images.map((image) => toAbsoluteUrl(image.src)),
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    material: product.material === "gold" ? "Gold" : "Silver",
    category: category?.title,
    sku: product.reference,
    url: toAbsoluteUrl(`/products/${product.slug}`),
    mainEntityOfPage: toAbsoluteUrl(`/products/${product.slug}`),
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
  };

  return (
    <main id="main-content">
      <AnalyticsBeacon
        eventName="product_view"
        parameters={{
          product_slug: product.slug,
          category_slug: product.categorySlug,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(productSchema),
        }}
      />

      <div className="site-container pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            ...(category
              ? [
                  {
                    label: category.title,
                    href: `/category/${category.slug}`,
                  },
                ]
              : []),
            { label: productName },
          ]}
        />
      </div>

      <section className="site-container grid gap-8 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {product.images.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className="relative aspect-[4/5] overflow-hidden bg-[#ebe7e2] first:sm:col-span-2 first:sm:aspect-[16/11]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                fetchPriority={index === 0 ? "high" : undefined}
                sizes={
                  index === 0
                    ? "(max-width: 1023px) 100vw, (max-width: 1536px) 52vw, 800px"
                    : "(max-width: 640px) 100vw, 29vw"
                }
                className="object-contain"
                style={{ objectPosition: image.objectPosition ?? "center" }}
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-10 lg:self-start">
          <ProductDetails
            product={product}
            categoryTitle={category?.title}
            headingLevel={1}
            presentation="page"
          />
          {productCollections.length > 0 ? (
            <nav
              aria-label="Collections containing this product"
              className="mt-7 border-t border-line pt-5"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                Explore in collections
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {productCollections.map((collection) => (
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
            </nav>
          ) : null}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section-shell border-t border-line bg-white">
          <div className="site-container">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="eyebrow">Continue exploring</p>
                <h2 className="font-display mt-3 text-5xl font-semibold">
                  Related designs
                </h2>
              </div>
              <Link
                href="/products"
                className="text-sm font-bold no-underline underline-offset-4 hover:underline"
              >
                All products
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

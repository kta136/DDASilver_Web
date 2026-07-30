import { WhatsappLogoIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/catalog/product-card";
import { AnalyticsBeacon } from "@/components/consent/analytics-beacon";
import {
  coinShapeLabels,
  idolConstructionLabels,
  purityLabels,
} from "@/lib/catalog-labels";
import { createPageMetadata, toAbsoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppProductUrl } from "@/lib/whatsapp";
import {
  getCatalog,
  getProduct,
  getPublishedCatalog,
} from "@/sanity/lib/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { products } = await getPublishedCatalog();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps) {
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

  return createPageMetadata({
    title: `${product.title} in Agra`,
    description: `${product.title} at DDA Silver in Agra. ${product.shortDescription}`,
    path: `/products/${product.slug}`,
    image: product.images[0],
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, catalog] = await Promise.all([
    getProduct(slug),
    getCatalog(),
  ]);

  if (!product) {
    notFound();
  }

  const category = catalog.categories.find(
    (item) => item.slug === product.categorySlug,
  );
  const related = catalog.products
    .filter(
      (item) =>
        item.slug !== product.slug &&
        item.categorySlug === product.categorySlug,
    )
    .slice(0, 3);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${toAbsoluteUrl(`/products/${product.slug}`)}#product`,
    name: product.title,
    description: product.shortDescription,
    image: product.images.map((image) => toAbsoluteUrl(image.src)),
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    material: "Silver",
    category: category?.title,
    sku: product.reference,
    url: toAbsoluteUrl(`/products/${product.slug}`),
    mainEntityOfPage: toAbsoluteUrl(`/products/${product.slug}`),
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
          __html: JSON.stringify(productSchema).replace(/</g, "\\u003c"),
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
            { label: product.title },
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
                priority={index === 0}
                sizes={
                  index === 0
                    ? "(max-width: 1024px) 100vw, 58vw"
                    : "(max-width: 640px) 100vw, 29vw"
                }
                className={
                  product.coinShape ? "object-contain" : "object-cover"
                }
                style={{ objectPosition: image.objectPosition ?? "center" }}
              />
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-10 lg:self-start">
          <p className="eyebrow">{category?.title ?? "DDA Silver"}</p>
          <h1 className="font-display text-balance mt-4 text-6xl font-semibold leading-[0.9] sm:text-7xl">
            {product.title}
          </h1>
          {product.reference ? (
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-ink-muted">
              Reference {product.reference}
            </p>
          ) : null}
          {product.purity ||
          product.idolConstruction ||
          product.deities.length > 0 ||
          product.coinShape ? (
            <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-5">
              {product.purity ? (
                <div>
                  <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                    Purity
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {purityLabels[product.purity]}
                  </dd>
                </div>
              ) : null}
              {product.idolConstruction ? (
                <div>
                  <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                    Idol Construction
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {idolConstructionLabels[product.idolConstruction]}
                  </dd>
                </div>
              ) : null}
              {product.deities.length > 0 ? (
                <div>
                  <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                    {product.deities.length === 1 ? "Deity" : "Deities"}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {product.deities
                      .map((deity) => deity.title)
                      .join(", ")}
                  </dd>
                </div>
              ) : null}
              {product.coinShape ? (
                <div>
                  <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
                    Shape
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {coinShapeLabels[product.coinShape]}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          <p className="mt-7 text-lg leading-8 text-ink-muted">
            {product.shortDescription}
          </p>

          <div className="mt-9 border-y border-line py-6">
            <p className="text-sm font-bold">Browse and enquire</p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Product pricing and availability are not shown online. Confirm
              availability on WhatsApp with the showroom team.
            </p>
          </div>

          <a
            href={buildWhatsAppProductUrl(product)}
            target="_blank"
            rel="noreferrer"
            className="button-primary mt-8 w-full no-underline sm:w-auto"
            data-analytics="whatsapp_click"
            data-analytics-placement="product_detail"
            data-analytics-product-slug={product.slug}
          >
            <WhatsappLogoIcon size={20} aria-hidden="true" />
            Confirm availability on WhatsApp
          </a>
          <p className="mt-4 text-xs leading-5 text-ink-muted">
            Your message includes this product title, reference, and page link.
          </p>
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

import { notFound } from "next/navigation";

import { ProductDetailDialog } from "@/components/catalog/product-detail-dialog";
import { ProductDetails } from "@/components/catalog/product-details";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { AnalyticsBeacon } from "@/components/consent/analytics-beacon";
import { getCatalog } from "@/sanity/lib/catalog";

type ProductModalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductModalPage({
  params,
}: ProductModalPageProps) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const category = catalog.categories.find(
    (item) => item.slug === product.categorySlug,
  );
  const titleId = `product-dialog-title-${product.slug}`;

  return (
    <>
      <AnalyticsBeacon
        eventName="product_view"
        parameters={{
          product_slug: product.slug,
          category_slug: product.categorySlug,
        }}
      />
      <ProductDetailDialog
        titleId={titleId}
        productPath={`/products/${product.slug}`}
      >
        <div className="grid max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-h-[calc(100dvh-3rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:overflow-hidden">
          <ProductGallery
            images={product.images}
            containImages={
              Boolean(product.coinShape) || product.categorySlug === "purse"
            }
            priority
          />
          <div className="px-5 py-8 sm:px-8 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:px-10 lg:py-12">
            <ProductDetails
              product={product}
              categoryTitle={category?.title}
              headingLevel={2}
              headingId={titleId}
              presentation="dialog"
            />
          </div>
        </div>
      </ProductDetailDialog>
    </>
  );
}

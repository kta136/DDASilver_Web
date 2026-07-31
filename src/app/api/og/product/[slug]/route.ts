import { ImageResponse } from "next/og";

import { ProductSocialImage } from "@/components/seo/product-social-image";
import { productSocialImageSize } from "@/lib/seo";
import { getPublishedCatalog } from "@/sanity/lib/catalog";

const CACHE_CONTROL =
  "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { products } = await getPublishedCatalog();
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return new Response("Product not found", { status: 404 });
  }

  return new ImageResponse(ProductSocialImage({ product }), {
    ...productSocialImageSize,
    headers: {
      "Cache-Control": CACHE_CONTROL,
    },
  });
}

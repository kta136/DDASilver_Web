import { ImageResponse } from "next/og";

import { ProductSocialImage } from "@/components/seo/product-social-image";
import { productSocialImageSize } from "@/lib/seo";
import { getPublishedProduct } from "@/sanity/lib/catalog";

const CACHE_CONTROL =
  "public, max-age=0, s-maxage=300, stale-while-revalidate=60";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await getPublishedProduct(slug);

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

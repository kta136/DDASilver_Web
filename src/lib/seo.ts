import type { Metadata } from "next";

import { isSanityImageUrl } from "@/lib/sanity-image";
import { siteConfig } from "@/lib/site";
import type { CatalogImage, Product } from "@/types/catalog";

const MAX_DESCRIPTION_LENGTH = 160;

export const productSocialImageSize = {
  width: 1200,
  height: 630,
} as const;

export const defaultSocialImage: CatalogImage = {
  // Approved photograph already published for DDA-UT-PT-2201; no concept stock.
  src: "https://cdn.sanity.io/images/f6i0fy2f/production/58ebdc0bdbaab884ad0e817a97c19f5f8f694c58-1254x1254.png",
  alt: "DDA Silver pooja thali set with a multicolor enamel petal border and coordinated ritual vessels",
  width: 1254,
  height: 1254,
};

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  image?: CatalogImage;
  absoluteTitle?: boolean;
  canonical?: boolean;
  noIndex?: boolean;
  noFollow?: boolean;
};

export function toAbsoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

export function getProductSeoName(title: string, reference?: string) {
  const normalizedTitle = title.replace(/\s+/g, " ").trim();
  const normalizedReference = reference?.trim();

  if (
    !normalizedReference ||
    !normalizedTitle.startsWith(normalizedReference)
  ) {
    return normalizedTitle;
  }

  const descriptiveTitle = normalizedTitle
    .slice(normalizedReference.length)
    .replace(/^\s*[\-–—:]\s*/u, "")
    .trim();

  return descriptiveTitle || normalizedTitle;
}

export function getProductIdentity(
  product: Pick<Product, "title" | "reference" | "weightGrams">,
) {
  const name = getProductSeoName(product.title, product.reference);
  // Keep the distinguishing measurement in the name, not beyond a hard cut-off.
  return product.weightGrams && !/\b\d+(?:\.\d+)?\s*(?:g|grams?)\b/i.test(name)
    ? `${name}, ${product.weightGrams} g`
    : name;
}

export function getProductSocialImage(
  slug: string,
  productName: string,
): CatalogImage {
  return {
    src: `/api/og/product/${encodeURIComponent(slug)}`,
    alt: `${productName} from DDA Silver`,
    ...productSocialImageSize,
  };
}

export function getSocialImageProductUrl(src: string) {
  const url = new URL(toAbsoluteUrl(src));

  if (isSanityImageUrl(url.toString())) {
    url.searchParams.delete("auto");
    url.searchParams.set("w", "560");
    url.searchParams.set("h", "560");
    url.searchParams.set("fit", "max");
    url.searchParams.set("fm", "jpg");
    url.searchParams.set("q", "90");
  }

  return url.toString();
}

export function serializeJsonLd(
  value: Record<string, unknown> | readonly unknown[],
) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function truncateSeoText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clipped = normalized.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const boundary =
    lastSpace >= Math.floor(maxLength * 0.7) ? lastSpace : clipped.length;
  const cleanEnding = clipped
    .slice(0, boundary)
    .replace(/[\s,.;:!?\-–—]+$/u, "");

  return `${cleanEnding}…`;
}

export function createPageMetadata({
  title,
  description,
  path,
  image = defaultSocialImage,
  absoluteTitle = false,
  canonical = true,
  noIndex = false,
  noFollow = noIndex,
}: PageMetadataOptions): Metadata {
  const pageTitle = title.replace(/\s+/g, " ").trim();
  const metaDescription = truncateSeoText(description, MAX_DESCRIPTION_LENGTH);
  const renderedTitle = absoluteTitle
    ? pageTitle
    : `${pageTitle} | ${siteConfig.name}`;
  const pageUrl = toAbsoluteUrl(path);
  const imageUrl = toAbsoluteUrl(image.src);
  const socialImage = {
    url: imageUrl,
    width: image.width,
    height: image.height,
    alt: image.alt,
  };

  return {
    title: absoluteTitle ? { absolute: pageTitle } : pageTitle,
    description: metaDescription,
    alternates: canonical ? { canonical: path } : undefined,
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: siteConfig.name,
      title: renderedTitle,
      description: metaDescription,
      url: pageUrl,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: renderedTitle,
      description: metaDescription,
      images: [{ url: imageUrl, alt: image.alt }],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: !noFollow,
            googleBot: { index: false, follow: !noFollow },
          },
        }
      : {}),
  };
}

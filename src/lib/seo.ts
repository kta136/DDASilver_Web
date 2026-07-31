import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";
import type { CatalogImage } from "@/types/catalog";

const MAX_PAGE_TITLE_LENGTH = 48;
const MAX_ABSOLUTE_TITLE_LENGTH = 65;
const MAX_DESCRIPTION_LENGTH = 160;

export const productSocialImageSize = {
  width: 1200,
  height: 630,
} as const;

export const defaultSocialImage: CatalogImage = {
  src: "/images/mockup/hero-silver-bowl.png",
  alt: "Ornate engraved silver bowl representing DDA Silver in Agra",
  width: 1672,
  height: 941,
};

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  image?: CatalogImage;
  absoluteTitle?: boolean;
  canonical?: boolean;
  noIndex?: boolean;
};

export function toAbsoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

export function getProductSeoName(title: string, reference?: string) {
  const normalizedTitle = title.replace(/\s+/g, " ").trim();
  const normalizedReference = reference?.trim();

  if (!normalizedReference || !normalizedTitle.startsWith(normalizedReference)) {
    return normalizedTitle;
  }

  const descriptiveTitle = normalizedTitle
    .slice(normalizedReference.length)
    .replace(/^\s*[\-–—:]\s*/u, "")
    .trim();

  return descriptiveTitle || normalizedTitle;
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
}: PageMetadataOptions): Metadata {
  const pageTitle = truncateSeoText(
    title,
    absoluteTitle ? MAX_ABSOLUTE_TITLE_LENGTH : MAX_PAGE_TITLE_LENGTH,
  );
  const metaDescription = truncateSeoText(
    description,
    MAX_DESCRIPTION_LENGTH,
  );
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
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : undefined,
  };
}

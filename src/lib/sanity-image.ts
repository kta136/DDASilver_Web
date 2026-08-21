import type { CatalogImage } from "@/types/catalog";

const SANITY_IMAGE_HOST = "cdn.sanity.io";
const DEFAULT_IMAGE_QUALITY = 80;
const MAX_VANITY_FILENAME_LENGTH = 96;

type ParsedSanityImageUrl = {
  url: URL;
  pathSegments: ["images", string, string, string, ...string[]];
  width: number;
  height: number;
  extension: string;
};

type CatalogImageSeoOptions = {
  fallbackAlt: string;
  vanityFilename: string;
};

function parseSanityImageUrl(src: string): ParsedSanityImageUrl | null {
  let url: URL;

  try {
    url = new URL(src);
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== SANITY_IMAGE_HOST ||
    url.port ||
    url.username ||
    url.password
  ) {
    return null;
  }

  const pathSegments = url.pathname.split("/").filter(Boolean);
  if (
    pathSegments.length < 4 ||
    pathSegments.length > 5 ||
    pathSegments[0] !== "images"
  ) {
    return null;
  }

  const assetMatch = pathSegments[3]?.match(
    /^[a-z0-9_-]+-(\d+)x(\d+)\.([a-z0-9]+)$/i,
  );
  const width = Number(assetMatch?.[1]);
  const height = Number(assetMatch?.[2]);
  const extension = assetMatch?.[3]?.toLowerCase();

  if (
    !assetMatch ||
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width <= 0 ||
    height <= 0 ||
    !extension
  ) {
    return null;
  }

  return {
    url,
    pathSegments: pathSegments as ParsedSanityImageUrl["pathSegments"],
    width,
    height,
    extension,
  };
}

function normalizeAltText(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 240).trim();
}

export function isSanityImageUrl(src: string) {
  return parseSanityImageUrl(src) !== null;
}

export function toImageVanityFilename(value: string) {
  const filename = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_VANITY_FILENAME_LENGTH)
    .replace(/-+$/g, "");

  return filename || "dda-silver-image";
}

export function withSanityImageVanityFilename(
  src: string,
  vanityFilename: string,
) {
  const parsed = parseSanityImageUrl(src);
  if (!parsed) {
    return src;
  }

  const filename = toImageVanityFilename(vanityFilename);
  const basePath = parsed.pathSegments.slice(0, 4).join("/");
  parsed.url.pathname = `/${basePath}/${filename}.${parsed.extension}`;

  return parsed.url.toString();
}

export function getResponsiveSanityImageUrl({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const parsed = parseSanityImageUrl(src);
  if (!parsed) {
    return src;
  }

  const requestedWidth = Number.isFinite(width) ? Math.round(width) : parsed.width;
  const targetWidth = Math.min(Math.max(requestedWidth, 1), parsed.width);
  const requestedQuality = quality ?? DEFAULT_IMAGE_QUALITY;
  const targetQuality = Math.min(
    Math.max(Math.round(requestedQuality), 1),
    100,
  );

  parsed.url.searchParams.set("auto", "format");
  parsed.url.searchParams.set("fit", "max");
  parsed.url.searchParams.set("w", targetWidth.toString());
  parsed.url.searchParams.set("q", targetQuality.toString());

  return parsed.url.toString();
}

export function getCatalogImageWithSeo(
  image: CatalogImage,
  { fallbackAlt, vanityFilename }: CatalogImageSeoOptions,
): CatalogImage {
  const alt = normalizeAltText(image.alt) || normalizeAltText(fallbackAlt);

  return {
    ...image,
    src: withSanityImageVanityFilename(image.src, vanityFilename),
    alt,
  };
}

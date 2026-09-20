import { siteConfig } from "@/lib/site";
import { silverPayalBrands } from "@/data/silver-payal-brands";

type WhatsAppProduct = {
  title: string;
  reference?: string;
  slug: string;
};

export function buildWhatsAppProductUrl(
  product: WhatsAppProduct,
  siteUrl = siteConfig.url,
) {
  const productUrl = new URL(`/products/${product.slug}`, siteUrl).toString();
  const reference = product.reference
    ? ` (reference ${product.reference})`
    : "";
  const message = [
    `Hello DDA Silver, I would like to enquire about ${product.title}${reference}.`,
    productUrl,
    "Please confirm the final price and collection details.",
  ].join("\n");

  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralWhatsAppUrl() {
  const message =
    "Hello DDA Silver, I would like help exploring your silver collection.";
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppPayalBrandUrl(
  brand?: string,
  siteUrl = siteConfig.url,
) {
  const normalizedBrand = brand?.trim();
  const matchedBrand = normalizedBrand
    ? silverPayalBrands.find(
        (candidate) =>
          candidate.name.toLowerCase() === normalizedBrand.toLowerCase(),
      )
    : undefined;
  const pagePath = matchedBrand
    ? `/silver-payal-brands/${matchedBrand.slug}`
    : "/silver-payal-brands";
  const pageUrl = new URL(pagePath, siteUrl).toString();
  const itemName = normalizedBrand
    ? `${normalizedBrand} silver payals`
    : "silver payals";
  const message = [
    `Hello DDA Silver, I would like to enquire about ${itemName}.`,
    "Please share current designs and pricing, along with available sizes, weights and purity details.",
    pageUrl,
  ].join("\n");

  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

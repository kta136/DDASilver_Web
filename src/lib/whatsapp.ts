import { siteConfig } from "@/lib/site";

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
    "Please confirm availability on WhatsApp.",
  ].join("\n");

  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralWhatsAppUrl() {
  const message =
    "Hello DDA Silver, I would like help exploring your silver collection.";
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

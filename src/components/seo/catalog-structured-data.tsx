import { getCatalogPageStructuredData } from "@/lib/catalog-seo";
import { serializeJsonLd } from "@/lib/seo";
import type { Product } from "@/types/catalog";

type CatalogStructuredDataProps = {
  name: string;
  description: string;
  path: `/${string}`;
  products: Product[];
};

export function CatalogStructuredData({
  name,
  description,
  path,
  products,
}: CatalogStructuredDataProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(
          getCatalogPageStructuredData({
            name,
            description,
            path,
            products,
          }),
        ),
      }}
    />
  );
}

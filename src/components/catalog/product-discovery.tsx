import Link from "next/link";

import { getProductIdentity } from "@/lib/seo";
import { getDiscoveryProducts } from "@/sanity/lib/catalog";
import { CatalogUnavailableError } from "@/sanity/lib/read";

export async function ProductDiscovery({
  category = "", collection = "",
}: { category?: string; collection?: string }) {
  let products;
  try {
    products = await getDiscoveryProducts(category, collection);
  } catch (error) {
    if (error instanceof CatalogUnavailableError) return null;
    throw error;
  }
  if (!products.length) return null;

  return (
    <section className="mt-12 border-t border-line pt-8" aria-labelledby="more-designs-heading">
      <h2 id="more-designs-heading" className="font-display text-3xl sm:text-4xl">
        More designs to explore
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">
        Compare individual designs and their recorded details, then ask our Agra
        showroom about the piece you have in mind.
      </p>
      <ul className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <li key={product.slug} className="border-b border-line py-4">
            <Link href={`/products/${product.slug}`} prefetch={false}
              className="inline-block py-2 text-sm font-semibold underline-offset-4 hover:underline">
              {getProductIdentity(product)}
            </Link>
            <p className="mt-1 text-xs leading-6 text-ink-muted">{product.shortDescription}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

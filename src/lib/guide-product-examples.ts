import type { Product } from "@/types/catalog";

export async function loadPublishedGuideProductExamples(
  slugs: readonly string[],
  loadProduct: (slug: string) => Promise<Product | undefined>,
) {
  const results = await Promise.all(
    slugs.map(async (slug) => {
      try {
        return await loadProduct(slug);
      } catch {
        console.warn(
          `[guides] Optional published product example unavailable: ${slug}`,
        );
        return undefined;
      }
    }),
  );

  return results.filter((product): product is Product => Boolean(product));
}

export function formatGuideProductExample(product: Product) {
  const specifications = [
    product.purity ? `${product.purity}% purity` : "",
    product.weightGrams ? `${product.weightGrams} g` : "",
    product.heightInches ? `height ${product.heightInches} in` : "",
    product.widthInches ? `width ${product.widthInches} in` : "",
    product.depthInches ? `depth ${product.depthInches} in` : "",
    product.diameterInches ? `diameter ${product.diameterInches} in` : "",
  ].filter(Boolean);

  return specifications.length
    ? `${product.title} — ${specifications.join(", ")}`
    : product.title;
}

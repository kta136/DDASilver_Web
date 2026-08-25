import type { CatalogImage, Category, Product } from "@/types/catalog";

export const homepageCategorySlugs = [
  "coin",
  "idols",
  "purse",
  "gifts",
  "jhula",
  "utensils",
  "gold",
] as const;

const galleryBackedCategorySlugs = new Set([
  "coin",
  "idols",
  "gifts",
  "utensils",
]);

export function getHomepageCategories(
  categories: Category[],
  products: Product[],
  fallbackCategories: Category[] = [],
) {
  const categoryBySlug = new Map(
    fallbackCategories.map((category) => [category.slug, category]),
  );
  for (const category of categories) {
    categoryBySlug.set(category.slug, category);
  }
  const galleryImageByCategory = new Map<string, CatalogImage>();

  for (const product of products) {
    if (
      !galleryBackedCategorySlugs.has(product.categorySlug) ||
      galleryImageByCategory.has(product.categorySlug)
    ) {
      continue;
    }

    const galleryImage = product.images[0];
    if (galleryImage) {
      galleryImageByCategory.set(product.categorySlug, galleryImage);
    }
  }

  return homepageCategorySlugs.flatMap((slug) => {
    const category = categoryBySlug.get(slug);
    if (!category) {
      return [];
    }

    const galleryImage = galleryImageByCategory.get(slug);
    return [galleryImage ? { ...category, image: galleryImage } : category];
  });
}

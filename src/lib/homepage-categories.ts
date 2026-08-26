import type { Category } from "@/types/catalog";

export function getHomepageCategories(categories: Category[]) {
  return categories
    .filter(
      (category) =>
        category.showOnHomepage !== false && (category.productCount ?? 0) > 0,
    )
    .toSorted(
      (a, b) =>
        (a.homepageOrder ?? a.displayOrder) -
          (b.homepageOrder ?? b.displayOrder) || a.slug.localeCompare(b.slug),
    )
    .map((category) => ({
      ...category,
      image:
        category.homepageImageSource !== "category" &&
        category.firstProductImage
          ? category.firstProductImage
          : category.image,
    }));
}

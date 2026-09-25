import type { Collection } from "@/types/catalog";

export function getHomepageCollections(collections: Collection[]) {
  return collections
    .filter(
      (collection) =>
        (collection.productCount ?? collection.productSlugs.length) > 0,
    )
    .toSorted((first, second) => first.displayOrder - second.displayOrder);
}

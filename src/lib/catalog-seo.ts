import {
  coinShapeLabels,
  idolConstructionLabels,
  purityLabels,
  utensilTypeLabels,
} from "@/lib/catalog-labels";
import type { Category, Collection, Product } from "@/types/catalog";

export function getPopulatedCategories(
  categories: Category[],
  products: Product[],
) {
  const populatedCategorySlugs = new Set(
    products.map((product) => product.categorySlug),
  );

  return categories.filter((category) =>
    populatedCategorySlugs.has(category.slug),
  );
}

export function getPopulatedCollections(
  collections: Collection[],
  products: Product[],
) {
  const populatedCollectionSlugs = new Set(
    products.flatMap((product) => product.collectionSlugs),
  );

  return collections.filter((collection) =>
    populatedCollectionSlugs.has(collection.slug),
  );
}

export function getProductStructuredDataProperties(product: Product) {
  const properties = [
    product.purity
      ? { name: "Silver purity", value: purityLabels[product.purity] }
      : null,
    product.weightGrams
      ? { name: "Weight", value: `${product.weightGrams} g` }
      : null,
    product.heightInches
      ? { name: "Height", value: `${product.heightInches} in` }
      : null,
    product.widthInches
      ? { name: "Width", value: `${product.widthInches} in` }
      : null,
    product.diameterInches
      ? { name: "Diameter", value: `${product.diameterInches} in` }
      : null,
    product.singhasanWidthInches && product.singhasanDepthInches
      ? {
          name: "Singhasan dimensions",
          value: `${product.singhasanWidthInches} × ${product.singhasanDepthInches} in`,
        }
      : null,
    product.utensilType
      ? { name: "Utensil type", value: utensilTypeLabels[product.utensilType] }
      : null,
    product.idolConstruction
      ? {
          name: "Idol construction",
          value: idolConstructionLabels[product.idolConstruction],
        }
      : null,
    product.deities.length > 0
      ? {
          name: product.deities.length === 1 ? "Deity" : "Deities",
          value: product.deities.map((deity) => deity.title).join(", "),
        }
      : null,
    product.coinShape
      ? { name: "Coin shape", value: coinShapeLabels[product.coinShape] }
      : null,
  ].filter((property): property is { name: string; value: string } =>
    Boolean(property),
  );

  return properties.map((property) => ({
    "@type": "PropertyValue",
    ...property,
  }));
}

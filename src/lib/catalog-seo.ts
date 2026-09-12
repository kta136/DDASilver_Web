import {
  coinShapeLabels,
  idolConstructionLabels,
  materialLabels,
  purityLabels,
  utensilTypeLabels,
} from "@/lib/catalog-labels";
import { getProductIdentity, toAbsoluteUrl } from "@/lib/seo";
import { automaticOfferValidity } from "@/lib/pricing/freshness";
import { siteConfig } from "@/lib/site";
import type { Category, Collection, Product } from "@/types/catalog";

type CatalogPageStructuredDataOptions = {
  name: string;
  description: string;
  path: `/${string}`;
  products: Product[];
  total?: number;
  offset?: number;
};

const MAX_STRUCTURED_CATALOG_ITEMS = 100;

export function getCategorySeoName(
  category: Pick<Category, "title" | "productKind" | "slug">,
) {
  const title = category.title.trim();
  return category.productKind === "gold" ||
    category.slug === "gold" ||
    /\b(?:silver|gold)\b/i.test(title)
    ? title
    : `Silver ${title}`;
}

export function getPopulatedCategories(
  categories: Category[],
  products: Pick<Product, "categorySlug">[],
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
  products: Pick<Product, "collectionSlugs">[],
) {
  const populatedCollectionSlugs = new Set(
    products.flatMap((product) => product.collectionSlugs),
  );

  return collections.filter((collection) =>
    populatedCollectionSlugs.has(collection.slug),
  );
}

export function getCatalogPageStructuredData({
  name,
  description,
  path,
  products,
  total = products.length,
  offset = 0,
}: CatalogPageStructuredDataOptions) {
  const pageUrl = toAbsoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collection-page`,
    name,
    description,
    url: pageUrl,
    isPartOf: { "@id": `${toAbsoluteUrl("/")}#website` },
    mainEntity: {
      "@type": "ItemList",
      "@id": `${pageUrl}#product-list`,
      name,
      numberOfItems: total,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: products
        .slice(0, MAX_STRUCTURED_CATALOG_ITEMS)
        .map((product, index) => {
          const productUrl = toAbsoluteUrl(`/products/${product.slug}`);

          return {
            "@type": "ListItem",
            position: offset + index + 1,
            url: productUrl,
            name: getProductIdentity(product),
          };
        }),
    },
  };
}

function getProductOffers(product: Product, now: number) {
  const estimate = product.estimate;
  if (!estimate || estimate.status !== "available") {
    return undefined;
  }
  const asOf = Date.parse(estimate.asOf);
  // lastAvailable describes a refresh failure, not the validity of the saved price.
  if (
    !Number.isFinite(asOf) || asOf > now ||
    (estimate.mode === "automatic" && automaticOfferValidity(estimate.asOf, now).status === "expired")
  ) {
    return undefined;
  }

  const prices = estimate.sizes.length
    ? estimate.sizes.map((size) => ({
        name: `${size.weightGrams} g / ${size.diameterInches} in`,
        amount: size.amount,
      }))
    : [{ name: getProductIdentity(product), amount: estimate.minimum }];
  if (prices.some(({ amount }) => !Number.isSafeInteger(amount) || amount <= 0) ||
      Math.min(...prices.map(({ amount }) => amount)) !== estimate.minimum ||
      Math.max(...prices.map(({ amount }) => amount)) !== estimate.maximum) {
    return undefined;
  }

  // Individual size offers match the visible size table. AggregateOffer is not
  // appropriate for size variants (it describes multiple offers of one product).
  return prices.map(({ name, amount }) => ({
    "@type": "Offer",
    name,
    price: amount.toFixed(2),
    priceCurrency: estimate.currency,
    url: toAbsoluteUrl(`/products/${product.slug}`),
    seller: { "@id": `${toAbsoluteUrl("/")}#business` },
    description: "Includes making charges and taxes. Final price confirmed on enquiry.",
  }));
}

/** Use the same request's visible prices; enquiry-only pages remain WebPages. */
export function getProductPageStructuredData(product: Product, now = Date.now()) {
  const pageUrl = toAbsoluteUrl(`/products/${product.slug}`);
  const name = getProductIdentity(product);
  const offers = getProductOffers(product, now);
  if (offers) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${pageUrl}#product`,
      name,
      description: product.shortDescription,
      url: pageUrl,
      mainEntityOfPage: pageUrl,
      image: product.images.map((image) => toAbsoluteUrl(image.src)),
      brand: { "@type": "Brand", name: siteConfig.name },
      ...(product.material ? { material: materialLabels[product.material] } : {}),
      ...(product.reference ? { sku: product.reference } : {}),
      additionalProperty: getProductStructuredDataProperties(product),
      offers,
    };
  }
  const facts = getProductStructuredDataProperties(product)
    .map(({ name, value }) => `${name}: ${value}`)
    .join(". ");

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    name,
    description: product.shortDescription,
    url: pageUrl,
    image: product.images.map((image) => toAbsoluteUrl(image.src)),
    isPartOf: { "@id": `${toAbsoluteUrl("/")}#website` },
    ...(product.updatedAt ? { dateModified: product.updatedAt } : {}),
    mainEntity: {
      "@type": "Thing",
      "@id": `${pageUrl}#item`,
      name,
      description: [product.shortDescription, facts].filter(Boolean).join(" "),
      ...(product.reference ? { identifier: product.reference } : {}),
      url: pageUrl,
      image: product.images.map((image) => toAbsoluteUrl(image.src)),
    },
  };
}

export function getProductStructuredDataProperties(product: Product) {
  const properties = [
    product.material
      ? { name: "Material", value: materialLabels[product.material] }
      : null,
    product.purity
      ? {
          name: product.material === "gold" ? "Gold purity" : "Silver purity",
          value: purityLabels[product.purity],
        }
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
    product.depthInches
      ? { name: "Depth", value: `${product.depthInches} in` }
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
    product.sizeVariants?.length
      ? {
          name: "Available sizes",
          value: product.sizeVariants
            .map(
              (variant) =>
                `${variant.weightGrams} g / ${variant.diameterInches} in diameter`,
            )
            .join(", "),
        }
      : null,
    product.utensilType
      ? { name: "Product type", value: utensilTypeLabels[product.utensilType] }
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
      ? { name: "Shape", value: coinShapeLabels[product.coinShape] }
      : null,
  ].filter((property): property is { name: string; value: string } =>
    Boolean(property),
  );

  return properties.map((property) => ({
    "@type": "PropertyValue",
    ...property,
  }));
}

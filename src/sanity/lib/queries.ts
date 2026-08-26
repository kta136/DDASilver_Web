import { defineQuery } from "next-sanity";

const imageProjection = `{
  "src": asset->url, alt,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "objectPosition": select(hotspot.x < 0.4 => "left center", hotspot.x > 0.6 => "right center", "center center")
}`;
const productFields = `
  _id, title, "slug": slug.current, shortDescription, seoTitle,
  "categorySlug": category->slug.current, "categoryKind": category->productKind,
  "collectionSlugs": coalesce(collections[]->slug.current, []),
  "featured": coalesce(featured, false), displayOrder, reference, material, purity,
  weightGrams, heightInches, widthInches, depthInches, diameterInches,
  singhasanWidthInches, singhasanDepthInches,
  "sizeVariants": coalesce(sizeVariants[]{weightGrams, diameterInches}, []),
  utensilType, idolConstruction,
  "deities": coalesce(deities[]->{title, "slug": slug.current}, []),
  coinShape, "updatedAt": _updatedAt
`;
const cardProjection = `{${productFields}, "images": gallery[0...1] ${imageProjection}}`;
const detailProjection = `{${productFields}, "images": coalesce(gallery[] ${imageProjection}, [])}`;
const publishedProduct = `_type == "product" && defined(slug.current) && defined(category->slug.current) && defined(gallery[0].asset->url)`;
const collectionFilter = `($collection == "" || $collection in collections[]->slug.current)`;
const listingFilter = `${publishedProduct} && ${collectionFilter}
  && ($category == "" || category->slug.current == $category)
  && ($purity == "" || purity == $purity)
  && ($idol == "" || idolConstruction == $idol)
  && ($deity == "" || $deity in deities[]->slug.current)
  && ($shape == "" || coinShape == $shape)
  && ($item == "" || utensilType == $item)
  && (count($terms) == 0 || ([title, shortDescription] + coalesce(deities[]->title, [])) match $terms)
`;

// Cursor batches are for exports/maintenance, never the customer listing.
export const productsQuery = defineQuery(
  `*[_type == "product" && _id > $afterId] | order(_id asc)[0...200] ${detailProjection}`,
);
export const productQuery = defineQuery(
  `*[_type == "product" && slug.current == $slug] | order(_id asc)[0...1] ${detailProjection}`,
);
export const featuredProductsQuery = defineQuery(
  `*[${publishedProduct} && featured == true] | order(displayOrder asc, _id asc)[0...4] ${cardProjection}`,
);
export const homepageFallbackProductsQuery = defineQuery(
  `*[${publishedProduct}] | order(displayOrder asc, _id asc)[0...4] ${cardProjection}`,
);
export const relatedProductsQuery = defineQuery(
  `*[${publishedProduct} && category->slug.current == $category && slug.current != $slug] | order(displayOrder asc, _id asc)[0...3] ${cardProjection}`,
);
export const productPageQuery = defineQuery(`{
  "products": *[${listingFilter}] | order(displayOrder asc, _id asc)[$start...$end] ${cardProjection},
  "total": count(*[${listingFilter}])
}`);

export const categoriesQuery =
  defineQuery(`*[_type == "category"] | order(displayOrder asc, _id asc) {
  _id, title, "slug": slug.current, description, editorialSections[]{heading, body}, "image": image ${imageProjection}, displayOrder,
  productKind, showOnHomepage, homepageOrder, homepageImageSource,
  "productCount": count(*[${publishedProduct} && category._ref == ^._id]),
  "firstProductImage": *[${publishedProduct} && category._ref == ^._id] | order(displayOrder asc, _id asc)[0].gallery[0] ${imageProjection},
  "updatedAt": _updatedAt
}`);

// Membership has one owner: product.collections. The legacy collection.products
// field is deliberately not read.
export const collectionsQuery =
  defineQuery(`*[_type == "collection"] | order(displayOrder asc, _id asc) {
  _id, title, "slug": slug.current, description, editorialSections[]{heading, body}, "heroImage": heroImage ${imageProjection},
  "productSlugs": *[${publishedProduct} && ^._id in collections[]._ref] | order(displayOrder asc, _id asc).slug.current,
  "productCount": count(*[${publishedProduct} && ^._id in collections[]._ref]),
  displayOrder, "updatedAt": _updatedAt
}`);

const facetProducts = `${publishedProduct} && ${collectionFilter} && category._ref == ^._id`;
export const catalogFacetsQuery = defineQuery(`*[_type == "category"] {
  "categorySlug": slug.current,
  "productCount": count(*[${facetProducts}]),
  "purities": array::unique(*[${facetProducts}].purity)[defined(@)],
  "idolConstructions": array::unique(*[${facetProducts}].idolConstruction)[defined(@)],
  "coinShapes": array::unique(*[${facetProducts}].coinShape)[defined(@)],
  "utensilTypes": array::unique(*[${facetProducts}].utensilType)[defined(@)],
  "deities": (*[${facetProducts}].deities[]->{title, "slug": slug.current})[defined(slug)]
}`);

export const sitemapProductsQuery =
  defineQuery(`*[${publishedProduct} && _id > $afterId] | order(_id asc)[0...200] {
  _id, title, reference, "slug": slug.current,
  "images": gallery[] ${imageProjection},
  "categorySlug": category->slug.current,
  "collectionSlugs": coalesce(collections[]->slug.current, []),
  "updatedAt": _updatedAt
}`);

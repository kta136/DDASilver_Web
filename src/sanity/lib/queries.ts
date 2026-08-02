import { defineQuery } from "next-sanity";

const imageProjection = `{
  "src": asset->url,
  alt,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "objectPosition": select(
    hotspot.x < 0.4 => "left center",
    hotspot.x > 0.6 => "right center",
    "center center"
  )
}`;

export const productsQuery = defineQuery(`*[_type == "product"] | order(displayOrder asc)[0...1000] {
  title,
  "slug": slug.current,
  shortDescription,
  "images": coalesce(gallery[] ${imageProjection}, []),
  "categorySlug": category->slug.current,
  "collectionSlugs": coalesce(collections[]->slug.current, []),
  featured,
  displayOrder,
  reference,
  purity,
  weightGrams,
  heightInches,
  widthInches,
  diameterInches,
  idolConstruction,
  "deities": coalesce(deities[]->{
    title,
    "slug": slug.current
  }, []),
  coinShape,
  "updatedAt": _updatedAt
}`);

export const categoriesQuery = defineQuery(`*[_type == "category"] | order(displayOrder asc)[0...100] {
  title,
  "slug": slug.current,
  description,
  "image": image ${imageProjection},
  displayOrder,
  "updatedAt": _updatedAt
}`);

export const collectionsQuery = defineQuery(`*[_type == "collection"] | order(displayOrder asc)[0...100] {
  title,
  "slug": slug.current,
  description,
  "heroImage": heroImage ${imageProjection},
  "productSlugs": coalesce(products[]->slug.current, []),
  displayOrder,
  "updatedAt": _updatedAt
}`);

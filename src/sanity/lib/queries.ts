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

export const productsQuery = defineQuery(`*[_type == "product"] | order(displayOrder asc) {
  title,
  "slug": slug.current,
  shortDescription,
  "images": gallery[] ${imageProjection},
  "categorySlug": category->slug.current,
  "collectionSlugs": collections[]->slug.current,
  featured,
  displayOrder,
  reference,
  purity,
  idolConstruction,
  coinShape
}`);

export const categoriesQuery = defineQuery(`*[_type == "category"] | order(displayOrder asc) {
  title,
  "slug": slug.current,
  description,
  "image": image ${imageProjection},
  displayOrder
}`);

export const collectionsQuery = defineQuery(`*[_type == "collection"] | order(displayOrder asc) {
  title,
  "slug": slug.current,
  description,
  "heroImage": heroImage ${imageProjection},
  "productSlugs": products[]->slug.current,
  displayOrder
}`);

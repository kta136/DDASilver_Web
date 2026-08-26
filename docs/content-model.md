# Sanity content model

Sanity Studio manages products, categories, collections and deities. The website
reads published documents by default. Authorized draft mode uses uncached reads
and never shares recovery snapshots with published traffic.

## Shared validation and generated types

`src/lib/catalog-domain.ts` owns product enums, limits, measurements and the write
contract. Studio and product upload commands use it. The mixed-gallery publisher
validates actual assembled documents during dry run, even when readiness flags
are true. Existing gallery attachments check final gallery size and unique keys.

The runtime boundary validates each document independently using the same limits
and enums, with explicit compatibility for legacy missing alt text and nullable
optional fields. New writes require authored alt text. External API writes can
bypass Studio validation, so runtime validation remains necessary.

| Product field | Contract |
| --- | --- |
| Title / short description | Required; at most 100 / 240 characters |
| Slug | Lowercase letters, digits and single hyphens; at most 96 characters |
| Gallery | 1-20 images; unique keys; alt text 12-180 characters |
| Purity | `91.60`, `92.5`, `99.50`, `99.80` |
| Material | `silver` or `gold`; gold requires Gold product fields |
| Weight | Verified positive grams, at most 100,000; required for purses |
| Dimensions | Verified positive inches, at most 1,000 |
| Display order | Integer from 0 to 100,000 |
| Reference | Canonical enquiry code; at most 60 characters |
| Featured | Required boolean; defaults to false |
| Collections / deities | At most 100 / 50 references |
| Size variants | At most 20 verified weight/diameter pairs |

Retain the approved batch-specific reference and asset rules in ingestion
commands. Never infer missing weight or dimensions from photographs. Store each
measurement in its dedicated field; descriptions do not substitute for structured
measurements. Hollow-idol references follow [the item-code guide](idol-item-codes.md).

Run `npm run sanity:typegen` after schema or GROQ changes and commit both
`src/sanity/schema.json` and `src/sanity/types.ts`. Runtime contract field names
are checked against generated query projections. CI regenerates these artifacts
and fails on drift. TypeGen does not replace validation of actual CMS responses.

## Category configuration

Categories require a title, slug, description, representative image with alt
text, display order and **Product fields** (`productKind`).

| Product fields | Specifications and filters |
| --- | --- |
| General | Common product fields |
| Coin / Gold | Coin or bar shape; Gold also requires gold material |
| Idol | Construction and at least one deity |
| Utensil | Utensil item type |
| Purse | Verified weight |
| Jhula | Optional singhasan dimensions, supplied as a width/depth pair |

These rules use the category's configuration, not its document ID. New categories
can use arbitrary IDs and slugs. Existing categories retain a centralized legacy
mapping for `coin`, `gold`, `idols`, `utensils`, `purse` and `jhula`.
**Set Product fields before renaming a legacy category slug.**

Homepage controls:

- **Show on homepage:** defaults to shown; empty categories remain hidden.
- **Homepage order:** optional override of Display order.
- **Homepage image:** first product image or the category's editorial image.

Without an explicit choice, the first product image is used, falling back to the
category image. There is no fixed list of category slugs. Review existing
categories in Studio for the desired order and image choice. Deploying website
code does not write these settings into Sanity.

## Collections and dormant editors

**Product > Collections is the only membership source.** Product lists, counts
and collection pages derive from those references. Legacy `collection.products`
data is retained but hidden/read-only and ignored by the website. Collections
still provide title, slug, description, hero image and display order.

`page` and `siteSettings` schemas remain for compatibility but are excluded from
Studio navigation and creation templates, with editing and document actions
disabled. They do not control the website. Page copy and site settings remain in
the application until those consumers are implemented.

## Reading, pagination and recovery

- Published reads use the Sanity origin (`useCdn: false`) and explicit Next.js
  caching with a 300-second revalidation interval.
- Detail pages, overlays and social cards query one product. Featured and related
  product reads are bounded separately.
- Listings use 24-item server pages. GROQ performs search and filtering; facets
  cover the entire selected collection/category, not only the visible page.
  Share URLs, browser history and paginated canonical URLs are supported.
- Sitemap/export reads use stable `_id` cursor batches of 200, without the old
  1,000-product cutoff. Successful empty responses do not resurrect deleted items.
- Invalid documents log their ID and failed fields and are skipped independently,
  or recovered from a previous validated response for the same query. A failed
  query retries without caching, then uses its last validated snapshot if present.
- Snapshots are scoped by project, dataset, query and parameters, bounded to 200
  entries and 24 hours. Only fully valid published responses are persisted.
- Cold requests without a usable snapshot display an unavailable state, never
  demo products in production. Demo content is allowed only when Sanity is
  unconfigured and `NEXT_PUBLIC_SITE_ENV` is not `production`. A configured but
  failing dataset never switches to demo content.

Recovery is query-specific, not a complete offline catalog. Unvisited products
or filter combinations may be unavailable during an outage. The default snapshot
directory is `.next/cache/sanity-catalog`. Set `SANITY_CATALOG_CACHE_DIR` to a
writable persistent volume for recovery across container replacement. Otherwise
recovery lasts only as long as the current container/process. Monitor validation
errors and recovery warnings; stale content does not prove Sanity is healthy.

## Signed publish webhook

Configure POST `/api/sanity/revalidate`, with the secret matching
`SANITY_REVALIDATE_SECRET`, and Create, Update and Delete enabled. Include products,
categories, collections, deities and image assets. Exclude drafts and release
versions. The handler immediately invalidates dependent catalog queries and the
sitemap. The 300-second interval covers missed events. Social-image HTTP caching
is bounded to five minutes, with a one-minute stale window.

Filter:

```groq
coalesce(after()._type, before()._type) in [
  "product", "category", "collection", "deity", "sanity.imageAsset"
]
&& !(coalesce(after()._id, before()._id) in path("drafts.**"))
&& !(coalesce(after()._id, before()._id) in path("versions.**"))
```

Projection, including deleted documents:

```groq
{
  "_type": coalesce(after()._type, before()._type),
  "_id": coalesce(after()._id, before()._id),
  "slug": coalesce(after().slug.current, before().slug.current)
}
```

The event settings and `before()` / `after()` projection follow
[Sanity's webhook documentation](https://www.sanity.io/docs/content-lake/webhooks).
Deploying this repository does not update the hosted webhook. Verify one approved
publish/unpublish cycle after configuring it. Unit tests cannot verify delivery
from the hosted project.

## Gallery delivery and publishing

Follow [product gallery ingestion](product-gallery-ingestion.md): preserve real
source photos, use the approved background, deliver square 1254 x 1254 PNGs and
matching validated metadata. AI-assisted retouching must not redesign products.
Do not add commerce fields such as stock, prices or checkout.

The image CDN provides responsive delivery and stable descriptive filenames.
Authored alt text, structured data and the image sitemap are preserved. Review
draft content and every gallery image before publishing. Upload/publish commands
require explicit owner authorization; validation and builds do not authorize
Sanity writes.

# Sanity content model

**Status:** Implemented and connected  
**Implementation:** Product taxonomy and catalog fields are available in the
local Studio

## Operating model

Sanity Studio is the editorial system for public catalog and page content.
Start on the Sanity Free plan with 1–2 trusted administrators.

The website must query published content only. Editors use drafts and preview
before publishing.

## Document schemas

### `product`

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `title` | string | Yes | 2–100 characters |
| `slug` | slug | Yes | Unique; generated from title but editable |
| `shortDescription` | text | Yes | Plain text; concise customer description |
| `gallery` | image array | Yes | At least one image; each image requires alt text |
| `category` | reference | Yes | References one published category |
| `purity` | string | Yes | `92.5` or `99.80`; displayed as 92.5% or 99.80% |
| `weightGrams` | number | When supplied/category-required | Positive product weight in grams |
| `heightInches` | number | When supplied | Verified positive product height in inches |
| `widthInches` | number | When supplied | Verified positive product width in inches |
| `diameterInches` | number | When supplied | Verified positive diameter for round products |
| `idolConstruction` | string | For Idols | Hollow, Solid, or Semi-solid |
| `deities` | reference array | For Idols | One or more references to the Deities taxonomy |
| `coinShape` | string | For Coin | Round, Oval, Square, or Rectangle |
| `collections` | reference array | No | Unique collection references |
| `featured` | boolean | Yes | Defaults to false |
| `displayOrder` | number | Yes | Integer; defaults to 100 |
| `reference` | string | No | Canonical item code and enquiry context |

Do not add price, compare-at price, quantity, stock status, variants, cart,
tax, shipping, or checkout fields. Record an owner-supplied product weight in
`weightGrams`. Store verified dimensions in the applicable separate field:
`heightInches`, `widthInches`, or `diameterInches`. Round bowls use diameter,
while tumblers use height unless a verified width is also supplied.

Product cards append `Height <value> in` and `Width <value> in` to their
metadata line independently. Each label is rendered only when its matching
dedicated Sanity field has a value; the website does not parse dimensions from
the title or description.

### `category`

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `title` | string | Yes | Unique public label |
| `slug` | slug | Yes | Unique |
| `description` | text | Yes | Category introduction |
| `image` | image | Yes | Alt text required |
| `displayOrder` | number | Yes | Integer |

Initial content taxonomy:

- Jewellery
- Coin
- Idols
- Gifts
- Utensils

Idols use the **Idol Construction** field with Hollow, Solid, and Semi-solid
options, plus the **Deities** taxonomy for God-name filtering. Coin products
use a Coin-only shape field with Round, Oval, Square, and Rectangle options.
These specialized filters appear only after their relevant category is
selected.

Hollow-idol Item Names and references follow the approved
[idol item-code terminology](idol-item-codes.md). The canonical format is
`HM-<DEITY_OR_DESIGN_CODE>-<SEQUENCE>`, and weight and height remain in the
description rather than the Item Name.

Editors may rename, add, hide, or reorder categories without code changes.

### `collection`

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `title` | string | Yes | Public collection name |
| `slug` | slug | Yes | Unique |
| `description` | text | Yes | Editorial introduction |
| `heroImage` | image | Yes | Alt text required |
| `products` | reference array | Yes | Unique product references |
| `displayOrder` | number | Yes | Integer |

Collections are optional editorial groupings. They do not imply stock,
discount, price, or campaign validity.

### `page`

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `title` | string | Yes | Editorial title |
| `slug` | slug | Yes | Limited to supported editable pages |
| `summary` | text | No | Metadata or page introduction |
| `sections` | object array | Yes | Approved reusable content blocks |
| `seo` | object | No | Metadata override |

Reusable section types may include prose, image-with-copy, quote, values,
contact details, app promotion, and linked callout. Avoid arbitrary HTML.

### `siteSettings`

Singleton fields:

- Public brand name and logo.
- Short brand description.
- Primary navigation and footer navigation.
- Phone and normalized `tel:` value.
- WhatsApp display number and normalized international number.
- Address.
- Opening-hours structure with Monday closed.
- Verified maps and Google Business Profile URLs.
- Android and iOS URLs.
- DDAJewels sister-brand URL.
- Default SEO title, description, and social image.
- Analytics and consent text.

## Reusable objects

### Image

- Asset reference.
- Required descriptive alt text.
- Optional caption.
- Sanity crop and hotspot.
- Optional credit/source note for internal governance.

Decorative images must use an empty alt value intentionally; the editor must
choose “decorative” rather than omitting alt text.

### SEO

- Meta title.
- Meta description.
- Social image.
- Optional canonical override restricted to approved same-site URLs.
- Search exclusion flag reserved for legal or temporary content.

## Content validation

- Prevent duplicate slugs.
- Prevent publishing a product without a category or image.
- Require alt text for meaningful images.
- Prevent WhatsApp, phone, map, and external URLs from using unexpected
  protocols or hosts.
- Enforce sane text lengths without truncating rendered copy.
- Surface broken references in Studio.
- Provide preview links for products, categories, collections, and pages.

## Import workflow

Folder-based product gallery requests follow the end-to-end
[product gallery ingestion workflow](product-gallery-ingestion.md). That
workflow produces both approved-background images and matching metadata; image
cleanup and catalog preparation are not separate deliveries.

1. Duplicate the catalog CSV template.
2. Assign one approved category and purity per product.
3. For Idols, assign Idol Construction, all represented deities, and the next
   approved item code; for Coin, assign a coin shape.
4. Use collection names consistently.
5. Match `image_filenames` to files in the asset delivery.
6. Validate required columns and duplicates.
7. Import product metadata as drafts.
8. Use the approved gallery outputs and attach their matching images; do not
   substitute generic-background intermediates.
9. Review every product preview.
10. Publish only after owner/catalog-admin approval.

## Image standards

- Use real product or showroom photography.
- Do not use invented or geometry-altering AI product imagery in production.
  AI-assisted background compositing and restrained retouching are allowed
  when the real source photograph remains the sole source of truth.
- Preserve sufficient resolution for responsive crops.
- Avoid watermarks, screenshots, messaging-app compression, and inconsistent
  colored backgrounds where possible.
- Recommended catalog master: square or 4:5 portrait with safe central framing.
- For folder-based gallery ingestion, use the approved DDA Silver background at
  `public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png`
  and deliver 1254 x 1254 PNGs.
- Recommended hero master: landscape with subject-safe space for responsive
  crops.
- Record missing, low-resolution, poorly lit, or duplicate images in the asset
  inventory and targeted reshoot list.

## Revalidation

A signed Sanity webhook should send document type, document ID, and current
slug. The website maps the change to affected paths:

- Product: its product route, category routes, collection routes, products
  index, sitemap, and homepage when featured.
- Category: category route, products index, navigation where applicable, and
  sitemap.
- Collection: collection route, products index, homepage when featured, and
  sitemap.
- Page/settings: the direct page plus layouts or metadata that consume the
  singleton.

## Automatic image delivery and SEO

Published product, category, and collection images are delivered directly from
the Sanity image CDN. The website generates a bounded responsive `srcset` with
`w`, `q`, `fit=max`, and `auto=format`; the Next.js Image Optimization endpoint
is not part of this path. Sanity selects AVIF or WebP when the browser supports
it and never receives a requested width larger than the uploaded master.

The catalog boundary also appends a stable descriptive vanity filename derived
from the product, category, or collection slug. This happens automatically for
existing assets and every future upload, so the hash-only Sanity asset filename
is not exposed as the public SEO filename. Product JSON-LD and the image sitemap
reuse the same URL. Social-card rendering pins the product source to JPEG for
predictable crawler support.

Alternative text remains editorial content: it must accurately describe the
visible image and is required in Sanity Studio. The website preserves authored
alt text and supplies a deterministic title-based fallback for legacy or direct
API imports that omitted it. An intentionally decorative rendering may still
use `alt=""` when the same meaning is already present in adjacent text.

Local files under `public/` are served directly and should be compressed to
their intended display dimensions before being added; they do not depend on an
external hosting-provider image optimizer.

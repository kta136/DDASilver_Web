# Product gallery ingestion

This is the default workflow for a folder of product photographs that must be
prepared for the DDA Silver gallery or Sanity. It applies to utensils and is
the baseline for other product categories unless a category-specific pipeline
defines stricter rules.

## Definition of done

A gallery-preparation request is one end-to-end delivery. The first pass must
include all of the following unless the requester explicitly excludes a step:

- one approved-background gallery image for every source photograph;
- stable, upload-friendly filenames;
- a unique product title, short description, and image alt text for every item;
- purity, weight, and the applicable height, width, or diameter;
- a validated Sanity manifest and a human-review CSV;
- an explicit list of publish blockers, including missing measurements or
  schema fields.

Returning only cleaned or neutral-background PNGs is incomplete.

## Image workflow

Use the approved 1254 x 1254 DDA Silver gallery background:

`public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png`

The original product photograph is the sole source of truth. AI-assisted
compositing is allowed for background replacement and restrained photographic
cleanup. Preserve the product's exact silhouette, proportions, rim, base,
surface finish, engraving, decorative bands, component count, and handmade
character. Do not invent hallmarks, accessories, text, logos, or product
details. Remove measurement stickers and unwanted photographer/camera
reflections from the image; retain those measurements as metadata.

Output requirements:

- 1254 x 1254 PNG;
- complete product visible with consistent central framing and safe padding;
- lighting and contact shadow matched to the approved background;
- neutral, believable silver colour without clipped highlights;
- no overlaid product text, watermark added by the editor, or borders;
- source files remain unchanged.

If an approved background is present, do not substitute a generic white or
neutral studio background in the first pass.

## Metadata workflow

Create metadata at the same time as each image. For utensils use
`category-utensils` and the confirmed purity supplied with the batch.

Required per-item values:

| Value | Rule |
| --- | --- |
| `number` | Stable sequence matching the output filename |
| `id` | Stable Sanity document ID |
| `title` | Customer-facing name; do not use the source filename |
| `slug` | Unique, lowercase, hyphenated slug |
| `shortDescription` | Unique plain-text description, 20–240 characters |
| `alt` | Visible-product description, 12–180 characters |
| `purity` | Sanity value such as `99.80` |
| `weightGrams` | Positive numeric weight from the source label or owner |
| physical dimension | Use the applicable `heightInches`, `widthInches`, or `diameterInches` |
| `imagePath` | Repository-relative path to the final PNG |
| `reference` | Stable internal item code when an approved code family exists |

The uploaded master filename remains useful for operations, but it is not the
customer-facing image URL. At read time the website automatically appends a
stable, descriptive Sanity vanity filename derived from the product slug and
gallery position. It also generates responsive modern-format variants directly
on Sanity's CDN. Keep writing image-specific alt text: the runtime fallback is a
safety net for legacy or direct API imports, not a replacement for reviewing
what is actually visible.

Descriptions should identify the utensil type and visible design, state the
confirmed purity naturally, and include the supplied measurements without
making unsupported quality, price, stock, or availability claims. Similar
sizes still need distinct, accurate descriptions based on their visible band,
rim, finish, or profile.

For round bowls, record `diameterInches` rather than an ambiguous width. For
tumblers and cups, record `heightInches`; include `widthInches` only when a
verified width is supplied. Never infer an unlabelled physical measurement
from image pixels.

Physical dimensions are optional for `category-purse`. Record verified purse
dimensions when the owner supplies them, but do not block gallery readiness,
Sanity asset upload, or product publication solely because a purse has no
height, width, or diameter. Weight and confirmed purity remain required for
purse products.

Use `utensilType: "bottle"` for bottles in `category-utensils`. Bottle height
is the applicable physical dimension when supplied. Do not classify bottles as
jugs or leave their utensil type unset.

## Sanity readiness

The delivery manifest must declare its status rather than implying it is ready:

```json
{
  "schemaVersion": 1,
  "batchId": "descriptive-batch-id",
  "categoryId": "category-utensils",
  "readyForSanityAssetUpload": true,
  "readyForProductPublish": false,
  "publishBlockers": [],
  "products": []
}
```

Run the relevant uploader in dry-run mode before calling the batch ready. Do
not upload or publish until the user authorizes that external write.

The product schema supports `weightGrams`, `heightInches`, `widthInches`,
`depthInches`, `diameterInches`, `singhasanWidthInches`,
`singhasanDepthInches`, and structured `sizeVariants` containing verified
weight-and-diameter pairs. Keep the
supplied measurement in both the applicable Sanity field and the
customer-facing `shortDescription`. Never infer an unavailable measurement
from pixels or copy a diameter into width. Singhasan width is measured
left-to-right and singhasan depth back-to-front; neither value represents an
overall jhula dimension.

Use `category-jhula` for every Jhula product. Sindoor Dani and other gift items
remain in `category-gifts`. Jhula references use the sequential `JH-NN` format.

Catalog item cards display height and width independently when their dedicated
fields are present. A missing field stays hidden; do not insert placeholder or
inferred values merely to fill the card metadata line.

Jhula cards display a complete singhasan pair as
`Singhasan: <width> × <depth> in`. Do not publish a partial pair or relabel the
singhasan measurements as overall jhula width or depth.

## Final validation

Before handoff, confirm:

1. source count, final-image count, and manifest product count match;
2. every image uses the approved background and opens successfully;
3. every filename, product number, image path, title, slug, and alt text maps to
   the same source item;
4. purity and measurements match the source label or owner-provided values;
5. titles, slugs, references, and descriptions are unique;
6. all schema limitations or missing owner decisions appear in
   `publishBlockers`.

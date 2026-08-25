# Pics gallery validation — 2026-08-25

## Image delivery

- Original source JPEGs: 67
- Gallery products after owner-requested exclusion: 66
- Final gallery PNGs: 66
- Manifest products: 66
- Dimensions: all 66 gallery images are 1254 × 1254 pixels
- Unique final files: 66 distinct SHA-256 hashes
- Background treatment: approved warm-ivory DDA Silver watermark background visually reviewed on all 66 gallery images
- Original item 33 remains unchanged; its generated gallery image was moved to `docs/product-gallery-approvals/pics-2026-08-25/excluded/`
- Source photographs were not modified

## Metadata validation

- Unique document IDs: 66
- Unique references: 66
- Unique slugs: 66
- Source-to-image mappings present: 66 of 66, plus one explicitly excluded source
- Categories: 38 Gifts, 2 Jhula, 7 Idols, 19 Utensils
- Purity: all 66 products owner-confirmed as 92.5%
- Description lengths: 108–155 characters
- Alt-text lengths: 49–88 characters

## Sanity dry run

Command:

```text
node scripts/sanity/upload-mixed-gallery-products.mjs --manifest=public/images/gallery-ingestion/pics-2026-08-25/sanity-gallery-manifest.json
```

The dry run completed successfully with exit status 0 and made no Sanity writes. It validated 66 prospective image asset uploads and 66 prospective product documents.

Owner resolutions applied:

- Original items 11–17 and 20–23 are Hatri products used for Diwali puja. Their titles, slugs, descriptions, alt text, and filenames were corrected; no obsolete product-term references remain in the delivery.
- JH-18 singhasan: 5 × 4 in.
- JH-19 singhasan: 5 × 3 in.
- Dimensions waived for original items 24 and 37.
- Original item 33 excluded from the gallery delivery.
- All seven idol products confirmed semi-solid and assigned valid `SSM` references.
- Original item 58 outer diameter: 7.5 in.; the raw `7.5/6.5 inch` label remains preserved in the manifest.

`readyForSanityAssetUpload` and `readyForProductPublish` are both true. No blockers remain.

## Sanity publication

- Target: `f6i0fy2f/production`
- Uploaded and hash-verified image assets: 66
- Published new product documents: 66
- Replaced existing products: 0
- Read-back product documents: 66
- Read-back gallery images: 66
- Manifest-to-dataset field mismatches: 0
- Invalid gallery images or dimensions: 0
- Draft documents: 0
- Hatri titles: 11
- Obsolete product-term references: 0
- Removed item 33 documents: 0

The production read-back matched every manifest title, slug, reference, description, category, purity, measurement, idol field, display order, alt text, and asset ID.

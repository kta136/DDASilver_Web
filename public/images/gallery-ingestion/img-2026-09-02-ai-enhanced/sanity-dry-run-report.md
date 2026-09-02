# Sanity publication report — img-2026-09-02-ai-enhanced

## Outcome

The validated batch was uploaded to Sanity project `f6i0fy2f`, dataset `production`, on 2026-09-02:

- product documents created: 18
- image assets uploaded and mapped: 18
- idols: 14
- utensils: 3
- singhasans: 1
- product documents replaced: 0
- remaining blockers: 0

Pre-publication validation:

```powershell
node scripts/sanity/upload-mixed-gallery-products.mjs --manifest=public/images/gallery-ingestion/img-2026-09-02-ai-enhanced/sanity-gallery-manifest.json
```

Exit status: `0`. The manifest, image assets, prospective product documents, taxonomy references, live product IDs, slugs, and item references passed validation before the write.

## Resolved metadata and item codes

1. All 18 products use the owner-confirmed `92.5%` purity value.
2. Product 8 records the owner-confirmed weight of `90 g`; its original `Weight 90hm` label is preserved as audit metadata.
3. Solid idols use the new canonical `SM-<FAMILY>-<SEQUENCE>` format. The mixed uploader now validates hollow (`HM`), semi-solid (`SSM`), and solid (`SM`) references according to `idolConstruction`.
4. The new owner-approved families are `ND` for Nandi, `KD` for Kaila Devi, and `TR` for auspicious turtle.
5. All 14 solid idol references were allocated after reserving `SM` equivalents for the 11 live solid products that currently carry legacy `HM` references.

## Taxonomy seed verification

Lakshman, Nandi, Kaila Devi, Auspicious Elephant, and Auspicious Turtle were seeded into project `f6i0fy2f`, dataset `production`, and queried back successfully.

## Publication verification

The product transaction created 18 documents at `2026-09-02T09:18:13Z`. A non-CDN read-back compared every published document to the local manifest and asset mapping:

- 18 of 18 product documents found;
- 18 of 18 products use `92.5` purity;
- 14 of 14 idol products use solid construction;
- 18 of 18 gallery images resolve at 1254 × 1254;
- every title, slug, reference, category, measurement, deity reference, image asset, and alt text matches;
- product 8 is stored at `90 g`;
- verification errors: 0.

# Desktop Files gallery ingestion audit

Batch: `desktop-files-2026-08-22`

## Delivery status

- Source JPEGs found: 80
- Final gallery PNGs: 80
- Final image size: 1254 x 1254 pixels
- Prospective Sanity product documents: 76
- Alternate gallery images linked to parent products: 4
- Ready for Sanity image-asset upload: yes
- Ready for Sanity product publication: no
- Sanity writes performed: none

## Image treatment

Every final image was created with the AI image-generation/editing tool using its corresponding real product photograph as the sole product source of truth. The approved background was supplied as a reference on every generation:

`public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png`

The user-approved treatment reference was:

`public/images/silver-coins/files-2026-08-22-approval/001-benjamin-franklin-rectangular-silver-bar-5g-ai-enhanced-v2.png`

The treatment requested premium catalogue lighting, restrained colour correction, controlled reflections, crisp engraving, dimensional depth, and realistic contact shadows. Prompts explicitly prohibited redesigned products, changed proportions, added or removed decorative details, invented accessories, overlaid product text, and extra props. No local built-in image-processing script was used to create the gallery images.

The three WhatsApp JPEGs were discovered during the final source-count audit and were added as records 078-080. Their source labels supplied 11 in / 950 g, 10 in / 500 g, and 8 in / 475 g respectively.

Two rejected first-pass packaged-gold renders that introduced extra props are retained outside the delivery set for audit at:

`public/images/gallery-ingestion/desktop-files-2026-08-22/excluded-ai-renders/`

## Source preservation

The source folder was read only; output files were written under the repository. The manifest records an SHA-256 checksum for every source JPEG so future checks can detect changes.

## Metadata coverage

- 57 silver coin/bar records use the intended `category-coin` category and owner-confirmed `99.80` purity. Two-tone designs are recorded as gold-polished silver, not gold products.
- 4 card-packed fine-gold bar records use `category-gold`, material `gold`, and owner-confirmed `99.50` purity. The 2 packaged Queen Victoria gold coin records use the same category and material with owner-confirmed `91.60` purity. Any visible card marking is retained separately as `sourcePurityMarking` for traceability.
- 4 purse records use `category-purse` with owner-confirmed `92.5` silver purity.
- 13 Pooja Thali Set records use `category-utensils`, owner-confirmed `92.5` silver purity, and `utensilType: pooja-thali-set`.
- Five packaged gold records retain the supplied ±0.03 g weight tolerance.
- Four single-face coin photographs are linked as alternate gallery images rather than duplicate product documents: 058 to 067, 068 to 070, 069 to 060, and 077 to 065.

## Validation result

The repository mixed-gallery validator found all 80 source mappings and all 80 final PNGs. All image files opened as 1254 x 1254 PNGs. Numbers, IDs, references, titles, slugs, descriptions, alt text, source paths, source checksums, and image paths are unique.

The Sanity schema and mixed-gallery pipeline now support Coin, Gold Coins & Bars, material, 91.60% and 99.50% gold purities, Pooja Thali Sets, and scalloped coin shapes. Coin and bar dimensions are intentionally not required for this batch by owner instruction.

Records 038, 047, 048, and 053 are recorded at the owner-confirmed weight of 10 grams each. Record 066 is recorded at the owner-confirmed diameter of 10 inches.

There are no remaining metadata publish blockers. On 2026-08-22, the owner authorized the Sanity upload and publication.

The final upload targeted `f6i0fy2f/production`. Sanity hash verification confirmed 80 unique uploaded assets with zero missing files. The Gold category was seeded, 76 product documents were published, and four alternate source records were attached to their parent galleries. Direct dataset verification found 76 documents, 80 gallery images, four multi-image products, and no invalid Gold, Coin, or Pooja Thali metadata. The deployed Gold category and a representative Gold product were also verified through the protected production site.

## Files

- Gallery images: `public/images/gallery-ingestion/desktop-files-2026-08-22/`
- Source-truth manifest: `docs/product-gallery-approvals/desktop-files-2026-08-22/manifest.json`
- Human-review CSV: `docs/product-gallery-approvals/desktop-files-2026-08-22/review.csv`
- Reproducible metadata builder: `scripts/images/build-desktop-files-gallery-manifest.mjs`

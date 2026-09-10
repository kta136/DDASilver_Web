# Sanity dry-run report — img-2026-09-10

No Sanity assets or product documents were uploaded or changed.

The delivery contains 23 source photographs, 23 unique 1254 × 1254 PNG images, and 23 metadata records. All PNGs decoded successfully. Source originals and preserved copies match SHA-256 hashes. The repository delivery validator passed with zero errors; publication remains blocked.

Command run:

`node --import tsx scripts/sanity/upload-mixed-gallery-products.mjs --manifest=public/images/gallery-ingestion/img-2026-09-10/sanity-gallery-manifest.json`

Exit code: 1. The only remaining schema errors are missing owner-confirmed purity for 23 products and pending item references for 11 products. Full output is in sanity-dry-run.log. Duplicate alt text found during the initial run was corrected and the check rerun.

Required before upload/publication:

- Labour amount and unit (INR per gram or per piece/complete item) for all 23 records, explicitly requested by the owner before upload. No category default has been substituted.
- Silver purity for the batch or per item.
- Names/categories for the ceremonial sets, canopy stand, cylindrical pedestals, tripod display and lidded vessel; final references follow those decisions.
- Whether the 650 g label on item 3 and 450 g label on item 4 are per piece or for the complete pictured set.
- Item 5 visual limitation: its original photograph clips the top loop. The generated preview completes an outline that cannot be verified; resolve from an uncropped source or explicit owner confirmation before upload.
- Item 10 has no matching diya subtype in the utensil schema; it is provisionally assigned to Gifts and retains a category/reference blocker.

The read-only catalogue audit checked 631 existing products in f6i0fy2f/production at 2026-09-10T08:47:25.543Z. Proposed utensil codes and all slugs/IDs have 0 collisions against that snapshot. Recheck live references before publication.

The manifest's readyForSanityAssetUpload flag records file/hash readiness as required by the repository validator; it is not upload authorization. uploadStatus and uploadBlockers explicitly hold the batch. readyForProductPublish is false.

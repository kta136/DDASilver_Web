# DDA Silver — two-product preparation, 30 October 2026

Prepared two 1254 × 1254 PNGs using the built-in image generator, the approved DDA Silver background and the newer approved October handbag treatment. The three source photos depict two products; the extra shrine photo is retained as corroboration and does not create a third product.

| Product | Weight | Purity | Published reference |
| --- | ---: | --- | --- |
| Twin Peacock Enamel Silver Purse | 660 g | 92.5% | PR-50 |
| Om Ganesha Silver Singhasan with Elephant Base | 5,616 g | 92.5% | SG-27 |

Open [review.html](review.html) to review both images and metadata. The [Sanity manifest](sanity-gallery-manifest.json), [review CSV](gallery-review.csv), [prompt audit](imagegen-prompts.md), [validation report](validation-report.json) and [image/source verification](image-and-source-verification.json) are included.

## Publication status

Both products and their two images are published in Sanity production and verified. No publication blockers remain. Singhasan dimensions are intentionally blank per the owner’s explicit instruction on 30 October 2026. See [publication report](sanity-publication-report.json).

The owner confirmed the Singhasan category and corrected the purse making charge to ₹90/g, superseding the earlier ₹50/g reply. The purse has no remaining metadata blockers. References PR-50 and SG-27 are now published.

Purse dimensions are optional under the repository policy. Both purities were confirmed by the owner in this chat. Weights were transcribed from the original overlays.

## Validation and preservation

- Two products, two unique final images, three preserved source photographs.
- Both opaque PNGs decode fully at exactly 1254 × 1254.
- Both saved PNGs match their generated originals byte for byte.
- All three original and archived source hashes match.
- The repository mixed-gallery dry run passed with no publication blockers or schema errors.
- Sanity f6i0fy2f/production: two uploaded image assets and two published product documents verified.
- Owner authorized both product uploads. The purse making charge is stored as ₹90/g; all Singhasan dimension fields remain blank.

Original backups and read-only catalogue snapshots are in output/gallery-ingestion/whatsapp-two-products-2026-10-30/ at the repository root. Existing unrelated workspace changes were left in place.

## Re-run validation

~~~powershell
node .agents/skills/dda-silver-gallery-images/scripts/validate-delivery.mjs public/images/gallery-ingestion/whatsapp-two-products-2026-10-30/sanity-gallery-manifest.json --write-review-csv --write-validation-report
node --import tsx scripts/sanity/upload-mixed-gallery-products.mjs --manifest public/images/gallery-ingestion/whatsapp-two-products-2026-10-30/sanity-gallery-manifest.json
~~~

The original generation prompts are recorded verbatim in imagegen-prompts.md. No CLI/API fallback or post-generation resizing was used.

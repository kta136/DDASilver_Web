---
name: dda-silver-gallery-images
description: Prepare DDA Silver product-photo folders for the website gallery or Sanity using the approved branded background, owner-approved AI treatment, verified product metadata, and the repository upload workflow. Use for image cleanup, background replacement, batch gallery preparation, manifests, approval packs, or Sanity publication in this repository.
---

# DDA Silver gallery images

Prepare a complete, reviewable gallery delivery. Preserve every source photograph unchanged and preserve the real product as the sole source of visual truth.

## Authoritative inputs

Before acting:

1. Read the repository `AGENTS.md` and [product gallery ingestion](../../../docs/product-gallery-ingestion.md).
2. For idols, also read [idol image pipeline](../../../docs/idol-image-pipeline.md) and [idol item codes](../../../docs/idol-item-codes.md).
3. Use the exact approved background at `public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png`. Never substitute an inferred white, cream, or studio background.
4. Use `public/images/gallery-ingestion/img-2026-08-30-approval/images/01-pink-rose-enamel-rectangular-silver-gift-box-7x5.png` as the owner-approved treatment reference unless a later approval manifest names a newer reference.

## Approval boundary

For a new visual treatment, create exactly two previews and obtain owner approval before processing the remaining sources. Approval of those previews authorizes that treatment for the active batch, but does not by itself authorize a Sanity write unless the active request also asked to publish or upload.

Do not upload rejected previews. Save revisions under new filenames rather than overwriting them.

## Image workflow

Inventory supported source images and order WhatsApp photos by their embedded filename timestamp. Inspect every local source with the image viewer before editing it.

Use the built-in image editor once per product. Supply three explicitly labelled references:

- Image 1: edit target and sole source of product truth.
- Image 2: exact approved 1254 × 1254 DDA Silver background.
- Image 3: owner-approved treatment reference for scale, centering, restrained cleanup, and contact shadow.

Use this shared prompt contract, adding one accurate product-specific subject sentence:

```text
Use case: compositing
Asset type: square Sanity gallery product image for DDA Silver
Primary request: Remove the existing background, hands, props, measurement overlay, labels, stickers, tape, and text outside the product. Place the unchanged complete product onto the exact approved DDA Silver background from Image 2 and match the restrained catalogue treatment in Image 3. Enhance only white balance, neutral silver colour, lighting, reflections, edge cleanup, and presentation.
Composition/framing: square 1254 × 1254; full product visible; comfortable safe margins; bottom-right DDA Silver lockup unobstructed; subtle natural contact shadow.
Constraints: Preserve the exact silhouette, proportions, construction, component count, openings, embossing, engraving, stones, enamel colours, attachments, textures, and handmade character. Do not redesign, invent, remove, merge, relocate, or repair product details. Preserve Image 2's faint central watermark, copper monogram, and exact black text "DDA Silver". Add no other text, logo, prop, border, packaging, or watermark.
```

Reject and regenerate an output if the product geometry changed, branding is misspelled or missing, the product is cropped, the source overlay remains, or the result is not square. Save approved outputs under `public/images/gallery-ingestion/<batch-id>/images/` using stable descriptive filenames. Validate every final PNG as exactly 1254 × 1254.

For a large batch, keep the user informed at least once per minute. Do not use one generated variant as a substitute for separate edits of distinct source products.

## Metadata and validation

Create metadata while processing images. Record only measurements visible in the source label or explicitly supplied by the owner; remove label text from the output but retain it in metadata. Do not infer dimensions from pixels or guess purity, construction, deity identity, or item-code family when uncertain.

For custom-fit phone-cover designs, treat the handset shown in the source as a presentation mockup. Do not publish a pictured phone model in the product ID, title, slug, description, alt text, or Sanity asset filename unless the owner explicitly says the design has fixed model compatibility. Describe the product as made to fit any phone size.

Publish custom-fit phone-cover designs in `category-phone-covers`, not Gifts. Check live Sanity references before allocating the next unique sequential `PH-NN` code.

Produce a Sanity-ready manifest, human-review CSV, prompt audit, and validation report. Include stable IDs, titles, slugs, concise unique descriptions, descriptive alt text, category, material, purity, weight, applicable physical dimensions, source path, image path, and item reference. Put missing or schema-incompatible values in `publishBlockers`; never silently drop them.

Confirm source count, final-image count, manifest count, filename mappings, unique identifiers, dimensions, and image readability. Run the relevant existing uploader in dry-run mode before any write.

## Sanity writes

Sanity publication is an external mutation. Apply it only when the active user request explicitly authorizes upload or publication and all blockers are resolved. Reuse the repository's existing uploader, do not create a new service, and verify the published document and image counts after the transaction. Approval or publication never authorizes OCI changes.

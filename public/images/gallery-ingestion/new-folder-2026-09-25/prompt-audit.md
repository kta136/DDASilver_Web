# Prompt and image-treatment audit

Batch: `new-folder-2026-09-25`
Date: 2026-09-25
Treatment approval: owner approved the two previews for the batch.
Approved background: `public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png`
Approved treatment reference: `public/images/gallery-ingestion/img-2026-08-30-approval/images/01-pink-rose-enamel-rectangular-silver-gift-box-7x5.png`

This audit records the prompt constraints and selected generation path for each output. It summarizes the editor instructions rather than reproducing a verbatim tool transcript.

## Shared constraints

- Treat each original photograph as the sole source of truth for its product.
- Remove the existing scene and surrounding labels; preserve the product's exact geometry, proportions, materials, visible details, component count, and handmade character.
- Place the complete product on the approved background with the treatment approved in the two previews: centered square framing, safe margins, neutral silver colour, restrained cleanup, and a natural contact shadow.
- Keep the exact DDA Silver background branding visible and add no extra text, logos, props, borders, or invented product details.
- Export a 1254 × 1254 PNG. Preserve every original source photograph unchanged.

## Per-image record

### 01 — Floral Relief Silver Phone Cover

- Source: `C:\Users\kk\Desktop\New folder\WhatsApp Image 2026-09-18 at 2.01.26 PM.jpeg`
- Approved sample: `previews/01-ornate-silver-phone-cover-preview-v4.png`
- Final: `images/01-floral-relief-silver-phone-cover.png`
- Subject direction: preserve the silver cover's dark panel, raised floral relief, openings, and exact outline; do not include compatibility text or model claims in product metadata.
- Selected result: approved preview v4, a square opaque gallery PNG.

### 02 — Ornate Silver Hookah

- Source: `C:\Users\kk\Desktop\New folder\WhatsApp Image 2026-09-25 at 5.13.16 PM.jpeg`
- Sample treatment reference: the approved batch previews listed above.
- Final: `images/02-ornate-silver-hookah.png`
- Subject direction: preserve the hookah's pierced crown, engraved stem, bulbous base, blue hose, tan grip, and visible product details; fit the complete photographed assembly inside the square frame.
- Revision record: an earlier candidate cropped the hose. It was rejected and regenerated; the selected version keeps the visible assembly within the frame.

### 03 — Tesu Silver Deity

- Source: `C:\Users\kk\Desktop\New folder\WhatsApp Image 2026-09-25 at 5.13.34 PM.jpeg`
- Approved sample: `previews/02-ornate-silver-devotional-swing-preview-v3.png`
- Final: `images/03-tesu-silver-deity-ornate-arch.png`
- Subject direction: preserve the Tesu deity, seated figure, ornate arch, and carved supports without changing visible details. The owner classified this as a deity product under Idols, not as a Jhula.
- Selected result: generated product cutout composited with `sharp` onto the exact approved background; the resulting opaque PNG was reviewed at 1254 × 1254.

## Validation notes

The two sample images received owner approval before processing the remaining source. Selected final files were reviewed for framing and branding, and their dimensions and opacity were checked. The final delivery validator records source hashes, mappings, PNG dimensions, blockers, and readiness in `validation-report.json`.
# AI generation prompt audit — img-2026-09-02-ai-enhanced

## Execution

- Mode: built-in `image_gen`, one edit call per source product.
- Image 1: the individual source JPEG and sole source of product truth.
- Image 2: `public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png`.
- Image 3: `public/images/gallery-ingestion/img-2026-08-30-approval/images/01-pink-rose-enamel-rectangular-silver-gift-box-7x5.png`.
- Output: one 1254 × 1254 PNG per source under this batch's `images/` folder.

## Shared prompt contract

```text
Use case: compositing
Asset type: square Sanity gallery product image for DDA Silver
Input images: Image 1 is the edit target and sole source of product truth; Image 2 is the exact approved DDA Silver background; Image 3 is the owner-approved treatment reference for scale, centering, restrained cleanup, and contact shadow.
Primary request: Remove the existing blue fabric or display-box background and the weight/measurement label from Image 1. Place the unchanged complete product onto the exact approved DDA Silver background from Image 2 and match the restrained catalogue treatment in Image 3. Enhance only white balance, neutral silver colour, lighting, reflections, edge cleanup, and presentation.
Composition/framing: square; full product visible; comfortable safe margins; bottom-right DDA Silver lockup unobstructed; subtle natural contact shadow.
Constraints: Preserve the exact silhouette, proportions, construction, component count, poses, openings, embossed and engraved patterns, decorative attachments, colours, textures, and handmade character from Image 1. Do not redesign, invent, remove, merge, relocate, or repair product details. Preserve Image 2's faint central watermark, copper monogram, and exact black text "DDA Silver". Add no other text, logo, prop, border, packaging, or watermark.
```

## Product-specific subject lines

| # | Source | Subject line |
| ---: | --- | --- |
| 1 | WhatsApp Image 2026-09-01 at 1.49.55 PM.jpeg | A four-figure Ram Darbar silver idol set with three standing deities, a kneeling Hanuman figure, an ornate raised platform, and restrained gold and painted accents. |
| 2 | WhatsApp Image 2026-09-01 at 1.51.29 PM.jpeg | An auspicious standing elephant silver figurine with lowered trunk, four visible legs, engraved blanket, and restrained gold and painted accents. |
| 3 | WhatsApp Image 2026-09-01 at 1.52.52 PM.jpeg | A reclining horned bovine silver figurine with four folded legs, long face, diamond-pattern back panel, and restrained gold and painted accents. |
| 4 | WhatsApp Image 2026-09-01 at 1.54.03 PM.jpeg | A matched pair of crowned silver devotional bust figurines, one smaller and one larger, each with a fluted base, gold halo and garland details, painted facial features, and a small animal-head motif at the lower side. |
| 5 | WhatsApp Image 2026-09-01 at 1.59.49 PM.jpeg | A low four-legged silver turtle figurine with a long neck, patterned segmented shell, and restrained gold and painted accents. |
| 6 | WhatsApp Image 2026-09-01 at 2.00.39 PM.jpeg | A silver Shivling devotional sculpture with rounded lingam, red tripundra, yoni base and spout, cobra engraving, and tiered pedestal with gold accents. |
| 7 | WhatsApp Image 2026-09-01 at 2.01.25 PM.jpeg | A seated Saraswati silver idol on a lotus base, holding and playing a long veena, with four visible arms, ornate crown, painted facial details, and silver finish. |
| 8 | WhatsApp Image 2026-09-01 at 2.02.34 PM.jpeg | A horizontal auspicious silver fish figurine with pointed snout, large round eye, engraved overlapping scales, split tail, dorsal fin, and lower fin. |
| 9 | WhatsApp Image 2026-09-01 at 3.25.53 PM.jpeg | A tall standing Radha Krishna silver idol pair on one shared oval base, Krishna holding a flute and Radha beside him, with restrained gold and painted facial accents. |
| 10 | WhatsApp Image 2026-09-01 at 3.27.01 PM.jpeg | A compact standing Radha Krishna silver idol pair on one textured rectangular base, Krishna playing a flute and Radha holding a circular garland-like element. |
| 11 | WhatsApp Image 2026-09-01 at 3.27.52 PM.jpeg | A compact seated Radha Krishna silver idol on a layered oval base, Krishna holding a horizontal flute and Radha leaning close beside him. |
| 12 | WhatsApp Image 2026-09-01 at 3.28.39 PM.jpeg | A seated Kuber silver idol on a four-legged throne, with right palm raised, left hand holding a small vessel, layered garments, ornate crown, and gold accents. |
| 13 | WhatsApp Image 2026-09-01 at 3.29.35 PM.jpeg | A compact standing Radha Krishna silver idol pair on a single rocky base, Krishna playing a horizontal flute and Radha standing closely behind and beside him. |
| 14 | WhatsApp Image 2026-09-01 at 3.31.28 PM.jpeg | A wide horizontal silver devotional sculpture of reclining Vishnu on the multi-hooded Sheshnag serpent couch, with a small seated Lakshmi figure and dense engraving. |
| 15 | WhatsApp Image 2026-09-01 at 6.20.00 PM.jpeg | A tall cylindrical silver bottle with rounded shoulder, ridged cap, hammered dotted texture, polished bands, and a large ornate butterfly relief panel. |
| 16 | WhatsApp Image 2026-09-01 at 6.21.03 PM.jpeg | A tall cylindrical silver bottle with rounded shoulder, ridged cap, densely engraved repeating leaf-and-floral scrollwork, textured recesses, and polished bands. |
| 17 | WhatsApp Image 2026-09-01 at 6.23.29 PM.jpeg | A tall cylindrical silver bottle with rounded shoulder, ridged cap, engraved diamond bands, polished bands, and a floral-vine panel containing elephant motifs. |
| 18 | WhatsApp Image 2026-09-02 at 12.35.08 PM.jpeg | An ornate wide silver singhasan with high scalloped engraved backrest, engraved seat, openwork side rails, four feet, and an integrated copper-toned vase with branching stems and glossy green leaves. |

Every generated output was visually inspected for source-label removal, full-product framing, preserved component count and decorative details, and a readable unobstructed DDA Silver lockup before it was copied into the project.

## Post-generation owner confirmations

These confirmations were supplied after generation and therefore do not alter the historical prompts above:

- All 18 products: 92.5% purity.
- Products 1-14: solid construction.
- Product 3: Nandi.
- Product 4: Kaila Devi.
- Product 8: 90 g weight; the source label's `90hm` text was a typo.
- Solid idol references use `SM`; new families are `ND` for Nandi, `KD` for Kaila Devi, and `TR` for auspicious turtle.

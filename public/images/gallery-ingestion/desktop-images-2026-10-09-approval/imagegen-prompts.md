# Image-generation audit — desktop-images-2026-10-09-approval

Execution: built-in image_gen, one independent edit per selected source product. Coordinating agent: GPT-6.1 Sol, extra-high reasoning, as requested by owner. Preview scope: exactly two distinct purse products; remaining eleven await owner's approval.

Owner confirmations: purity 92% for all sources; labour INR 90 per gram. The current Sanity enum does not accept exact 92%, so that metadata remains a publication blocker rather than being rounded.

## References

Each generation receives exactly three labelled references, in this order:
1. Actual original source photo: sole source of product truth.
2. `public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png`: exact approved branded background.
3. `public/images/gallery-ingestion/img-2026-08-30-approval/images/01-pink-rose-enamel-rectangular-silver-gift-box-7x5.png`: approved treatment reference only.

Every source and both style references were inspected with view_image before editing. Source photographs remain unchanged.

## Preview 1 — multicolour floral enamel silver handbag, 400 g

Source number: 1.
Source: `C:/Users/kk/Desktop/images/WhatsApp Image 2026-10-09 at 2.19.13 PM.jpeg`.
Output: `images/01-multicolour-floral-enamel-silver-handbag-400g.png`.

Full submitted prompt:

```text
Use case: compositing
Asset type: square Sanity gallery product image for DDA Silver
Input images: Image 1 is the edit target and sole source of truth for the product. Image 2 is the exact approved 1254 x 1254 DDA Silver background. Image 3 is the owner-approved treatment reference, used only for catalogue scale, centering, restrained cleanup and natural contact shadow. The object in Image 3 must not appear in the output.
Primary request: Remove the existing dark green fabric background, any hands, display props, the weight measurement overlay, labels, stickers, tape, and text outside the product. Place the unchanged complete product onto the exact approved DDA Silver background from Image 2 and match the restrained catalogue treatment in Image 3. Enhance only white balance, neutral silver colour, lighting, reflections, edge cleanup, and presentation.
Composition/framing: square 1254 x 1254; full product visible in the same front view; centrally framed with comfortable safe margins; bottom-right DDA Silver lockup unobstructed; subtle natural contact shadow.
Constraints: Preserve the exact silhouette, proportions, construction, component count, openings, embossing, engraving, stones, enamel colours, attachments, textures, and handmade character. Do not redesign, invent, remove, merge, relocate, or repair product details. Preserve Image 2's faint central watermark, copper monogram, and exact black text "DDA Silver" with the same placement, shape, and scale as Image 2. Add no other text, logo, prop, border, packaging, or watermark. Product remains photographic, with silver texture and the source's original gold-tone accents retained.
Subject: The exact silver handbag from Image 1: a broad tapered rectangular purse body with softly rounded bottom corners, curved flap, dense small five-petal floral enamel pattern in orange, lilac and light green, dark recessed silver vine/openwork texture, gold-tone braided edge bands and corner flowers, centred circular ring clasp, and one large engraved circular arch handle with two spherical mounts. Preserve every visible floral element and its colour, the handle/body size ratio, all border and clasp geometry. The handbag has no shoulder chain in Image 1; do not add one. Remove only the "400gm" overlay and the background.
```

## Preview 2 — vine enamel peacock ornament silver clutch, 459 g

Source number: 3.
Source: `C:/Users/kk/Desktop/images/WhatsApp Image 2026-10-09 at 2.20.55 PM.jpeg`.
Output: `images/02-vine-enamel-peacock-ornament-silver-clutch-459g.png`.

Source number 2 (258 g raised-flower purse) was inspected but not generated. Its shoulder chain extends outside both sides and the bottom of the original photograph. Its unseen full length and hidden links cannot be inferred. The next complete visible product was selected for the second approval preview, with parent coordinator agreement.

Full submitted prompt:

```text
Use case: compositing
Asset type: square Sanity gallery product image for DDA Silver
Input images: Image 1 is the edit target and sole source of truth for the product. Image 2 is the exact approved 1254 x 1254 DDA Silver background. Image 3 is the owner-approved treatment reference, used only for catalogue scale, centering, restrained cleanup and natural contact shadow. The object in Image 3 must not appear in the output.
Primary request: Remove the existing dark green fabric background, any hands, display props, the weight measurement overlay, labels, stickers, tape, and text outside the product. Place the unchanged complete product onto the exact approved DDA Silver background from Image 2 and match the restrained catalogue treatment in Image 3. Enhance only white balance, neutral silver colour, lighting, reflections, edge cleanup, and presentation.
Composition/framing: square 1254 x 1254; full product visible in the same front view; centrally framed with comfortable safe margins; bottom-right DDA Silver lockup unobstructed; subtle natural contact shadow.
Constraints: Preserve the exact silhouette, proportions, construction, component count, openings, embossing, engraving, stones, enamel colours, attachments, textures, and handmade character. Do not redesign, invent, remove, merge, relocate, or repair product details. Preserve Image 2's faint central watermark, copper monogram, and exact black text "DDA Silver" with the same placement, shape, and scale as Image 2. Add no other text, logo, prop, border, packaging, or watermark. Product remains photographic, with silver texture and the source's original gold-tone accents retained.
Subject: The exact 459g silver clutch purse from Image 1, photographed in its original front view: broad rectangular body with rounded bottom corners and a curved flap, fine silver openwork foliage with gold-tone curling stems and tiny gold flowers, turquoise-blue and green enamel leaves, and an elongated centred clasp with a pink-and-green circular floral accent. Preserve the large ornamental cluster on the upper right of the flap: two silver bird forms and long raised feathers around a pink-and-green flower above a pale blue oval tree motif, surrounding magenta and green stones, plus the hanging magenta and pale blue bead fringe. Keep all ornaments in their original locations and relative scale, and retain their true shapes, colours, counts and original gold-tone accents. The clutch has no handle or shoulder strap visible in Image 1; do not add one. Remove only the "459gm" overlay and background.
```

## Validation policy

Generated outputs are copied non-destructively into the project. PNG readability and 1254 x 1254 dimensions are validated with sharp. Only mechanical resizing is allowed if a tool output requires exact dimensions; no manual visual compositing or constructed edits are used. Original generated master files remain under the built-in tool's returned generated_images path.

Visual QA checks original product silhouette, proportions, handle/clasp forms, ornament placement, enamel colours, attachments, safe margins, removal of source weight labels, and the branded background. Human owner approval remains required before processing the eleven other sources.

## Generated outputs and QA

Exactly two independent edits completed; no retries and no additional source generations. Both built-in outputs are natively readable PNGs at 1254 x 1254; neither required resizing. Copies in the project were re-opened with view_image and fully decoded by sharp for readability checks. Background lockup text is legible as "DDA Silver", source weight labels are absent, selected product fronts are complete with safe margins, and the major geometry, ornament placement, colours and attachments match the selected source photos. Fine decorative details remain subject to owner review, so no claim of pixel-identical product reproduction is made.

Preview 1 generated master: `C:/Users/kk/.codex/generated_images/01a1201a-4f88-7333-862d-3e076b55c547/exec-de8c78f5-d3d4-4ced-9297-f6e6429166bb.png`.

Preview 2 generated master: `C:/Users/kk/.codex/generated_images/01a1201a-4f88-7333-862d-3e076b55c547/exec-843d89f7-d4bc-4bbe-8359-81989fe673e7.png`.

See `preview-image-validation.json` for output hashes and `visual-inventory.json` for all thirteen source inspections and readable weights. No Sanity writes performed.


## Owner approval and purity correction

On 2026-10-09 the owner approved both previews, authorized continuation for the remaining images, and corrected purity to 92.5% for all13 products. The earlier92% preparation note above is superseded. Labour remains INR90/g. Full delivery: public/images/gallery-ingestion/desktop-images-2026-10-09.

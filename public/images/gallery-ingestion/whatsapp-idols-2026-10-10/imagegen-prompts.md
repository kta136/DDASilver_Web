# Image-generation audit — whatsapp-idols-2026-10-10

Existing visual treatment is owner-approved; no new treatment approval gate. User confirms 92.5% purity, semi-solid construction, photographed weights as complete pair totals, and labour INR 15 per gram. This image subtask does not create or edit Sanity metadata and performs no Sanity writes.

GPT-6.1 Sol with extra-high reasoning coordinates one separate built-in image_gen edit per source. Every original source and both style references were inspected with view_image before editing. Original photographs remain unchanged. Image titles and filenames contain no weight or height.

Reference order for each call:
1. Original source photograph: sole truth for the exact figurine pair.
2. `public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png`: exact approved fixed branded background.
3. `public/images/gallery-ingestion/desktop-images-2026-10-09-approval/images/01-multicolour-floral-enamel-silver-handbag-400g.png`: owner-approved treatment reference only.

Applicable instructions read: AGENTS.md, docs/product-gallery-ingestion.md, dda-silver-gallery-images SKILL.md, imagegen SKILL.md, docs/idol-item-codes.md. Referenced docs/idol-image-pipeline.md is absent; parent searched for it and instructed use of the remaining authoritative gallery instructions for this image subtask.

Shared prompt:

```text
Use case: compositing
Asset type: square Sanity gallery product photograph for DDA Silver
Input images: Image 1 is the actual original photograph, the edit target and SOLE authority for both silver figurines and every product detail. Image 2 is the exact approved 1254 x 1254 DDA Silver branded background and must remain the fixed canvas. Image 3 is the already owner-approved treatment reference only for neutral silver lighting, restrained cleanup, framing and subtle contact shadow; never copy its handbag, colour decoration or ornaments into this output.
Primary request: Make a faithful photographic composite of the original pair in Image 1. Remove only the external weight/height text overlay, royal-blue fabric/background and unrelated environment. Preserve both actual complete figurines together, Lakshmi on the left and Ganesha on the right. Neutralize blue lighting reflections into believable silver and refine lighting/edge cleanup without changing product geometry or sculptural details.
Composition/framing: square 1254 x 1254 PNG; entire original pair fully visible with comfortable safe margins; preserve the photograph's front perspective, original relative sizes, exact poses and relative positions; uniform scale/translation of the pair together, no independent deity rearrangement. Product pair centrally framed above the unobstructed bottom-right DDA Silver lockup, subtle natural contact shadows, no clipping of canopy, base, elephant foot, halo, limbs or held objects.
Constraints: Preserve exactly the source silhouette, proportions, component count, all arms and hands, faces and original facial expressions, crowns, trunks, hand-held objects, jewellery, clothing folds, halos, arches, base/foot construction, relief patterns, engravings, original dark oxidized recesses and handmade cast texture. Do not redesign, invent, remove, merge, relocate or repair ANY product detail. Do not idealize deity faces, add religious iconography, replace hand-held objects or invent additional fingers/limbs. Miniature engraved Om marks that are part of the actual figurines must remain unchanged; they are product details and must never be removed as an external text overlay. Remove external label only.
Background and branding: Use the exact Image 2 background at its original scale/coordinates: faint central watermark, copper monogram and exact black text "DDA Silver" all retained. Do not move/rescale branding to fit the product; place the pair on the fixed canvas. No other text, logo, prop, border, packaging or watermark. Keep silver believable with highlight texture and original dark recessed detail, no chrome plastic or clipped white highlights.
```

## Source 1

Source: `C:/Users/kk/Desktop/WhatsApp Unknown 2026-10-10 at 6.19.13 PM/WhatsApp Image 2026-10-10 at 2.52.52 PM.jpeg`.
Planned output: `images/01-lakshmi-ganesha-tiered-canopy-round-base-pair.png`.
Full submitted prompt = shared prompt above followed by this product-specific subject:

```text
Subject: The exact pair from Image 1's "Weight 315gm / Height 3inch" photograph: Lakshmi left and Ganesha right, each on its own broad circular floral-relief pedestal beneath a tall scrolling leafy arch and ornate tiered temple canopy with original tiny finials and floral/beaded bands. Preserve each circular pedestal's diameter/profile, floral border, all arch curls, tier spacing, canopy ornaments and lotus-petal halo around the crowned heads. Retain Lakshmi's four original hands, upper lotus-like objects, blessing hand and lower coin-stream detail; retain Ganesha's exact trunk curve, four original hands, upper held objects, engraved Om blessing hand and original sweet bowl. Preserve all original miniature engraving, necklace rows and cloth folds. No throne feet or square base may be added to this circular-base design.
```

## Source 2

Source: `C:/Users/kk/Desktop/WhatsApp Unknown 2026-10-10 at 6.19.13 PM/WhatsApp Image 2026-10-10 at 2.54.30 PM.jpeg`.
Planned output: `images/02-lakshmi-ganesha-compact-elephant-foot-throne-pair.png`.
Full submitted prompt = shared prompt above followed by this product-specific subject:

```text
Subject: The exact pair from Image 1's "Weight 124gm / Height 2.5inch" photograph: compact Lakshmi-left/Ganesha-right figurines on separate square scrollwork platforms, with the photographed elephant-head-shaped supporting feet, ornate scrolling back arches, lotus-petal halos and original tiered temple canopies. Preserve the compact platform proportions, front openwork bands, each visible elephant foot/head and trunk, exact foot spacing and original tiers/finials. Keep the delicate smaller-scale original figures, exact crown/facial casting, four hands and hand-held objects of each, Lakshmi's blessing/coin-stream details and Ganesha's Om palm and bowl. Do not substitute the round bases of another design or change compact platform width.
```

## Source 3

Source: `C:/Users/kk/Desktop/WhatsApp Unknown 2026-10-10 at 6.19.13 PM/WhatsApp Image 2026-10-10 at 2.57.13 PM.jpeg`.
Planned output: `images/03-lakshmi-ganesha-broad-elephant-foot-throne-pair.png`.
Full submitted prompt = shared prompt above followed by this product-specific subject:

```text
Subject: The exact pair from Image 1's "Weight 380gm / Height 4inch" photograph: Lakshmi-left/Ganesha-right figures on broad square thrones with deep scrolling/openwork front bands and the original large elephant-head-shaped feet, each beneath tall ornate scrolling arches, lotus-petal halos and tiered temple canopy roofs. Keep the broad pedestal width, taller sculptural scale, original visible elephant head/trunk feet and original side supports precisely as photographed. Preserve original arch curls, canopy tier widths, small roof finials and all dark recessed relief. Keep each deity's existing four hands and held objects, Lakshmi's facial casting/blessing/coin-stream detail and Ganesha's source trunk curve, Om palm and original bowl. Do not substitute the narrower compact throne variant or redesign faces.
```

## Source 4

Source: `C:/Users/kk/Desktop/WhatsApp Unknown 2026-10-10 at 6.19.13 PM/WhatsApp Image 2026-10-10 at 2.58.32 PM.jpeg`.
Planned output: `images/04-lakshmi-ganesha-ornate-halo-lotus-pair.png`.
Full submitted prompt = shared prompt above followed by this product-specific subject:

```text
Subject: The exact pair from Image 1's "Weight 150gm / Height 2.5inch" photograph: seated Lakshmi left and Ganesha right, each on its own richly sculpted lotus-flower base with original circular ornate halo immediately behind its crown. There is NO outer arch, roof canopy, throne or elephant foot in this design; do not add any. Preserve the original lotus petals, separate layered base silhouettes, actual crown and circular halo shapes, Lakshmi's four hands with upper lotus objects, blessing Om palm and lower coin-stream/held detail, and Ganesha's four arms and their exact original objects, Om palm, bowl, actual rightward/downward trunk curve and original ornamentation. Preserve faces exactly as cast, all small neck/chest jewellery and cloth-fold detail.
```


## Source 1 selected output

Final: `images/01-lakshmi-ganesha-tiered-canopy-round-base-pair.png`.
Generated master: `C:/Users/kk/.codex/generated_images/01a1201a-4f88-7333-862d-3e076b55c547/exec-1a2ca17f-b0c4-4703-845d-90f798efb5f3.png`.
One built-in edit, no retry, native readable 1254 x 1254 PNG. Full pair, circular floral bases, scrolling arches, tiered canopies, original poses/objects, engraved Om and antique recesses retained; external overlay and blue backdrop removed. Source photographs unchanged.


## Source 2 selected output

Final: `images/02-lakshmi-ganesha-compact-elephant-foot-throne-pair.png`.
Generated master: `C:/Users/kk/.codex/generated_images/01a1201a-4f88-7333-862d-3e076b55c547/exec-bba70da1-67b1-4f5d-96c1-d88434c01fde.png`.
One independent built-in edit; no retry. Native readable 1254 x 1254 PNG, no resizing or manual raster compositing.
Visual QA: Compact square scrollwork thrones and visible elephant-shaped feet/head trunks retained; pair positions, original crowns/halos, tiered canopies/arches, four arms and held objects, Om palm, coin stream and bowl match source. Full pair has safe margins; neutral silver with dark antique recesses, overlay/blue fabric removed, branding legible.

## Source 3 selected output

Final: `images/03-lakshmi-ganesha-broad-elephant-foot-throne-pair.png`.
Generated master: `C:/Users/kk/.codex/generated_images/01a1201a-4f88-7333-862d-3e076b55c547/exec-168ea126-9f92-42ed-9c9e-62c46e1d1712.png`.
One independent built-in edit; no retry. Native readable 1254 x 1254 PNG, no resizing or manual raster compositing.
Visual QA: Broad square pedestals with openwork front bands, original large elephant-shaped feet/head trunks, tall scrolling arches/tiered canopy and finials retained; pair order, crowns/halos, hands/objects, Om palm, coin stream and bowl match source. Full pair safely framed with neutral silver and dark recessed relief; source overlay removed; branding legible.

## Source 4 selected output

Final: `images/04-lakshmi-ganesha-ornate-halo-lotus-pair.png`.
Generated master: `C:/Users/kk/.codex/generated_images/01a1201a-4f88-7333-862d-3e076b55c547/exec-18ca432f-0a7b-45de-80c5-ddf157f6d90b.png`.
One independent built-in edit; no retry. Native readable 1254 x 1254 PNG, no resizing or manual raster compositing.
Visual QA: Separate lotus bases and crown-adjacent ornate circular halos retained, without invented outer arch/roof/throne. Source pair order, original arm poses, hand-held objects, rightward Ganesha trunk curve, Om palms, Lakshmi coin stream and Ganesha bowl retained. Full pair fits with safe margins, dark cast textures remain; blue cast and external overlay removed; branding clear.

All four requested source pairs have separate selected outputs. No rejected attempts or generation retries. Source photographs remain unchanged. No metadata or Sanity writes performed by the image agent.

Final validation: four selected native 1254 x 1254 PNGs fully decoded by sharp, four unique source-to-image mappings, all four original SHA256 hashes unchanged against the parent's pre-generation source-hashes.json, and every selected project file copied byte-for-byte from its returned generated master. Parent independently compared all four final images to their originals and accepted each, with no revisions requested. Technical hashes, individual visual QA notes, master paths and owner confirmations are recorded in image-validation.json.

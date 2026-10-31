# Assessment A — coin image visual review

Date: 2026-10-30. Target: https://www.ddasilver.com/category/coin . Independent visual assessment, no detector output read. Read-only audit: no source photographs, gallery assets, application code, or Sanity records changed. Audit-only contact sheets, downloaded copies, and screenshots were created.

## Coverage and method

- Read AGENTS.md, docs/product-gallery-ingestion.md, graphify-out/GRAPH_REPORT.md, and the Impeccable skill/critique reference. Parent confirmed Impeccable context already ran for product-card.tsx; it was not rerun. Incumbent site and approved DDA background are visual authorities.
- Visually inspected every silver image: **90/90 (100%), spanning 86/86 products**, in six labelled contact sheets at approximately 292px per image. Also viewed the six adjacent gold images, separately in sheet 6. These six images are not in the silver category.
- Inspected **14/90 silver images (15.6%) at their original 1254px resolution**: asset indexes 1, 5, 10, 13, 18, 20, 25, 37, 43, 58, 62, 65, 73, 86. The index JSON maps every number to its title, slug, CDN URL and downloaded path.
- Verified every one of 96 downloaded assets opens and is a 1254×1254 PNG; SHA-1 and size recorded in assessment-a-asset-validation.json. A 1254px file is not evidence of 1254px photographic detail.
- Viewed live category at desktop 1440×1000 and mobile 390×844; also mobile page 3 and Lakshmi Ganesh 10g product detail. Screenshots: assessment-a-desktop-gallery.png, assessment-a-mobile-gallery.png, assessment-a-mobile-page3.png, assessment-a-mobile-detail.png.
- Native Chrome DevTools new_page and list_pages both failed because another tool instance owned the Chrome profile. Used a separate ephemeral headless Chrome through the installed Playwright package, leaving the existing browser alone. Dismissed consent with Essential only. Every fallback browser was closed. No local server was started.

## Verdict

The issue is the photography/compositing system more than the page layout. The gallery has recognizable DDA identity and many useful images, but it reads as several batches with different scale, exposure, backgrounds, and lighting. The weakest images lose the engraving that distinguishes the item. On the mobile two-column grid, the side-by-side views reduce an already small coin to roughly 55–80px across, so the newer, smaller compositions lose substantial detail before a customer opens them.

## What works

1. The front/reverse convention is valuable: most products let a buyer see the motif and weight/purity stamp together. Complete silhouettes are generally retained. Square files render intact in the inspected card states; I did not see product cropping in those states.
2. Several assets are strong enough to establish a quality target: **DDA 10 Gram Oval Radha Krishna Silver Coin** (`dda-10-gram-oval-radha-krishna-silver-coin`, asset 25) has legible engraving and clean separation; **DDA 10 Gram George V Two-Tone Oval Silver Coin** (`george-v-two-tone-oval-coin-10g`, asset 37) separates silver and genuine gold-tone areas clearly; **DDA 20 Gram Radha Krishna Two-Tone Oval Silver Coin** (`radha-krishna-two-tone-oval-coin-20g`, asset 43) retains readable embossed detail. Their background/scale treatment still needs standardizing.
3. The newer images share an ivory brand family, unobtrusive corner branding, and stable front/reverse ordering in most families. Useful product names, weights, and shapes below the cards reduce reliance on the image alone.

## Priority issues

### P1 — Replace the softest photographic sources before retouching

**DDA 10 Gram Lakshmi Ganesh Silver Coin** (`dda-10-gram-lakshmi-ganesh-silver-coin`, asset 18) is visibly blurred at full resolution, with very bright deity details and pale edge fringes. The reverse is soft too. The 50g version (`dda-50-gram-lakshmi-ganesh-silver-coin`, asset 20) has a blue/cyan reflection and low-contrast relief; the 20g version (asset 19) is similarly weak at triage size. Compare these with the same family's more legible 100g and 250g assets. On the actual 10g mobile product page, opening the image makes the existing softness larger, not more informative.

Action: find higher-quality original photographs or reshoot these first. Recover exposure from an original RAW file if it exists. Do not use generative sharpening to reconstruct faces, lettering, beads, or religious symbols. Where pixels contain no detail, a sharper source is the honest fix. Also inspect the older 50g portrait round coin (asset 3) for reflective glare in its next source pass.

### P1 — Give the motif enough pixels in the square image

**DDA 10/20/50/100/250 Gram Rectangle Silver Coin** (`dda-10-gram-rectangle-silver-coin` through `dda-250-gram-rectangle-silver-coin`, assets 11–15) use two horizontal bars side by side. The 50g example is only about 250px tall in a 1254px master. In a 177px mobile card, the physical bar face is roughly 35px high. Large empty areas and the oversized watermark dominate; the engraved banknote motif becomes unreadable.

The newer **Classical Profile rectangular bars** (assets 62–66) are clear at full resolution but occupy only about half the image width as a pair. The **Queen Elizabeth Tree of Life square** family (48–51) is similarly small in the live mobile grid. Newer round designs such as **Srinathji Round 10g** (73) also sit low and small, with much of the canvas reserved for a blank wall and reflected floor.

Action: use a large, single obverse as the default thumbnail, with reverse as image 2 and a front/back comparison as image 3. For the existing pair approach, fill approximately 82–88% of available width with the pair, match baselines, and retain safe padding. Stack horizontal bar faces vertically in their comparison image; do not rotate engraved content away from its readable orientation merely to fill the square. Keep the actual silhouette/aspect ratio unchanged. The precise guide must reserve the existing corner brand mark.

### P2 — Standardize the template to the approved background master

The gallery currently mixes at least three visibly different treatments: warm cream images with oversized or rescaled watermarks (e.g. the classic 20g coin and rectangle bars), nearly white images with a different watermark treatment (e.g. Tree of Life 10g and the 10g devotional family), and the newer warm-ivory reflective-floor images with a bottom-right logo. The older **100g Oval Silver Coin** (asset 10) even has an extra large DDA wordmark beneath the pair. In the first live desktop row the backgrounds visibly change from cream to beige to pale grey.

Action: recompose from originals on `public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png` at its native 1254×1254 size. Preserve its existing watermark and bottom-right logo exactly; it already includes the brand lockup. Do not enlarge/reposition the watermark or generate extra branding. Standardize one camera angle, a restrained contact shadow, and a common optical centre. Use much less reflected-floor area so the product gains space; a mirror reflection is optional presentation, not product information.

### P2 — Control lighting while preserving the real finish

The silver varies from cool/blue in the older Lakshmi Ganesh images to beige/grey in portrait images. **Tree of Life Round 50g** (`tree-of-life-round-silver-coin-50g`, asset 58) has extremely pale relief compared with the dark mirrored 20g and 10g treatments. **Srinathji Round 10g** (73) puts a bright central motif against a bright upper field; it loses distinction at thumbnail scale. The classical-profile 100g/50g bars are pale while the 10g/5g fronts are dark. Some of this may be genuine finish or viewing-angle variation, so it must not be flattened automatically.

Action: photograph under repeatable diffuse lighting, use a neutral reference for white balance, and add controlled dark/white cards to describe metal and relief. Keep bright highlights below clipping while retaining natural specular contrast. Compare the result with the real item/original. Mask silver and gold-tone regions separately: do not desaturate real two-tone designs. Avoid smoothing away authentic surface finish, die marks, or permanent scratches; clean removable dust before shooting. Inspect rim masks at 100–200% for light fringes, eaten beadwork, and detached shadows. There is no evidence from this sample that all images have bad masks; the soft Lakshmi Ganesh edges are the strongest concern.

### P2 — Make the gallery a dependable set of views

Most products have only one composite. Four products have a single front view and no reverse: **George V Two-Tone Oval 15g**, **Radha Krishna Two-Tone Oval 15g**, **George V All-Silver Oval 15g**, and **Radha Krishna All-Silver Oval Front** (assets 79–82). Four 5g oval products have a pair plus one extra front photo, showing a useful precedent for separate views. The **Tree of Life Round** order is inconsistent: the 10g image shows the design on the left, while 20g and 50g show the text/weight side on the left.

Action: front first, reverse second, optional matched front/back third, and an edge/three-quarter detail where useful. In pair images, use design/front left and reverse right at the same physical scale, upright and on the same baseline. Do not infer a missing reverse from a different weight or design. Keep gram weight explicit in metadata rather than trying to make thumbnail dimensions imply actual physical size.

## Families to work on first

1. **Lakshmi Ganesh 10/20/50g**: replace/reshoot source quality first; exposure and lost relief are the most conspicuous weakness.
2. **Horizontal Franklin/rectangle 10–250g plus 5g Benjamin Franklin bar**: recompose for square/mobile readability; preserve correct front/back identity and readability.
3. **The older 33 silver images**: unify template, background and visual exposure; not every one needs a reshoot. The 10g Radha Krishna asset demonstrates that some underlying detail is already useful.
4. **Newer classical-profile bars, square Tree of Life and small round devotional images**: retain their generally better detail, enlarge the subject, reduce empty reflective-floor space, and align camera/lighting treatment.
5. **Four single-face oval products**: obtain actual reverse photographs rather than fabricating missing views.

Gold note: all six adjacent gold product assets look more consistent at triage size; package identification is useful. They would benefit from a second detail photograph of the actual bar/coin because the metal occupies a small area within the package. This is separate from the silver remediation queue.

## Concrete preparation workflow for a subsequent authorized image task

1. Make a product-to-source map using reference/slug, real weight, finish, face and reverse. Preserve source files unchanged. Reconcile stamped purity with verified owner metadata before writing any values: inspected photos include 999 and 999.9 stamps, while the current category displays 99.80%. This is a verification concern, not permission to edit stamp digits or make a purity claim from a picture.
2. Start with **two pilot products: Lakshmi Ganesh 10g and Rectangle 50g**. They test the two main failure modes: recovering real photographic detail and making a horizontal design readable in a square card. Then validate the approved treatment against George V two-tone oval 10g and a pale/mirror Tree of Life round before applying it to the catalog. Use **three images per product as the standard: large front, large reverse, matched front/back comparison**, with an optional fourth edge/detail view. Never fabricate an unavailable reverse.
3. Use sharper original photographs or reshoot with a fixed camera/lens setup, camera parallel to face, neutral reference, diffuse large sources and controlled reflection cards. Capture front, reverse and an optional edge view. Check relief sharpness before compositing.
4. Perform restrained, source-grounded exposure/white-balance and dust corrections. Preserve text, deities, portrait identity, rim beading, proportions, finish and gold-tone areas. No generative recreation of the product surface.
5. Build 1254×1254 PNG masters on the exact approved background. A single-face hero can occupy roughly 72–80% of the canvas's longest dimension, while leaving 8–10% top/side safe padding and the bottom-right brand zone clear. Adapt horizontal bars by shape; use stacked pair comparisons. Keep optical centres and light direction consistent.
6. Review at original pixel size, approximately 320px desktop cards, and 177px mobile cards. If the motif is lost at thumbnail scale, improve framing first. Review exact text, weight marks, silhouette, rim and source correspondence side by side at full size.
7. Export stable filenames plus a matching manifest, titles/descriptions/alt, verified purity/weight/dimensions as applicable. Dry-run the established ingestion workflow. No Sanity write without separately authorized upload.

## Confidence limits

High confidence: file dimensions, complete triage coverage, template differences, small composition within square frames, washed-out/soft Lakshmi Ganesh originals, missing reverse images in the provided inventory, live mobile impact.

Medium confidence: color/finish consistency recommendations, because silver naturally reflects its surroundings and genuine finishes differ. An owner/source reference is required before correcting material appearance.

Not established: whether any engraved detail was invented or changed by earlier editing. This review compares published assets and the approved background, not every original photograph or physical coin. Do not equate a polished/render-like appearance with proof of AI alteration. No quantitative clipping analysis, color-calibrated viewing, or complete per-pixel mask audit was performed. Only 14 images received original-size visual inspection; the remainder received contact-sheet triage.

## Secondary critique notes within this narrow scope

Design specificity: recognizable DDA branding and actual design variety; uneven photography undermines it. Emotional journey: the initial grid conveys choice and brand care, but the weakest detail view reduces confidence precisely when the customer attempts to inspect the coin. Mobile first-timer risk: confusing a pale photograph with a plain design, or assuming two faces are two included pieces. Product titles/weights and descriptive alt help, but additional actual views improve recognition.

Heuristic scores limited to observed image-browsing states (0–4): visibility of status 3; real-world match 3; user control n/a (no exhaustive interaction audit); consistency 1; error prevention n/a; recognition 2; flexibility n/a; aesthetic/minimalist presentation 2; error recovery n/a; help/documentation 3. These are image-scope observations, not a full site UX score. Cognitive load is principally comparing similar products whose photographic treatment changes; the page's search, shape filter and weight labels are useful. The category has multiple shape choices but does not expose all of them as a noisy competing control set on mobile.

Suggested future direction question for synthesis, if needed: should the first card image prioritize recognizing the motif with one larger face, while retaining both faces in the product gallery? No asset replacement was undertaken in this assessment.

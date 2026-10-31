Method: dual-agent (A: /root/coin_visual_review · B: /root/coin_render_review)

# DDA Silver coin image review — 30 October 2026

Reviewed the live coin catalogue and every published silver image: **90 images across 86 products**. Fourteen silver images were also inspected at their original 1254 × 1254 resolution. Six gold product images were reviewed separately. All 96 assets opened successfully. This was a read-only review; product images, application code and Sanity content were not changed.

The strongest improvement is to give each coin face more space and preserve real engraving detail. The poor appearance chiefly originates in the prepared images. The website displays the complete square assets, including their excessive empty space. Some sources are genuinely too soft; others are sharp enough and mainly need consistent composition.

## Design specificity and strengths

The actual coin designs and DDA branding give the catalogue a recognizable identity, but different production batches use visibly different backgrounds, scale, lighting and watermark treatments. It feels assembled from several photography systems.

- Front/reverse comparisons are useful, and the inspected starting views generally retain complete silhouettes.
- The 10g Oval Radha Krishna, 10g George V Two-Tone Oval and 20g Radha Krishna Two-Tone Oval images demonstrate useful engraving detail and separation of finishes. Preserve their product detail while improving framing.
- Weight, shape and product names beneath the cards help customers compare designs.

The deterministic scan returned **zero findings** across product-card.tsx, product-detail-dialog.tsx and product-gallery.tsx. That scan cannot assess photographic sharpness or thumbnail readability. Independent visual and browser assessments agree that the main defects are present in the assets; browser inspection additionally identified limited image enlargement on mobile.

## Priority improvements

### 1. P1 — Replace the weakest sources

The **10g Lakshmi Ganesh** image is blurred and washed out in its full-resolution original. The 50g version also has weak relief and a cool cast; the 20g version looks weak in the contact-sheet review. Enlarging these files or increasing CDN quality will not recover the missing detail.

The local 10g master exactly matches the published Sanity asset. Its documented composition workflow enlarges 168px and 154px face crops to 520px, consistent with the observed softness. The original camera photographs were not independently traced, so this is pipeline evidence rather than a complete provenance certification.

**Fix:** find sharper originals or reshoot the actual front and reverse separately, with the camera parallel to each face, diffuse lighting and controlled reflections. AI can assist background and lighting treatment; it must not invent deity features, inscriptions, weight/purity digits, rim beads or missing relief. Inspect the 10/20/50g family first. Workflow command: `$impeccable polish` can track the remediation; source capture and the gallery-image workflow perform the actual asset work.

### 2. P1 — Enlarge the subject and provide separate views

The **10–250g horizontal rectangle coins** are especially poorly served by two small bars side by side in a square. The 50g bar is roughly 250px high in the 1254px master, becoming about 35px high in a 177px mobile card. Newer Classical Profile bars, square Tree of Life coins and some devotional rounds also devote too much space to the background and reflected floor.

Of 86 silver products, **82 have only one gallery image**, usually a flattened front/back pair. A paired image does not offer independently selectable front and reverse close-ups. Four oval products have only a front view in the current inventory.

**Fix:** make a large front face the first image, a large reverse the second, and a matched front/back comparison the third. Use an optional fourth edge/detail view only when photographed. For paired horizontal bars, stack the faces vertically. Preserve actual proportions and the complete rim; reserve the template's logo area. If the pair remains the cover, tighten its composition and still supply separate close-ups. Never fabricate a missing reverse. Suggested command: `$impeccable layout`.

### 3. P2 — Use one exact branded template

Older cream/grey images, nearly white devotional images and newer reflective-floor images differ in background shade, monogram scale, shadows and subject placement. The older 100g Oval image also has a conspicuous additional DDA wordmark. The first desktop row already shows these inconsistencies.

**Fix:** use the approved native-size **1254 × 1254** master at `public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png`. Preserve its existing watermark and lower-right logo exactly. Align optical centres and baselines within each shape family, retain a restrained contact shadow, and reduce the prominence of floor reflections. Suggested command: `$impeccable polish`.

### 4. P2 — Preserve metal detail with controlled lighting

The silver ranges from blue/cyan or beige to nearly white. The **50g Round Tree of Life** is particularly pale compared with the 20g version. Some Srinathji and Classical Profile images also lose contrast at card size. Different real finishes and reflection angles may explain part of this variation.

**Fix:** use repeatable diffuse illumination and a neutral white-balance reference. Keep controlled bright and dark reflections so the relief remains visible. Correct silver and genuine gold-tone areas separately; do not globally desaturate two-tone coins or make mirror and satin finishes identical. Clean removable dust before shooting and inspect cutout edges without removing authentic product details. Suggested command: `$impeccable polish` with source-grounded corrections.

### 5. P2 — Add useful mobile image enlargement

Measured cards show the full image using `object-fit: contain`. Responsive CDN requests were appropriate in the sampled states; a wrong crop or small requested raster was not established as the main cause. However, the mobile modal fits the square composition into approximately **270px**, and the current gallery provides a **mouse-only 1.4× hover zoom**. There is no dedicated touch/keyboard enlargement control in the inspected component.

**Fix:** add an explicit tap/click-to-enlarge viewer with labelled front/reverse thumbnails, accessible close/Escape and keyboard controls, and touch zoom/pan. Load the larger asset when inspecting it. This helps good photographs; it cannot repair blurred masters. Suggested command: `$impeccable adapt`.

## Recommended pilot and standard

Start with **Lakshmi Ganesh 10g** and **Rectangle 50g**. They exercise the two biggest problems: lost detail and poor use of the square canvas. Obtain a sharper source for the Lakshmi Ganesh before attempting enhancement. Then check the agreed composition on a two-tone oval and a mirror-finish round coin before extending it to all 86 products.

Standard set: **front close-up → reverse close-up → matched front/back comparison**, optional photographed edge/detail. Keep stable filenames and verified product metadata. Review at full size and approximately 170–180px mobile card size. A 1254px export alone is not a sharpness test.

## Image-browsing health assessment

These are heuristic observations of the reviewed image-browsing states, not a score for checkout or the whole website.

| Heuristic | Score / 4 | Basis |
|---|---:|---|
| Visibility of system status | 3 | Product imagery and metadata visible in tested states |
| Match to real world | 3 | Real designs and both faces generally shown; finish verification remains necessary |
| User control and freedom | 2 | Modal closes, but no explicit accessible image enlargement |
| Consistency and standards | 1 | Several visibly different image treatments |
| Error prevention | n/a | No transaction or editing flow in scope |
| Recognition rather than recall | 2 | Small faces weaken motif recognition |
| Flexibility and efficiency | 1 | Flattened pairs and mouse-only zoom limit inspection |
| Aesthetic and minimalist design | 2 | Excess empty space and inconsistent scale |
| Error recovery | n/a | Failure-state recovery not in scope |
| Help and documentation | 3 | Names, weights and shapes support interpretation |
| **Total** | **17/32** | **53%; acceptable band, substantial image improvements needed** |

## Buyer impact and minor observations

- **Mobile shopper:** two faces within a small card become tiny; the modal offers little additional detail without a usable enlarged view.
- **First-time buyer:** different lighting can make similar designs seem to have different finishes. A front/back pair may also be mistaken for two included pieces; label the views clearly outside the photograph.
- **Careful buyer:** zooming a soft master undermines confidence precisely when inspecting engraving. Accurate close-ups restore confidence.

The cognitive burden is comparing products whose photographic treatment changes. The emotional weak point is opening an attractive card and finding insufficient detail. Search, shape filtering and weight labels are useful; this audit does not establish a need to redesign the whole category page.

Keep front/design left and reverse right in comparisons. Tree of Life round ordering currently differs by weight. Six gold assets are more consistent at contact-sheet size; add real metal close-ups alongside the useful packaging views.

Separately verify the catalogue's 99.80% purity label against owner-approved records for photos stamped 999 or 999.9. Do not change metadata or engraved digits based on this visual audit alone.

## Scope and evidence

Confidence is high in visible softness, composition, template variation, image counts and measured rendering. Colour/finish corrections need comparison with the real item or a reliable source photograph. This audit did not establish whether earlier AI editing altered any engraved detail, and did not compare every published image with its camera original. Fourteen silver images received full-resolution visual inspection; all others received contact-sheet triage.

See `assessment-a-findings.md`, `assessment-b.md`, `sanity-coin-inventory.json`, six numbered `assessment-a-sheet-*.png` contact sheets and the retained desktop/mobile screenshots in this folder.

## Choices for the next pass

1. Cover image: a larger single front face (recommended), or a tighter front/back pair with separate close-ups?
2. Initial scope: two pilot products (recommended), or the weakest Lakshmi Ganesh and horizontal rectangle families first?

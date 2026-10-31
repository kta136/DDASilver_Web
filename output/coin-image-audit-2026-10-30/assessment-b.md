# Assessment B — detector and browser evidence

Independent read-only assessment by `/root/coin_render_review`. Assessment A's findings and images were not read. Date: 30 October 2026.

## Scope and method

- Source targets: `src/components/catalog/product-card.tsx`, `src/components/catalog/product-detail-dialog.tsx`; expanded narrowly to `product-gallery.tsx`, image loader, mobile modal styles, and the existing coin composition script to trace image behavior.
- Live target: https://www.ddasilver.com/category/coin and its DDA 10 Gram Silver Coin detail modal.
- Inventory supplied by parent: 86 silver-coin products and 6 gold products; 96 gallery entries, all 1254 × 1254. Of the 86 silver products, 82 have just one gallery entry and 4 have two. One entry often contains both faces in a single flattened composition, so image count does not equal face coverage.
- Reviewed desktop at 1280 × 720, DPR 1.25; mobile layout at 390 × 844, DPR approximately 1. Mobile layout testing used a desktop pointer, not touch-device gesture emulation.
- Read `AGENTS.md`, graph report and Impeccable critique instructions before source review. No critique ignore file exists. Parent owns target slug/persistence.

## Deterministic scan

Commands completed successfully:

```text
impeccable.cmd detect --json src/components/catalog/product-card.tsx src/components/catalog/product-detail-dialog.tsx
=> [] (exit 0)

impeccable.cmd detect --json src/components/catalog/product-gallery.tsx
=> [] (exit 0)
```

Primary findings: **0**. Advisory findings: **0**. False positives: none. This TSX scan cannot assess photographic detail, the quality of source crops, or whether a coin is readable at thumbnail scale; it is not evidence that the photographs are good.

## Browser and rendering evidence

| Surface | Measured image box | Requested CDN asset | Observed behavior |
|---|---:|---|---|
| Desktop category card | 280.2 × 280.2 CSS px | `w=640&q=80&auto=format&fit=max` | `object-fit: contain`, centered; complete square asset shown |
| Mobile category card | 169.6 × 169.6 CSS px | `w=256&q=80&auto=format&fit=max` | `object-fit: contain`; two photographed faces are each only about 70–80 CSS px across |
| Desktop 10g product modal | 662.4 × 672 CSS px | `w=1080&q=80&auto=format&fit=max` | `object-fit: contain`, initial transform `none`; full pair visible |
| Mobile 10g product modal | 359.2 × 270.1 CSS px | `w=640&q=80&auto=format&fit=max` | Full 1254-square composition is fitted into a 270 px square within the wider box; visible side bars; coin faces roughly 115–120 px across |

`naturalWidth` can be density-corrected by `srcset`; the CDN `w` parameter is the relevant requested raster width. No source crop/hotspot is set on the sampled inventory images.

The measured behavior agrees with `product-card.tsx:31,66,69`, `product-gallery.tsx:130,132`, and `sanity-image.ts:4,128,135`. The loader uses quality 80, chooses responsive sizes and caps at the source width. There is no evidence here that a wrong CSS cover crop or an under-resolved CDN request is the main cause of poor appearance. The visible square image padding and backgrounds are baked into the source assets.

The mobile detail height is explicitly capped by `globals.css:1062` at `clamp(180px, 32dvh, 290px)`. On the tested phone layout this reduces the already-paired square photograph to 270 px across. Preserve the complete unzoomed image, but give customers an explicit way to open a larger view.

### Zoom and inspection

- The 10g modal exposes only the close button as a button; no explicit image enlargement/fullscreen button is present.
- The gallery has a zoom cursor, and a mouse pointer in the image produced a `matrix(1.4, 0, 0, 1.4, 0, 0)` transform. Clicking did not open a separate viewer.
- Source confirms a fixed 1.4× hover zoom (`product-gallery.tsx:20`) and explicitly rejects non-mouse pointers in both zoom handlers (`:47`, `:72`). There is no corresponding keyboard or touch image-inspection control in this component. Browser page zoom is separate from a product-image viewer and was not tested.
- Most products' one flattened pair means no individual front or reverse thumbnail can be selected. The four two-image products are George V all-silver oval 5g, Radha Krishna all-silver oval 5g, Radha Krishna two-tone oval 5g, and George V two-tone oval 5g.

## Asset evidence: source quality versus display

Three untransformed Sanity originals were downloaded and inspected at their full 1254-square resolution. These files are retained as audit evidence, not edited products:

1. `assessment-b-raw-dda-10-gram-silver-coin.png`: https://cdn.sanity.io/images/f6i0fy2f/production/b548608bb701e9fc0c1999635f22acce3ad4f0eb-1254x1254.png
2. `assessment-b-raw-dda-10-gram-lakshmi-ganesh-silver-coin.png`: https://cdn.sanity.io/images/f6i0fy2f/production/e5e698dbcee5bdf5acc5ac5aa65e9ca19ae33f06-1254x1254.png
3. `assessment-b-raw-george-v-two-tone-oval-coin-100g.png`: https://cdn.sanity.io/images/f6i0fy2f/production/6eb7e66180a3332b67ad6f59f2929f477497a3ac-1254x1254.png

The **10g Lakshmi–Ganesh image is visibly soft and has washed-out highlights in the untransformed PNG itself**. Relief and lettering have broad blurry edges; zooming the website cannot restore missing detail. Its raw CDN file is byte-for-byte identical to the local `public/images/silver-coins/silver-coin-lakshmi-ganesh-10g-front-back-neutral-watermark.png` (SHA256 `8F9E83BEDA73C7ED60D5DDA41AB2A8FD5A9261D6F1051A62FD15C42E1FAF6913`). This isolates the problem to the prepared image rather than a deployment/CDN mismatch.

There is a concrete likely cause in the existing workflow: `scripts/images/lakshmi-ganesh-round-coins.json:3,12,13` declares a 520 px target diameter but 84 px and 77 px source radii for the 10g faces. The script extracts 168 px and 154 px crops and enlarges them to 520 px (`build-coin-pairs.mjs:200,206`), about **3.1× and 3.4×** in linear dimensions. `scripts/images/README.md` describes this as the source-photo pairing workflow. The exact original camera photographs were not located in this assessment, so frame this as supported pipeline evidence consistent with the observed blur, not a new photographic provenance certification.

The plain 10g Victoria coin and George V two-tone 100g asset retain much finer visible detail than the Lakshmi–Ganesh sample. The latter also has a lower composition, tall oval subjects, stronger directional shadows and a floor reflection, while the former uses two circles centered higher with a different shadow treatment. Background hue, monogram scale, camera angle and subject placement vary across these assets and the first category row. The browser faithfully reproduces these variations.

The 1254 × 1254 export dimension is therefore not a useful quality gate by itself: a small, enlarged source crop can pass that dimension check while remaining visibly poor.

## Suggested priorities for synthesis

1. **P1 — Replace/rephotograph the genuinely low-detail masters first.** Start with the 10g Lakshmi–Ganesh image and review its adjacent weight series. Capture each real face separately, near front-on, in diffused light, with actual resolved engraving detail and controlled reflections. Keep the original photographs. Do not use AI to invent unreadable lettering, relief or purity marks. A larger export or higher CDN quality will not recover lost information.
2. **P1 — Give each face enough room to be judged.** Use a clear single-face lead image at card scale, with a dedicated reverse image and an optional paired overview in the product gallery. If paired overview must remain the lead, use a consistent tightly composed pair and give each face a large dedicated detail image. Keep sufficient margins for the complete rim and the approved branding. This addresses the measured 70–80 px faces on mobile.
3. **P2 — Add an explicit accessible image viewer.** Retain the uncropped starting view. Offer tap/click to enlarge, labelled front/reverse thumbnails, keyboard controls, Escape/close, and touch pinch/pan. The existing mouse-only 1.4× hover effect is insufficient for examining fine engraving, especially with flattened pairs and the mobile height cap.
4. **P2 — Standardize the image treatment using the approved DDA background.** Match the warm-ivory branded background, subject scale and baseline, lighting direction, white balance, edge cleanup, grounding shadow and watermark position. Preserve real proportions and finish; do not stretch ovals/circles or remove actual surface details to make every image look identical. The current inconsistency originates in the assets, so CSS changes alone will not solve it.
5. **P3 — Tune delivery after image repair, not before.** Recheck `sizes` at the actual grid breakpoints and consider serving a sharper, full-resolution asset only when an inspection viewer is opened. Quality 80 is reasonable evidence of an optimization choice, not proof of the current quality complaint's cause. Avoid loading full originals in every category card.

### Additional caution grounded in the inspected asset

The first raw Victoria 10g reverse visibly contains `999`, while the live recorded purity is `99.80%`. Do not silently change either engraving or catalog metadata based on this audit; verify with the owner and preserve what the real object actually shows. This is a separate product-truth check, not a reason to retouch the stamp.

## Run notes

- Assessment independence: preserved; no Assessment A report or visual assessment read.
- CLI detector: completed, three relevant TSX components, zero findings.
- Native Chrome DevTools: new-page and list-pages attempts failed because the configured Chrome profile was already in use. No browser process was stopped.
- Fallback: fresh native CUA in-app browser tabs opened successfully; desktop/mobile screenshots and DOM metrics were inspected inline. Second fresh-tab creation with explicit visibility failed because subagent visibility is unsupported; creation without a visibility option succeeded.
- Overlay injection: skipped because CUA's documented evaluate API is read-only. No mutable preflight attempted through an explicitly read-only API. No reliable user-visible detector overlay is claimed.
- Browser visibility: kept background/default; no user-facing Human tab was created.
- Live server: not started; therefore none to stop and no injection removal could modify repo files.
- Cleanup: temporary viewport reset; both audit-created tabs closed. Three downloaded raw image originals intentionally retained as report evidence. No UI source files, product images or Sanity documents were modified.
- Scope limitation: this assessment checks rendering, selected untransformed assets and their workflow; Assessment A owns the full-catalog visual review. Mobile layout was inspected, but real touch gestures were inferred from source behavior rather than device-tested.

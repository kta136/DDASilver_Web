# Annotated implementation plan

## How to read this plan

- Mode: **dom-anchored** — every change below is anchored to a selector the live page really has.
- Coverage 48.1% before-side: the share of the existing interface's elements the target could be matched to.
- Coverage 54.3% target-side: the share of the target's elements that matched something already there.
- Anchor overlap is low: 48.1% of the existing page's elements matched, under the 60.0% gate. The capture was verified to be the page that was requested, so this is a design delta, not a capture mismatch: most of the target is new and arrives as added elements and raster layers. The anchored items below are still real selectors — treat the rest as new work rather than as edits.
- Frame: Bounds are % of the capture frame (1536×1024); `winner.png` is the design at its own size (1536×1024); place by percentage, not by pixel.
- Precedence: assets → tokens → matched changes → added elements. Work them in that order.
- Skip an item only with a stated reason in your report; never skip a raster layer.
- Source repository: `D:\Projects\DDASilver_Web`

## Raster layers to carry

Copy each file into the repository and reference it at its bounds. Never redraw one of these in CSS, and never skip one.

- **photo** — hero silver thali arrangement on marble with flowers (hero imagery)
  - Asset: `target\winner.layerdoc.json.assets\clean-1-149a5afce9eb.png` — clean plate
  - Bounds: x 0.0%, y 9.9%, 100.0% × 47.4% of the canvas
  - Place at: `.home-hero` (#main-content>section:nth-child(1))
  - Also available: `target\winner.layerdoc.json.assets\upscaled-plate-1-3c8eead9cda6.png` (upscaled plate) — pick one resolution.
- **photo** — Pooja utensils collection product image
  - Asset: `target\winner.layerdoc.json.assets\crop-22-a5723715a6dd.png` — source crop
  - Bounds: x 27.2%, y 63.5%, 12.9% × 20.2% of the canvas
  - Place at: `.collection-photo`[0/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(1)>a>span:nth-child(1))
  - Also available: `target\winner.layerdoc.json.assets\upscaled-region-22-b9968f2ea841.png` (upscaled region) — pick one resolution.
- **photo** — Utensils collection product image
  - Asset: `target\winner.layerdoc.json.assets\crop-37-afc6f20f546e.png` — source crop
  - Bounds: x 70.9%, y 63.5%, 12.4% × 20.2% of the canvas
  - Place at: `.collection-photo`[3/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(4)>a>span:nth-child(1))
  - Also available: `target\winner.layerdoc.json.assets\upscaled-region-37-0793404513dc.png` (upscaled region) — pick one resolution.
- **photo** — Coins collection product image
  - Asset: `target\winner.layerdoc.json.assets\crop-27-904fa47123f6.png` — source crop
  - Bounds: x 42.2%, y 63.5%, 12.3% × 20.2% of the canvas
  - Place at: `.collection-photo`[1/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(1))
  - Also available: `target\winner.layerdoc.json.assets\upscaled-region-27-e41c3e64c361.png` (upscaled region) — pick one resolution.
- **photo** — Idols collection product image
  - Asset: `target\winner.layerdoc.json.assets\crop-32-f260f3b27d1e.png` — source crop
  - Bounds: x 56.6%, y 63.5%, 12.3% × 20.2% of the canvas
  - Place at: `.collection-photo`[2/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(3)>a>span:nth-child(1))
  - Also available: `target\winner.layerdoc.json.assets\upscaled-region-32-d49dd818c1b3.png` (upscaled region) — pick one resolution.
- **photo** — Gifts collection product image
  - Asset: `target\winner.layerdoc.json.assets\crop-42-9f2a054beb15.png` — source crop
  - Bounds: x 85.3%, y 63.5%, 12.3% × 20.2% of the canvas
  - Place at: `.collection-photo`[4/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(5)>a>span:nth-child(1))
  - Also available: `target\winner.layerdoc.json.assets\upscaled-region-42-244739cd610b.png` (upscaled region) — pick one resolution.

## Tokens — apply once

- Apply `token-patch.css` through the existing global token or theme entry point.
- Fonts: **Cormorant Garamond** (weights 400), declared as `--font-cormorant-garamond` — the patch imports nothing. Load the family the way this repository already loads fonts: self-host it, or add it to the existing loader.
- Fonts: **Montserrat** (weights 400, 600), declared as `--font-montserrat` — the patch imports nothing. Load the family the way this repository already loads fonts: self-host it, or add it to the existing loader.
- `--ui-text-font-family-montserrat: var(--font-montserrat)` — 12 matched changes; selectors: #main-content>section:nth-child(1)>div:nth-child(1)>p:nth-child(1), #main-content>section:nth-child(2)>div>div>p:nth-child(1), #main-content>section:nth-child(2)>div>div>p:nth-child(3) and 9 more.
- `--ui-text-text-align-left: left` — 11 matched changes; selectors: #main-content>section:nth-child(1)>div:nth-child(1)>p:nth-child(1), #main-content>section:nth-child(2)>div>div>p:nth-child(1), #main-content>section:nth-child(2)>div>div>p:nth-child(3) and 9 more.
- `--ui-text-color-d3dcd8: #d3dcd8` — 5 matched changes; selectors: .xl\:inline, body>div:nth-child(4)>header>div>div:nth-child(1)>nav>ul>li:nth-child(1)>a, body>div:nth-child(4)>header>div>div:nth-child(1)>nav>ul>li:nth-child(2)>a and 2 more.
- `--ui-text-font-size-13: 13px` — 4 matched changes; selectors: #main-content>section:nth-child(1)>div:nth-child(1)>p:nth-child(1), body>div:nth-child(4)>header>div>div:nth-child(1)>nav>ul>li:nth-child(1)>a, body>div:nth-child(4)>header>div>div:nth-child(1)>nav>ul>li:nth-child(2)>a and 2 more.
- `--ui-text-color-46615c: #46615c` — 3 matched changes; selectors: #main-content>section:nth-child(2)>div>nav>div>a:nth-child(5), #main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(2), #main-content>section:nth-child(2)>div>nav>ul>li:nth-child(4)>a>span:nth-child(2).
- `--ui-text-font-weight-600: 600` — 3 matched changes; selectors: #main-content>section:nth-child(1)>div:nth-child(1)>p:nth-child(1), #main-content>section:nth-child(2)>div>div>p:nth-child(1), #main-content>section:nth-child(2)>div>nav>div>a:nth-child(5) and 2 more.
- `--ui-heading-font-family-cormorant-garamond: var(--font-cormorant-garamond)` — 2 matched changes; selectors: #main-content>section:nth-child(1)>div:nth-child(1)>h1, #main-content>section:nth-child(2)>div>div>h2.
- `--ui-text-font-size-14: 14px` — 2 matched changes; selectors: #main-content>section:nth-child(2)>div>div>p:nth-child(3), .xl\:inline.
- `--ui-text-font-size-11: 11px` — 2 matched changes; selectors: #main-content>section:nth-child(2)>div>div>p:nth-child(1), #main-content>section:nth-child(2)>div>nav>div>a:nth-child(5), #main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(2) and 1 more.
- `--ui-heading-text-align-left: left` — 2 matched changes; selectors: #main-content>section:nth-child(1)>div:nth-child(1)>h1, #main-content>section:nth-child(2)>div>div>h2.

## Matched changes

### `src\app\(site)\about\page.tsx`

- `.eyebrow`[1/6] (#main-content>section:nth-child(2)>div>div>p:nth-child(1)) — file: `src\app\(site)\about\page.tsx:19` _(confidence: medium; distinctive-single-class)_: box [0.0313,0.626,0.1312,0.0146]→[0.036,0.624,0.1387,0.011], fontSizePx 11.52→11.264, fontWeight 700→600, googleFontFamily "IBM Plex Sans"→"Montserrat", color "#092a25"→"#44605b", align "start"→"left"

### `src\app\(site)\page.tsx`

- `.eyebrow`[0/6] (#main-content>section:nth-child(1)>div:nth-child(1)>p:nth-child(1)) — file: `src\app\(site)\page.tsx:38` _(confidence: medium; distinctive-single-class)_: content "AGRA / SILVER SHOWROOM"→"AGRA  /  SILVER SHOWROOM", box [0.088,0.1638,0.1242,0.0137]→[0.088,0.204,0.1767,0.011], fontSizePx 11→13.312000000000001, fontWeight 500→600, googleFontFamily "IBM Plex Sans"→"Montserrat", color "#dce5df"→"#e6e9e5", align "start"→"left"
- `#main-content>section:nth-child(1)>div:nth-child(1)>h1` — file: `src\app\(site)\page.tsx:36` _(confidence: low; ancestor-distinctive-single-class)_: content "Silver, made meaningful."→"Silver, made\nmeaningful.", box [0.088,0.1867,0.2361,0.1782]→[0.088,0.24,0.276,0.154], fontSizePx 69.89→69.632, googleFontFamily "Bodoni Moda"→"Cormorant Garamond", align "start"→"left"
- `.hero-description` (#main-content>section:nth-child(1)>div:nth-child(1)>p:nth-child(3)) — file: `src\app\(site)\page.tsx:40` _(confidence: medium; distinctive-single-class)_: content "Timeless pieces for everyday rituals, memorable occasions and the generations that follow."→"Timeless pieces for everyday rituals,\nmemorable occasions and the generations\nthat follow.", box [0.088,0.3781,0.2191,0.0711]→[0.088,0.436,0.2173,0.065], fontSizePx 16→16.384, googleFontFamily "IBM Plex Sans"→"Montserrat", color "#dce5df"→"#e2e6e2", align "start"→"left"
- `.home-hero` (#main-content>section:nth-child(1)) — file: `src\app\(site)\page.tsx:36` _(confidence: medium; distinctive-single-class)_: kind "panel"→"photo", content undefined→"hero silver thali arrangement on marble with flowers", box [0,0.0996,1,0.4746]→[0,0.099,1,0.474], style.background "#0b3029"→undefined, style.display "flex"→undefined
- `.home-hero-photo` (#main-content>section:nth-child(1)>div:nth-child(2)) — file: `src\app\(site)\page.tsx:43` _(confidence: medium; distinctive-single-class)_: kind "panel"→"decoration", content undefined→"dark translucent hero copy backdrop", box [0,0.0996,1,0.4746]→[0,0.099,0.4653,0.474], style.background "#efeee5"→"rgba(7,38,32,0.72)", style.clipPath undefined→"polygon(0 0, 100% 0, 61% 100%, 0 100%)"

### `src\app\(site)\products\page.tsx`

- `#main-content>section:nth-child(2)>div>nav>div>a:nth-child(5)` — file: `src\app\(site)\products\page.tsx:10` _(confidence: low; text-content)_: content "Utensils"→"UTENSILS", box [0.4316,0.9165,0.0284,0.0146]→[0.7093,0.85,0.046,0.011], fontSizePx 12→11.264, fontWeight 400→600, googleFontFamily "IBM Plex Sans"→"Montserrat", color "#172622"→"#46615c", align "start"→"left"

### `src\app\layout.tsx`

- `#main-content>section:nth-child(2)>div>div>h2` — file: `src\app\layout.tsx:178` _(confidence: low; ancestor-distinctive-single-class)_: content "Timeless silver. For every moment."→"Timeless\nSilver. For\nEvery Moment.", box [0.0313,0.6546,0.1825,0.1556]→[0.0353,0.658,0.1867,0.136], fontSizePx 41.47→48.128, googleFontFamily "Bodoni Moda"→"Cormorant Garamond", color "#172622"→"#123d37", align "start"→"left"
- `body` — file: `src\app\layout.tsx:178` _(confidence: high; distinctive-single-class)_: content undefined→"off-white page background", style.background "#f2f5f1"→"#f0f2f0"

### `src\components\brand-mark.tsx`

- `.leading-none`[0/3] (body>div:nth-child(4)>header>div>div:nth-child(2)>a>span:nth-child(3)>span:nth-child(1)) — file: `src\components\brand-mark.tsx:31` _(confidence: high; distinctive-single-class)_: kind "text"→"logo", content "DDA SILVER"→"DDA\nSILVER", box [0.4635,0.0544,0.1086,0.0361]→[0.464,0.022,0.0713,0.063], fontSizePx 24→39.936, googleFontFamily "Bodoni Moda"→"Cormorant Garamond", color "#f2f5f1"→"#f3f5f1"

### `src\components\catalog\category-index.tsx`

- `.collection-caption`[1/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(2)) — file: `src\components\catalog\category-index.tsx:11` _(confidence: medium; distinctive-single-class)_: content "Idols"→"IDOLS", box [0.4194,0.8366,0.1212,0.0176]→[0.5687,0.85,0.0253,0.011], fontSizePx 14→11.264, fontWeight 400→600, googleFontFamily "IBM Plex Sans"→"Montserrat", color "#172622"→"#46615c", align "start"→"left", style.display "flex"→undefined, style.gap "6px"→undefined
- `.collection-caption`[3/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(4)>a>span:nth-child(2)) — file: `src\components\catalog\category-index.tsx:11` _(confidence: medium; distinctive-single-class)_: content "Gifts"→"GIFTS", box [0.7048,0.8366,0.1212,0.0176]→[0.8527,0.85,0.028,0.011], fontSizePx 14→11.264, fontWeight 400→600, googleFontFamily "IBM Plex Sans"→"Montserrat", color "#172622"→"#46615c", align "start"→"left", style.display "flex"→undefined, style.gap "6px"→undefined
- `.collection-photo`[0/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(1)>a>span:nth-child(1)) — file: `src\components\catalog\category-index.tsx:11` _(confidence: high; distinctive-single-class)_: kind "panel"→"photo", content undefined→"Pooja utensils collection product image", box [0.2656,0.625,0.1323,0.2133]→[0.272,0.635,0.1287,0.202], style.background "#f4f1eb"→undefined
- `.collection-photo`[1/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(1)) — file: `src\components\catalog\category-index.tsx:11` _(confidence: high; distinctive-single-class)_: kind "panel"→"photo", content undefined→"Coins collection product image", box [0.4194,0.625,0.1212,0.1955]→[0.422,0.635,0.1233,0.202], style.background "#f4f1eb"→undefined
- `.collection-photo`[2/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(3)>a>span:nth-child(1)) — file: `src\components\catalog\category-index.tsx:11` _(confidence: high; distinctive-single-class)_: kind "panel"→"photo", content undefined→"Idols collection product image", box [0.5621,0.625,0.1212,0.1955]→[0.566,0.635,0.1233,0.202], style.background "#f4f1eb"→undefined
- `.collection-photo`[3/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(4)>a>span:nth-child(1)) — file: `src\components\catalog\category-index.tsx:11` _(confidence: high; distinctive-single-class)_: kind "panel"→"photo", content undefined→"Utensils collection product image", box [0.7048,0.625,0.1212,0.1955]→[0.7093,0.635,0.124,0.202], style.background "#f4f1eb"→undefined
- `.collection-photo`[4/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(5)>a>span:nth-child(1)) — file: `src\components\catalog\category-index.tsx:11` _(confidence: high; distinctive-single-class)_: kind "panel"→"photo", content undefined→"Gifts collection product image", box [0.8475,0.625,0.1212,0.1955]→[0.8533,0.635,0.1233,0.202], style.background "#f4f1eb"→undefined
- `#main-content>section:nth-child(2)>div>div>p:nth-child(3)` — file: `src\components\catalog\category-index.tsx:9` _(confidence: low; text-content)_: content "For daily rituals, thoughtful gifts and the occasions you hold close."→"From sacred idols to everyday utensils,\nfrom cherished coins to thoughtful gifts —\nfind silver pieces for every occasion\nand every generation.", box [0.0313,0.8265,0.1626,0.0408]→[0.036,0.822,0.1727,0.083], fontSizePx 14→14.336, googleFontFamily "IBM Plex Sans"→"Montserrat", color "#53675e"→"#78817e", align "start"→"left"

### `src\components\site-header.tsx`

- `.xl\:inline` (body>div:nth-child(4)>header>div>div:nth-child(1)>button>span) — file: `src\components\site-header.tsx:199` _(confidence: high; exact-multi-class)_: box [0.0514,0.0405,0.0282,0.0176]→[0.0593,0.045,0.03,0.017], fontSizePx 14→14.336, googleFontFamily "IBM Plex Sans"→"Montserrat", color "#f2f5f1"→"#d3dcd8", align "center"→"left"
- `body>div:nth-child(4)>header>div>div:nth-child(1)>nav>ul>li:nth-child(1)>a` — file: `src\components\site-header.tsx:49` _(confidence: low; text-content)_: box [0.33,0.042,0.0365,0.0176]→[0.282,0.045,0.04,0.012], fontSizePx 14→13.312000000000001, googleFontFamily "IBM Plex Sans"→"Montserrat", color "#f2f5f1"→"#d3dcd8", align "start"→"left", style.paddingBottom "14px"→undefined, style.paddingTop "14px"→undefined
- `body>div:nth-child(4)>header>div>div:nth-child(1)>nav>ul>li:nth-child(2)>a` — file: `src\components\site-header.tsx:51` _(confidence: low; text-content)_: box [0.3874,0.042,0.0416,0.0176]→[0.352,0.045,0.0453,0.012], fontSizePx 14→13.312000000000001, googleFontFamily "IBM Plex Sans"→"Montserrat", color "#f2f5f1"→"#d3dcd8", align "start"→"left", style.paddingBottom "14px"→undefined, style.paddingTop "14px"→undefined
- `body>div:nth-child(4)>header>div>div:nth-child(3)>nav>ul>li:nth-child(1)>a` — file: `src\components\site-header.tsx:53` _(confidence: low; text-content)_: box [0.571,0.042,0.0611,0.0176]→[0.6,0.045,0.0653,0.012], fontSizePx 14→13.312000000000001, googleFontFamily "IBM Plex Sans"→"Montserrat", color "#f2f5f1"→"#d3dcd8", align "start"→"left", style.paddingBottom "14px"→undefined, style.paddingTop "14px"→undefined
- `body>div:nth-child(4)>header>div>div:nth-child(3)>nav>ul>li:nth-child(2)>a` — file: `src\components\site-header.tsx:55` _(confidence: low; text-content)_: box [0.6529,0.042,0.0285,0.0176]→[0.6927,0.045,0.0313,0.012], fontSizePx 14→13.312000000000001, googleFontFamily "IBM Plex Sans"→"Montserrat", color "#f2f5f1"→"#d3dcd8", align "start"→"left", style.paddingBottom "14px"→undefined, style.paddingTop "14px"→undefined
- `.z-40` (body>div:nth-child(4)>header) — file: `src\components\site-header.tsx:187` _(confidence: high; exact-multi-class)_: kind "panel"→"background", content undefined→"dark green navigation bar", box [0,0,1,0.0996]→[0,0,1,0.1], style.paddingLeft 48.1px→55.3px (implied from 6 matched children), style.paddingTop 29px→22.5px (implied from 6 matched children)
- `.header-search` (body>div:nth-child(4)>header>div>div:nth-child(1)>button) — file: `src\components\site-header.tsx:197` _(confidence: medium; distinctive-single-class)_: kind "button"→"icon", content "Search"→"search", box [0.0313,0.0283,0.0484,0.043]→[0.036,0.041,0.0153,0.02], fontSizePx 14→undefined, fontWeight 400→undefined, googleFontFamily "IBM Plex Sans"→undefined, color "#f2f5f1"→"#d3dcd8", align "center"→undefined, style.display "flex"→undefined, style.gap "10px"→undefined

## Added elements — full target specs

Icon assets come as a pair. `<name>.svg` carries the design's declared colour and is the one to reference as an `<img>`, `background-image`, or `url()`; `<name>-inline.svg` paints with `currentColor` and works only inlined in the markup or as a `mask-image` whose call site sets the colour. Each spec below names its own pair.

- Added 4 (divider): asset none; x 27.9%, y 20.8%, 4.1% × 0.1% of the canvas.
- Added 15 (icon): asset `src/assets/design/added-015-user-account.svg`; x 90.2%, y 4.0%, 1.4% × 2.2% of the canvas.
- Added 16 (divider): asset none; x 93.3%, y 3.7%, 0.1% × 2.8% of the canvas.
- Added 17 (icon): asset `src/assets/design/added-017-shopping-bag.svg`; x 95.3%, y 4.0%, 1.3% × 2.2% of the canvas.
- Added 19 (divider): asset none; x 18.6%, y 62.9%, 3.5% × 0.1% of the canvas.
- Added 23 (text): asset none; x 27.3%, y 85.0%, 8.1% × 1.1% of the canvas.
- Added 24 (divider): asset none; x 27.3%, y 87.7%, 2.4% × 0.1% of the canvas.
- Added 25 (text): asset none; x 27.2%, y 89.4%, 8.5% × 1.0% of the canvas.
- Added 26 (divider): asset none; x 41.0%, y 63.6%, 0.1% × 29.0% of the canvas.
- Added 28 (text): asset none; x 42.1%, y 85.0%, 3.1% × 1.1% of the canvas.
- Added 29 (divider): asset none; x 42.1%, y 87.7%, 2.4% × 0.1% of the canvas.
- Added 30 (text): asset none; x 42.1%, y 89.5%, 6.7% × 0.9% of the canvas.
- Added 31 (divider): asset none; x 55.6%, y 63.6%, 0.1% × 29.0% of the canvas.
- Added 34 (divider): asset none; x 56.6%, y 87.7%, 2.4% × 0.1% of the canvas.
- Added 35 (text): asset none; x 56.5%, y 89.5%, 7.6% × 0.9% of the canvas.
- Added 36 (divider): asset none; x 69.9%, y 63.6%, 0.1% × 29.0% of the canvas.
- Added 39 (divider): asset none; x 70.9%, y 87.7%, 2.4% × 0.1% of the canvas.
- Added 40 (text): asset none; x 70.9%, y 89.5%, 10.6% × 0.9% of the canvas.
- Added 41 (divider): asset none; x 84.3%, y 63.6%, 0.1% × 29.0% of the canvas.
- Added 44 (divider): asset none; x 85.3%, y 87.7%, 2.4% × 0.1% of the canvas.
- Added 45 (text): asset none; x 85.3%, y 89.5%, 11.8% × 0.9% of the canvas.

### Added 4: divider — hero eyebrow line

- Kind: `divider`
- Content: hero eyebrow line
- Box: target-design px [429.056,212.992,62.464,1.024000000000001]; DOM-frame px [429,213,62.5,1]
- Insert: after `.eyebrow`[0/6] (#main-content>section:nth-child(1)>div:nth-child(1)>p:nth-child(1))
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color not specified; align not specified
- Style map: `{"background":"rgba(230,233,229,0.68)"}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 15: icon — user account

- Kind: `icon`
- Content: user account
- Box: target-design px [1385.472,40.96,21.504000000000133,22.528]; DOM-frame px [1385.5,41,21.5,22.5]
- Insert: before `body>div:nth-child(4)>header>div>div:nth-child(3)>nav>ul>li:nth-child(2)>a`
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color #d3dcd8; align not specified
- Style map: `{}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: inline iconSvg materialized as SVG, painted #d3dcd8; absolute path `D:\Projects\DDASilver_Web\artifacts\dda-redesign-2026-09-12\implementation-b\fidelity\plan\assets\added-015-user-account.svg`; suggested destination `src/assets/design/added-015-user-account.svg`; resolvable: yes
- Inline variant: absolute path `D:\Projects\DDASilver_Web\artifacts\dda-redesign-2026-09-12\implementation-b\fidelity\plan\assets\added-015-user-account-inline.svg`; suggested destination `src/assets/design/added-015-user-account-inline.svg`
- Colour: Use `added-015-user-account.svg` for an external `<img>`, `background-image`, or `url()`: its fill and stroke are the design's declared `#d3dcd8`. Use `added-015-user-account-inline.svg` (`currentColor`) only inlined in the markup or as a `mask-image` where the call site sets the colour.

### Added 16: divider — vertical navigation divider

- Kind: `divider`
- Content: vertical navigation divider
- Box: target-design px [1433.6,37.888,1.0240000000001146,28.672000000000004]; DOM-frame px [1433.5,37.9,1.1,28.7]
- Insert: before `body>div:nth-child(4)>header>div>div:nth-child(3)>nav>ul>li:nth-child(2)>a`
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color not specified; align not specified
- Style map: `{"background":"rgba(211,220,216,0.45)"}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 17: icon — shopping bag

- Kind: `icon`
- Content: shopping bag
- Box: target-design px [1464.3200000000002,40.96,19.455999999999676,22.528]; DOM-frame px [1464.3,41,19.5,22.5]
- Insert: before `body>div:nth-child(4)>header>div>div:nth-child(3)>nav>ul>li:nth-child(2)>a`
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color #d3dcd8; align not specified
- Style map: `{}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: inline iconSvg materialized as SVG, painted #d3dcd8; absolute path `D:\Projects\DDASilver_Web\artifacts\dda-redesign-2026-09-12\implementation-b\fidelity\plan\assets\added-017-shopping-bag.svg`; suggested destination `src/assets/design/added-017-shopping-bag.svg`; resolvable: yes
- Inline variant: absolute path `D:\Projects\DDASilver_Web\artifacts\dda-redesign-2026-09-12\implementation-b\fidelity\plan\assets\added-017-shopping-bag-inline.svg`; suggested destination `src/assets/design/added-017-shopping-bag-inline.svg`
- Colour: Use `added-017-shopping-bag.svg` for an external `<img>`, `background-image`, or `url()`: its fill and stroke are the design's declared `#d3dcd8`. Use `added-017-shopping-bag-inline.svg` (`currentColor`) only inlined in the markup or as a `mask-image` where the call site sets the colour.

### Added 19: divider — collection eyebrow line

- Kind: `divider`
- Content: collection eyebrow line
- Box: target-design px [285.696,644.096,54.271999999999935,1.024000000000001]; DOM-frame px [285.7,644.1,54.2,1]
- Insert: after `.eyebrow`[1/6] (#main-content>section:nth-child(2)>div>div>p:nth-child(1))
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color not specified; align not specified
- Style map: `{"background":"#9ca9a5"}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 23: text — POOJA UTENSILS

- Kind: `text`
- Content: POOJA UTENSILS
- Box: target-design px [418.81600000000003,870.4,124.92799999999988,11.26400000000001]; DOM-frame px [418.9,870.4,124.9,11.3]
- Insert: after `.collection-photo`[0/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(1)>a>span:nth-child(1))
- Typography: font-family Montserrat; font-size 11.264px; fitted-font-size not specified; font-weight 600; color #46615c; align left
- Style map: `{}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 24: divider — Pooja utensils label line

- Kind: `divider`
- Content: Pooja utensils label line
- Box: target-design px [419.84,898.048,36.86400000000003,1.024000000000001]; DOM-frame px [419.8,898,36.9,1]
- Insert: after `.collection-photo`[0/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(1)>a>span:nth-child(1))
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color not specified; align not specified
- Style map: `{"background":"#a8b0ad"}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 25: text — RITUALS & TRADITION

- Kind: `text`
- Content: RITUALS & TRADITION
- Box: target-design px [417.79200000000003,915.456,130.048,10.240000000000009]; DOM-frame px [417.8,915.5,130.1,10.2]
- Insert: after `.collection-photo`[0/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(1)>a>span:nth-child(1))
- Typography: font-family Montserrat; font-size 9.216000000000001px; fitted-font-size not specified; font-weight 500; color #8b9190; align left
- Style map: `{}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 26: divider — collection card divider

- Kind: `divider`
- Content: collection card divider
- Box: target-design px [629.76,651.264,2.048000000000002,296.96000000000004]; DOM-frame px [629.8,651.3,2,297]
- Insert: after `.collection-photo`[1/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(1))
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color not specified; align not specified
- Style map: `{"background":"#e0e3df"}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 28: text — COINS

- Kind: `text`
- Content: COINS
- Box: target-design px [646.144,870.4,47.10399999999993,11.26400000000001]; DOM-frame px [646.2,870.4,47.2,11.3]
- Insert: after `.collection-photo`[1/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(1))
- Typography: font-family Montserrat; font-size 11.264px; fitted-font-size not specified; font-weight 600; color #46615c; align left
- Style map: `{}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 29: divider — Coins label line

- Kind: `divider`
- Content: Coins label line
- Box: target-design px [647.168,898.048,36.86400000000003,1.024000000000001]; DOM-frame px [647.1,898,36.9,1]
- Insert: after `.collection-photo`[1/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(1))
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color not specified; align not specified
- Style map: `{"background":"#a8b0ad"}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 30: text — A LASTING VALUE

- Kind: `text`
- Content: A LASTING VALUE
- Box: target-design px [646.144,916.48,102.39999999999998,9.216000000000008]; DOM-frame px [646.2,916.5,102.5,9.2]
- Insert: after `.collection-photo`[1/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(1))
- Typography: font-family Montserrat; font-size 9.216000000000001px; fitted-font-size not specified; font-weight 500; color #8b9190; align left
- Style map: `{}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 31: divider — collection card divider

- Kind: `divider`
- Content: collection card divider
- Box: target-design px [854.0160000000001,651.264,2.048000000000002,296.96000000000004]; DOM-frame px [854,651.3,2,297]
- Insert: after `.collection-photo`[2/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(3)>a>span:nth-child(1))
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color not specified; align not specified
- Style map: `{"background":"#e0e3df"}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 34: divider — Idols label line

- Kind: `divider`
- Content: Idols label line
- Box: target-design px [869.376,898.048,36.86400000000003,1.024000000000001]; DOM-frame px [869.4,898,36.9,1]
- Insert: after `.collection-caption`[1/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(2))
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color not specified; align not specified
- Style map: `{"background":"#a8b0ad"}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 35: text — FAITH & BLESSINGS

- Kind: `text`
- Content: FAITH & BLESSINGS
- Box: target-design px [868.3520000000001,916.48,116.73599999999988,9.216000000000008]; DOM-frame px [868.3,916.5,116.7,9.2]
- Insert: after `.collection-caption`[1/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(2))
- Typography: font-family Montserrat; font-size 9.216000000000001px; fitted-font-size not specified; font-weight 500; color #8b9190; align left
- Style map: `{}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 36: divider — collection card divider

- Kind: `divider`
- Content: collection card divider
- Box: target-design px [1074.176,651.264,1.0239999999998872,296.96000000000004]; DOM-frame px [1074.1,651.3,1.1,297]
- Insert: after `.collection-photo`[3/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(4)>a>span:nth-child(1))
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color not specified; align not specified
- Style map: `{"background":"#e0e3df"}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 39: divider — Utensils label line

- Kind: `divider`
- Content: Utensils label line
- Box: target-design px [1089.536,898.048,36.863999999999805,1.024000000000001]; DOM-frame px [1089.5,898,36.9,1]
- Insert: after `#main-content>section:nth-child(2)>div>nav>div>a:nth-child(5)`
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color not specified; align not specified
- Style map: `{"background":"#a8b0ad"}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 40: text — FOR EVERYDAY LIVING

- Kind: `text`
- Content: FOR EVERYDAY LIVING
- Box: target-design px [1089.536,916.48,162.81600000000003,9.216000000000008]; DOM-frame px [1089.5,916.5,162.8,9.2]
- Insert: after `#main-content>section:nth-child(2)>div>nav>div>a:nth-child(5)`
- Typography: font-family Montserrat; font-size 9.216000000000001px; fitted-font-size not specified; font-weight 500; color #8b9190; align left
- Style map: `{}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 41: divider — collection card divider

- Kind: `divider`
- Content: collection card divider
- Box: target-design px [1295.3600000000001,651.264,1.0239999999998872,296.96000000000004]; DOM-frame px [1295.3,651.3,1.1,297]
- Insert: after `.collection-photo`[4/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(5)>a>span:nth-child(1))
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color not specified; align not specified
- Style map: `{"background":"#e0e3df"}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 44: divider — Gifts label line

- Kind: `divider`
- Content: Gifts label line
- Box: target-design px [1310.72,898.048,36.863999999999805,1.024000000000001]; DOM-frame px [1310.7,898,36.9,1]
- Insert: after `.collection-caption`[3/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(4)>a>span:nth-child(2))
- Typography: font-family not specified; font-size not specified; fitted-font-size not specified; font-weight not specified; color not specified; align not specified
- Style map: `{"background":"#a8b0ad"}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

### Added 45: text — THOUGHTFUL & TIMELESS

- Kind: `text`
- Content: THOUGHTFUL & TIMELESS
- Box: target-design px [1310.72,916.48,181.24800000000005,9.216000000000008]; DOM-frame px [1310.7,916.5,181.2,9.2]
- Insert: after `.collection-caption`[3/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(4)>a>span:nth-child(2))
- Typography: font-family Montserrat; font-size 9.216000000000001px; fitted-font-size not specified; font-weight 500; color #8b9190; align left
- Style map: `{}`
- Visual fields: surface vector; opacity not specified; rotation not specified
- Asset: none referenced by the target node

## Before you commit

- Every raster layer above is present in the page: photo (`clean-1`), photo (`crop-22`), photo (`crop-37`), photo (`crop-27`), photo (`crop-32`), photo (`crop-42`).
- Tokens applied at the token layer, not per element.
- Screenshot the page and put it beside `winner.png`.
- No console errors.
- Real content, data, and controls intact.

## Implementation guardrails

- Preserve all real content, data, and controls. Do not fabricate product features or copy.
- Never approximate an existing asset with CSS: if the LayerDoc declares a raster layer, ship its file.
- In Tailwind v4, verify arbitrary custom-property forms against the installed compiler before using them.
- Quote CSS `url(...)` values when paths contain punctuation or whitespace.
- Update the page content-security policy before introducing any data URI.
- Implement silently. Log only adapted or skipped items and the reason.

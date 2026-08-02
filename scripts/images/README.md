# Coin image workflow

`build-coin-pairs.mjs` extracts matching fronts and backs from two source
photographs, applies restrained deterministic enhancement, places the neutral
DDA watermark behind the coins, and writes square PNG catalog images.

## Run

```powershell
npm run -- images:build-coin-pairs -- `
  --front="C:\path\to\fronts.jpeg" `
  --back="C:\path\to\backs.jpeg" `
  --watermark="C:\path\to\dda_logo_true_transparent.png" `
  --manifest="scripts\images\lakshmi-ganesh-round-coins.json" `
  --output-dir="public\images\silver-coins"
```

Use `npm run -- images:build-coin-pairs -- --help` for the argument summary.

## Manifest

The manifest defines the output canvas and one crop for each weight:

- `cx` and `cy`: coin centre in source-image pixels.
- `radius`: coin radius in source-image pixels.
- `output`: output filename only; directory traversal is rejected.

The script validates every crop against its source image before writing any
files. Adjust the manifest for a new coin series, then add that series to
`scripts/sanity/upload-coin-products.ts`.

## Idol image workflow

Use `process-idol-batch.mjs` for idol photos. It extracts measurements with
OCR, removes backgrounds through one reusable local rembg session, composites
the cutouts onto the fixed DDA Silver template, and writes an upload-ready
Sanity manifest.

See `docs/idol-image-pipeline.md` for the catalog format and commands.

## Utensil image workflow

`process-utensil-batch.mjs` extracts utensils from already approved or
AI-enhanced source images through the reusable rembg worker, then places each
cutout on the fixed DDA Silver background without regenerating the brand art.
It writes 1254 x 1254 PNGs, a Sanity manifest, and a review CSV.

```powershell
npm run utensils:process -- -- "C:\path\to\AI Enhanced Gallery" `
  --catalog=scripts/images/utensil-batch-2026-08-02.json `
  --output-dir=public/images/silver-utensils/ai-gallery-2026-08-02 `
  --apply
```

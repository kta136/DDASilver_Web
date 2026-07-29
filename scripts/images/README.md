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

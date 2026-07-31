# Fast idol image pipeline

The idol pipeline turns a folder of black-background product photos into
Sanity-ready, square catalog images. It reuses one OCR worker, one rembg
session per selected model, the fixed DDA Silver background, four Sharp
compositing workers, and three concurrent Sanity asset uploads.

The original photographs are never changed. Product image binaries remain
excluded from Git by `.gitignore`.

## One-time setup

The workstation has an NVIDIA GPU, so the default setup selects the Windows
DirectML GPU provider and falls back to CPU when acceleration is unavailable:

```powershell
npm run idols:setup
```

This installs the Python tools through `uv` and caches the `u2net` model. Use
`npm run idols:setup -- -- --device=cpu` on a machine without a compatible
GPU. The second `--` keeps npm from treating pipeline flags as npm settings.

## Fastest first pass

Run a new folder without a catalog. OCR extracts the measurements, the local
GPU builds all images, and the command creates an editable catalog draft:

```powershell
npm run idols:process -- -- `
  "C:\Users\kk\Desktop\New idol photos" `
  --start-number=34 `
  --apply
```

Fill the blank identity, code family, slug, description, alt text, and deity
IDs in `idol-batch-catalog.draft.json`. Weight, height, source filename,
product number, and output filename are already populated. Rerun with that
draft:

```powershell
npm run idols:process -- -- `
  "C:\Users\kk\Desktop\New idol photos" `
  --catalog="public\images\silver-idols\batch-name\idol-batch-catalog.draft.json" `
  --apply
```

The completed images are reused, so this second pass only validates metadata
and rebuilds the Sanity manifest.

## Batch catalog

The generated draft is the quickest starting point. Alternatively, copy
`scripts/images/idol-batch.example.json` and add one product for every source
photo. `sourceFilename` must match the photo exactly.

Required upload metadata:

- `codeFamily`: the two-letter deity/family code, such as `GN`, `HN`, or `SH`
- `title`: the display title without weight or height
- `slug`: the unique Sanity slug
- `description`: the product description without weight or height; the
  uploader appends both measurements
- `alt`: accessible image description
- `deityIds`: one or more existing Sanity deity document IDs

`weightGrams` and `heightInches` are optional. OCR reads them from the photo
label; catalog values override OCR when supplied. `assignedItemCode` is also
optional. When it is omitted, the Sanity uploader allocates the next available
`HM-<family>-<number>` code.

Use `subjectScale` only when an unusually wide or tall idol needs a small
manual scale adjustment, for example `0.92`.

The default `u2net` model is the fastest and cleanest choice for normal
single-subject photos. A difficult multi-piece source can set
`"backgroundModel": "isnet-general-use"` on that catalog product. Products are
grouped by model, so each required model is loaded only once per batch.

## Dry run

Start with a dry run. It performs OCR and reports missing metadata, but it does
not create images or change Sanity:

```powershell
npm run idols:process -- -- `
  "C:\Users\kk\Desktop\New idol photos" `
  --catalog="scripts\images\idol-batch-2026-08-01.json"
```

## Build images

After the review is clean:

```powershell
npm run idols:process -- -- `
  "C:\Users\kk\Desktop\New idol photos" `
  --catalog="scripts\images\idol-batch-2026-08-01.json" `
  --apply
```

The command writes:

- one 1254 × 1254 PNG for every idol
- `product-measurements.csv`
- `sanity-idol-manifest.json`
- `idol-batch-catalog.draft.json` when no catalog was supplied

Existing output images are reused. Pass `--overwrite-images` only when they
must be rebuilt.

The default cleanup pulls the extracted matte inward by three source pixels.
This removes black-backdrop contamination from the semi-transparent boundary
without the soft white fringe produced by full alpha matting. It also removes
measurement stickers from either top or bottom corners and preserves
vertically aligned pieces in wide product sets.

## Upload to Sanity

Review the PNGs, CSV, and manifest. Then either rerun the processor with
`--apply --upload`, or upload the generated manifest directly:

```powershell
npm run sanity:upload-idol-manifest -- -- `
  -- `
  --manifest="public\images\silver-idols\batch-name\sanity-idol-manifest.json"
```

The direct command above is a Sanity dry run. Add `--apply` after its manifest
argument to upload. Asset uploads use concurrency three, and all product
documents are published together in one Sanity transaction. Use `--overwrite`
only when existing matching product documents should be replaced.

## Useful controls

```text
--limit=1              Test one image
--device=gpu|cpu       Force the background-removal device
--model=u2net          Select a rembg model
--alpha-matting        Slower edge refinement for difficult subjects
--concurrency=1..8     Control local compositing workers
--keep-temp            Keep transparent cutouts for diagnosis
--skip-ocr             Require catalog measurement overrides
```

Image generation is not part of the normal path. Use it only to repair an
exceptional source that the deterministic mask cannot clean reliably.

On the configured workstation, the 14-photo clean-edge validation batch
completed OCR, GPU cutouts, four-way compositing, and manifest generation in
20.2 seconds after the one-time model setup.

# 12ui improve kit

Input: url `http://localhost:3000/`
Picked candidate: bring-your-own target

## Status

- capture: settled
- draft: skipped — a target was supplied
- pick: skipped — a target was supplied
- convert: settled
- plan: settled — emitted with low anchor overlap (48.1% of 60.0%); the capture is the requested page, so the target is largely new work
- Target: LayerDoc only
- Kit: not git-ignored — see the note; add `artifacts/dda-redesign-2026-09-12/implementation-b/fidelity/` to .gitignore before committing.

Every requested stage settled. The kit is complete.

## Start here

Bounds are % of the capture frame (1536×1024); `winner.png` is the design at its own size (1536×1024); place by percentage, not by pixel.

1. Open `capture\source.png`. It is the design.
2. Copy the files the assets table below marks ship into the repository; the rest are references and alternates.
3. Apply `plan/token-patch.css` once, at the token layer, not per element.
4. Work `plan/plan-annotated.md` in its own order: raster layers, then matched changes, then added elements.
5. Before committing, screenshot the page and put it beside `capture\source.png`.

## Assets: what each file is

- clean plate (`clean-N`): the backdrop with the foreground artwork removed. Use it as the background layer, at full strength.
- cutout (`cutout-N`): the foreground artwork as an alpha PNG. This is the imagery. Copy it into the repo and place it at its bounds; never redraw it in CSS.
- upscaled plate (`upscaled-plate-N`): a higher-resolution copy of a plate for crisp rendering; pick one resolution, do not ship both.
- upscaled region (`upscaled-region-N`): a higher-resolution copy of a region for crisp rendering; pick one resolution, do not ship both.
- source crop (`crop-N`): the layer cropped straight out of the source image. Prefer that layer's cutout when one exists.
- `capture\source.png`: the whole design; the reference for every visual decision.
- Icons (`plan/assets/added-*.svg`): reference `<name>.svg` — it carries the design's declared colour and is safe as an `<img>`, `background-image`, or `url()`; its `<name>-inline.svg` sibling paints with `currentColor` and is for inlining in the markup or masking with a token colour.

Ordered by how much of the canvas the layer covers.

Ship means copy this file into the repository. An alternate resolution is the same layer at another size — pick one. An alternate backdrop is the same plate with a further layer removed as well — it is the background only if you omit that layer. A reference is read, never shipped.

Plates and cutouts come out at full resolution and run over a megabyte. Pick one resolution per layer and optimise the PNG — or convert it to WebP where the repository already uses one — before committing. Keep the filename stem so the plan still matches.

| File | Ship | Role | Layer | Bounds | What to do with it |
| --- | --- | --- | --- | --- | --- |
| `capture\source.png` | reference only | winner.png — hero imagery | whole design | 100.0% × 100.0% at 0.0%, 0.0% | the whole design; the reference for every visual decision. |
| `target\winner.layerdoc.json.assets\clean-1-149a5afce9eb.png` | ship | clean plate — hero imagery | photo — hero silver thali arrangement on marble with flowers | 100.0% × 47.4% at 0.0%, 9.9% | the backdrop with the foreground artwork removed. Use it as the background layer, at full strength. |
| `target\winner.layerdoc.json.assets\upscaled-plate-1-3c8eead9cda6.png` | alternate resolution | upscaled plate — hero imagery | photo — hero silver thali arrangement on marble with flowers | 100.0% × 47.4% at 0.0%, 9.9% | a higher-resolution copy of a plate for crisp rendering; pick one resolution, do not ship both. |
| `target\winner.layerdoc.json.assets\crop-22-a5723715a6dd.png` | ship | source crop | photo — Pooja utensils collection product image | 12.9% × 20.2% at 27.2%, 63.5% | the layer cropped straight out of the source image. Prefer that layer's cutout when one exists. |
| `target\winner.layerdoc.json.assets\upscaled-region-22-b9968f2ea841.png` | alternate resolution | upscaled region | photo — Pooja utensils collection product image | 12.9% × 20.2% at 27.2%, 63.5% | a higher-resolution copy of a region for crisp rendering; pick one resolution, do not ship both. |
| `target\winner.layerdoc.json.assets\crop-37-afc6f20f546e.png` | ship | source crop | photo — Utensils collection product image | 12.4% × 20.2% at 70.9%, 63.5% | the layer cropped straight out of the source image. Prefer that layer's cutout when one exists. |
| `target\winner.layerdoc.json.assets\upscaled-region-37-0793404513dc.png` | alternate resolution | upscaled region | photo — Utensils collection product image | 12.4% × 20.2% at 70.9%, 63.5% | a higher-resolution copy of a region for crisp rendering; pick one resolution, do not ship both. |
| `target\winner.layerdoc.json.assets\crop-27-904fa47123f6.png` | ship | source crop | photo — Coins collection product image | 12.3% × 20.2% at 42.2%, 63.5% | the layer cropped straight out of the source image. Prefer that layer's cutout when one exists. |
| `target\winner.layerdoc.json.assets\crop-32-f260f3b27d1e.png` | ship | source crop | photo — Idols collection product image | 12.3% × 20.2% at 56.6%, 63.5% | the layer cropped straight out of the source image. Prefer that layer's cutout when one exists. |
| `target\winner.layerdoc.json.assets\crop-42-9f2a054beb15.png` | ship | source crop | photo — Gifts collection product image | 12.3% × 20.2% at 85.3%, 63.5% | the layer cropped straight out of the source image. Prefer that layer's cutout when one exists. |
| `target\winner.layerdoc.json.assets\upscaled-region-27-e41c3e64c361.png` | alternate resolution | upscaled region | photo — Coins collection product image | 12.3% × 20.2% at 42.2%, 63.5% | a higher-resolution copy of a region for crisp rendering; pick one resolution, do not ship both. |
| `target\winner.layerdoc.json.assets\upscaled-region-32-d49dd818c1b3.png` | alternate resolution | upscaled region | photo — Idols collection product image | 12.3% × 20.2% at 56.6%, 63.5% | a higher-resolution copy of a region for crisp rendering; pick one resolution, do not ship both. |
| `target\winner.layerdoc.json.assets\upscaled-region-42-244739cd610b.png` | alternate resolution | upscaled region | photo — Gifts collection product image | 12.3% × 20.2% at 85.3%, 63.5% | a higher-resolution copy of a region for crisp rendering; pick one resolution, do not ship both. |
| `target\winner.layerdoc.json.assets\source-762f0cb8253b.png` | reference only | prepared source | whole design | full canvas | the normalized image the conversion read; the same picture as `winner.png`. |

### Never discard

- `capture\source.png`.
- Every cutout and plate this table names.
  - Hero imagery: `target\winner.layerdoc.json.assets\clean-1-149a5afce9eb.png` (clean plate).
- All real content, data, controls, routes, and tests.

Scrims over a plate stay light (at most 35% opacity), and the plan must say why one is used.

## Guardrails

- Preserve all real content, data, and controls. Do not fabricate product features or copy.
- Do not describe emptiness or thin content as a defect: that phrasing can invite fabricated UI.
- Verify Tailwind v4 arbitrary custom-property syntax, quote CSS `url(...)` values, and update CSP before introducing data URIs.
- Never use the raw candidate PNG as a shipped asset; ship the extracted cutouts and plates.
- Never scrim imagery away. A heavy overlay is a fidelity defect, not a readability fix.
- Do not add decoration the design does not contain.

## Fonts

- Cormorant Garamond (weights 400). `plan/token-patch.css` declares it as a token and imports nothing. Load the family the way this repository already loads fonts — self-host it, or add it to the existing loader — or keep the current family and skip the token.
- Montserrat (weights 400, 600). `plan/token-patch.css` declares it as a token and imports nothing. Load the family the way this repository already loads fonts — self-host it, or add it to the existing loader — or keep the current family and skip the token.

## Spend ledger

Nothing was purchased against this kit.

## Anatomy

- `improve.json` is the durable stage, purchase, price-ceiling, and replay record.
- `capture/` and `current.domdoc.json` hold the screenshot and selector-verified DOM extraction.
- `candidates/` keeps every generated option and its draft record; `winner.png` is the explicit image target.
- `target/` holds the target LayerDoc, responsive HTML when generated, and extracted assets.
- `plan/` holds the diff, implementation plan, token patch, added-element assets, `GATE.md` when anchoring was unsafe, or `STALL.md` when a stage did not settle.

## Replay

- Apply the plan in the owning repository, then verify behavior and screenshots there. This kit never applies code.
- Re-run from `pick` with another `--pick` slot to reuse capture and candidates; settled paid stages replay.
- This kit captured with `--bootstrap`. `improve.json` keeps only the redacted triple (`|button:has-text("Essential only")|`) and its sha256 — the live value, session token included, is stored nowhere. A re-capture needs `--bootstrap` passed again.

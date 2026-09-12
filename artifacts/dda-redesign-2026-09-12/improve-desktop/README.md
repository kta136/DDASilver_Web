# 12ui improve kit

Input: image `D:\Projects\DDASilver_Web\artifacts\website-screenshots-2026-09-12\desktop\home--section-01.png`
Picked candidate: not yet picked — nothing has been converted

## Status

- capture: replayed — replayed 1×, bought once
- draft: settled
- pick: INCOMPLETE
- convert: INCOMPLETE
- plan: INCOMPLETE
- Target: none
- Kit: not git-ignored — see the note; add `artifacts/dda-redesign-2026-09-12/improve-desktop/` to .gitignore before committing.

This kit is INCOMPLETE: no LayerDoc, no assets, no target HTML, no plan.

The draw is ready and nothing has been picked. The CLI stops after drafting by design: nothing is converted until you choose a candidate, because converting a candidate nobody chose spends money on a guess.

Recovery — pick a candidate; convert and plan run from there:

    12ui improve 'D:\Projects\DDASilver_Web\artifacts\website-screenshots-2026-09-12\desktop\home--section-01.png' --out-dir 'D:\Projects\DDASilver_Web\artifacts\dda-redesign-2026-09-12\improve-desktop' --from pick --pick <A-D>  # picks a candidate, then buys its conversion and plan

Once the LayerDoc exists, carry its raster layers as real assets — copy the files and reference them. Do not approximate the design's layout or text in CSS from the PNG while a stage is incomplete; resume or convert first.

## Start here

Pick a candidate first (command above); steps 2 to 4 need the target that the pick produces.

Bounds are % of the capture frame (1440×1000); `winner.png` is the design at its own size; place by percentage, not by pixel.

1. Open the candidate PNGs in `candidates/` and pick one (command above). `capture/source.png` is the page as it is today, not the design.
2. Copy the files the assets table below marks ship into the repository; the rest are references and alternates.
3. Apply `plan/token-patch.css` once, at the token layer, not per element.
4. Work `plan/plan-annotated.md` in its own order: raster layers, then matched changes, then added elements.
5. Before committing, screenshot the page and put it beside `source.png`.

## Assets: what each file is

- clean plate (`clean-N`): the backdrop with the foreground artwork removed. Use it as the background layer, at full strength.
- cutout (`cutout-N`): the foreground artwork as an alpha PNG. This is the imagery. Copy it into the repo and place it at its bounds; never redraw it in CSS.
- upscaled plate (`upscaled-plate-N`): a higher-resolution copy of a plate for crisp rendering; pick one resolution, do not ship both.
- upscaled region (`upscaled-region-N`): a higher-resolution copy of a region for crisp rendering; pick one resolution, do not ship both.
- source crop (`crop-N`): the layer cropped straight out of the source image. Prefer that layer's cutout when one exists.
- `source.png`: the whole design; the reference for every visual decision.
- Icons (`plan/assets/added-*.svg`): reference `<name>.svg` — it carries the design's declared colour and is safe as an `<img>`, `background-image`, or `url()`; its `<name>-inline.svg` sibling paints with `currentColor` and is for inlining in the markup or masking with a token colour.

This kit has no extracted assets yet. Resume before coding.

### Never discard

- `source.png`.
- Every cutout and plate the kit extracts once the run completes.
- All real content, data, controls, routes, and tests.

Scrims over a plate stay light (at most 35% opacity), and the plan must say why one is used.

## Guardrails

- Preserve all real content, data, and controls. Do not fabricate product features or copy.
- Do not describe emptiness or thin content as a defect: that phrasing can invite fabricated UI.
- Verify Tailwind v4 arbitrary custom-property syntax, quote CSS `url(...)` values, and update CSP before introducing data URIs.
- Never use the raw candidate PNG as a shipped asset; ship the extracted cutouts and plates.
- Never scrim imagery away. A heavy overlay is a fidelity defect, not a readability fix.
- Do not add decoration the design does not contain.

## Spend ledger

Every purchase this kit made, from `improve.json` and the run journal. Paste it into the report as it is; an id that is here and not in the report is spend nobody accounted for.

| purchase | stage | invocation | price ceiling |
| --- | --- | --- | --- |
| `crt-6a22d82bb0a30ecc1ca96d85fdbc6a84d01076f6` | draft | `improve` pid 24284, started 2026-09-12T09:32:29.017Z | $0.12 (stage ceiling) |
| `crt-8277efdddedaaa9a47388993a7a12cce6152bade` | unattributed | `improve` pid 14344, started 2026-09-12T09:28:45.217Z | no ceiling recorded |

2 purchases across 2 runs. Ceilings are per stage, not per purchase; the distinct ceilings above total $0.12. Actual prices settle server-side and are not in the kit; read them with `12ui spend`, whose runs are keyed by the ids above.

1 purchase is marked `unattributed`: the journal recorded it but no stage of `improve.json` claims it. Report it anyway — it was bought.

## Anatomy

- `improve.json` is the durable stage, purchase, price-ceiling, and replay record.
- `source.png` is the normalized source screenshot.
- `candidates/` keeps every generated option and its draft record; `winner.png` is the explicit image target.
- `target/` holds the target LayerDoc, responsive HTML when generated, and extracted assets.
- `plan/` holds the diff, implementation plan, token patch, added-element assets, `GATE.md` when anchoring was unsafe, or `STALL.md` when a stage did not settle.

## Replay

- Apply the plan in the owning repository, then verify behavior and screenshots there. This kit never applies code.
- Re-run from `pick` with another `--pick` slot to reuse capture and candidates; settled paid stages replay.

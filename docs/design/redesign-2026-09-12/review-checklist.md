# DDA Silver mockup review

> Updated scope: a complete redesign is required. The first design language and all improve-based candidates are superseded. Use Version 2 of `design-language.md`. Color contrast figures below refer only to the old palette and must not be applied to the new midnight-green system.

Use with `design-language.md`. This checklist records what a concept must demonstrate; passing a visual review does not verify production behavior.

## Required visual coverage

| Surface | What to inspect |
| --- | --- |
| Desktop home | Recognizable brand, real hero object, concise introduction, category discovery, featured products, showroom invitation, footer |
| Mobile home | Product visible in the opening screen; readable brand; compact navigation; clear primary action |
| Catalog / category | Short introduction, coherent search and filter location, early product grid, visible product facts and pagination |
| Product detail | Full object and watermark, readable title, reference, true specifications, honest price state, enquiry |
| Live rates | Instrument labels, readable values, units where verified, source/freshness context, honest unavailable state |
| Contact / editorial | Same visual language, actual business details, readable content column and practical links |

## Source of truth

- Screenshots: `artifacts/website-screenshots-2026-09-12/` in the project root. These are historical captures from September 12, 2026, not a live price feed.
- Full-page desktop and mobile screenshots, their sections, and source URLs are mapped in that archive's `manifest.json`.
- Family monogram actually used by the application: `public/brand/dda-family-mark-v1.webp`.
- Existing font families: Cormorant Garamond and Manrope, declared in `src/app/layout.tsx`.
- Business details: `src/lib/site.ts`.
- Authentication behavior: `src/app/(site)/login/page.tsx`; redirect to DDAJewels.
- Existing product detail example: `/products/dda-10-gram-oval-anniversary-silver-coin`.
- That captured product is 10 g, oval, and displayed as 99.80% purity. Do not infer schema purity from a different number engraved in the photograph.
- The captured product price and rate timestamp are historical. If copied into a mockup, label the mockup's data as a captured example in its surrounding review notes; do not represent it as today's quote.

Existing category names are Coin, Idols, Purse, Gifts, Boxes, Singhasan, Hatri, Jhula, Utensils, Gold Coins & Bars, and Phone Covers. Collection names in the captured site are Silver Ganesha Idols, Lakshmi–Ganesha Silver Idol Pairs, Silver Pooja Thali Sets, and Silver Wedding Gifts. New grouping labels may be proposed, but they must not imply new inventory.

## Baseline color contrast

### Current Version 2 palette

Computed solid-color contrast ratios: Mineral white / Midnight green **11.22:1**; Carbon / Mineral white **14.29:1**; Slate green / Mineral white **5.51:1**; Strong edge / White **3.59:1**; Silver gray / Midnight green **7.65:1**; Focus blue / Mineral white **5.27:1**. Actual generated images and later implementation still require rendered inspection.

### Superseded Version 1 palette

Computed from the proposed sRGB hex values using relative luminance. These values assess the solid color pairs only; they do not certify generated text, antialiasing, image overlays, or a future implementation.

| Pair | Ratio | Intended use |
| --- | --- | --- |
| Ink / Paper | 13.53:1 | Primary text |
| Muted ink / Paper | 5.54:1 | Secondary text |
| Porcelain / Copper | 6.63:1 | Primary button label |
| Control edge / Porcelain | 3.58:1 | Input boundary |
| Positive / Paper | 6.52:1 | Positive state text |
| Negative / Paper | 5.99:1 | Negative state text |
| Focus / Paper | 6.37:1 | Focus indicator |

## Rejection criteria

Reject or clearly flag a generated screen that replaces the family identity, distorts a product, crops a complete object or its watermark, fabricates a discount or review, invents a business age or certification, adds checkout or unsupported account fields, or presents invented rate history. A visually attractive screen can still fail the content brief.

If a good candidate contains a small generated-text or asset-fidelity defect, record it precisely and retain the real source asset for correction. Do not silently call the candidate production-ready. Working navigation in a generated prototype is not proof that backend actions work.

## Review record format

For each delivered mockup record its original file path, page/state, generation source, strengths, differences from the brief, and any corrections required before implementation. Distinguish generated images, generated prototype output, existing-site screenshots, and written specifications. Never present an existing-site capture as a new mockup.

The designer's selected direction is a recommendation. User approval is a separate event and is not implied by extending a candidate to evaluate its consistency across pages.

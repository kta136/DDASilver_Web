# Design QA

**Date:** 29 July 2026
**Target:** Reuse the live-rates experience from `https://ddajewels.com/rates`
inside the DDA Silver website
**Browser:** Codex in-app browser
**State:** Local production build, essential-only consent already resolved
**final result: passed**

## Comparison evidence

- Desktop source:
  `docs/design/source-ddajewels-desktop.png`
- Desktop implementation:
  `docs/design/implementation-dda-silver-desktop.png`
- Desktop side-by-side:
  `docs/design/comparison-desktop.png`
- Mobile source:
  `docs/design/source-ddajewels-mobile.png`
- Mobile implementation in the same collapsed market-row state as the source:
  `docs/design/implementation-dda-silver-mobile.png`
- Mobile side-by-side:
  `docs/design/comparison-mobile.png`

Both desktop captures use a 1440 × 1000 CSS viewport and produce a
1425 × 990 page image. Both mobile captures use a 390 × 844 CSS viewport and
produce a 375 × 811 page image. The source is on the left and the implementation
is on the right in each comparison.

## Intended reuse

The DDA Silver page preserves the DDAJewels rate experience:

- Four customer rows: Gold 999, Silver Bank, Agra Mohar, and Silver Coin 10gm.
- The customer value and movement presentation.
- Five market rows: Silver MCX, Gold MCX, Gold ($), Silver ($), and INR.
- Commodity, bid, ask, high, and low market values.
- Live connection state and automatic updates.

The rate-card and market-table structure, proportions, responsive rules, flash
states, and mobile high/low disclosure were ported from the `Live Rates`
repository implementation. The surrounding header, footer, logo, typography,
and colour tokens use the existing DDA Silver design system, as requested.

## Browser coverage

- Desktop: internal `/rates` route, DDA Silver page identity, compact customer
  card, market table, live status, and internal Live Rates navigation.
- Mobile: compact customer and market tables at 390 px, no page-level horizontal
  overflow, and the high/low disclosure control.
- Live data: the same-origin snapshot rewrite returned four customer items; the
  stream rewrite delivered snapshot, feed-status, source-snapshot, source, and
  rate events.
- Runtime: no framework overlay and no browser console warnings or errors.

## Findings and fixes

1. **P2 — the first mobile implementation inherited desktop minimum table
   widths.** Customer values and market values were clipped and a horizontal
   scrollbar appeared. Both tables now use fixed mobile column proportions,
   compact spacing, and responsive type sizes.
2. **P2 — the obsolete portal flow redirected visitors away from DDA Silver.**
   All DDA Silver Live Rates links now point to the local `/rates` route.
3. **P2 — the earlier adapter expected an older internal rate shape.** It now
   normalizes the public DDAJewels snapshot and live event families without
   fabricating missing values.
4. **P2 — the initial DDA Silver presentation approximated the source instead
   of porting it.** The oversized rates hero and app promo were removed; the
   compact customer card, market heading, desktop columns, mobile column rules,
   update flashes, and H/L disclosure now follow the `Live Rates` source.

All P2 findings were corrected and recaptured before the final comparison.

## Final review

| Area | Result | Notes |
| --- | --- | --- |
| Page identity | Pass | URL remains `/rates`; header, logo, navigation, and footer are DDA Silver. |
| Customer rates | Pass | Four source-defined rows render live values and movement amounts. |
| Market data | Pass | Five source-defined rows render bid, ask, high, and low values. |
| Source fidelity | Pass | Compact geometry and responsive behavior match the `Live Rates` implementation at both comparison viewports. |
| Responsive layout | Pass | No page-level horizontal overflow at 390 px. |
| Mobile disclosure | Pass | Silver MCX high/low expands, reports `aria-expanded=true`, and can collapse again. |
| Navigation | Pass | Both audited Live Rates links use `/rates`; no redirect or iframe is used. |
| Data authority | Pass | Values come from DDAJewels through fixed same-origin server rewrites. |
| Runtime | Pass | Production build and browser runtime checks pass without warnings or overlays. |

## Severity summary

- P0: 0
- P1: 0
- P2: 0

## Launch boundary

This QA covers the local production build. Production behavior on Oracle
Coolify is verified separately after a gated deployment. The site went live on
`ddasilver.com` after explicit owner authorization on 25 August 2026.

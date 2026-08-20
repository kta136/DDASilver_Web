# Images 2026-08-20 — AI generation audit

## Generation method

- Tool: OpenAI built-in image generation tool (`image_gen`), one referenced-image generation request per asset.
- Source of truth: the matching photograph in `C:\Users\kk\Desktop\Images`.
- Background reference: `public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png`.
- Final location: `public/images/gallery-ingestion/images-2026-08-20/images`.
- Output: one square 1254 × 1254 PNG for every source photograph.
- No repository image-generation or compositing script was used. File copies and dimension checks were mechanical only.

## Common prompt contract

Every generation request used the source photograph as image 1 and the approved DDA Silver background as image 2, with this contract adapted to the visible product:

> Create one finished ecommerce product gallery image by compositing image 1 onto image 2. Image 1 is the sole source of truth for the product. Preserve the exact product count, silhouette, proportions, components, engraving, relief, openwork, stones, beads, metal colours, wear and every visible decorative detail. Do not redesign, simplify, embellish, add, remove, duplicate or reinterpret any product feature. Remove the source setting, labels, people, unwanted reflections and all other surroundings. Use image 2 as the exact approved DDA Silver warm-ivory watermark background, retaining its faint central monogram and bottom-right DDA Silver branding unchanged and legible. Centre the complete product with consistent gallery margins and a soft realistic contact shadow. Use neutral luxury studio lighting, accurate silver colour and crisp detail. Add no props, product text or extra logos. Output a single square 1254 × 1254 PNG.

Product-specific clauses preserved handles, clasps, deity figures, chains, tassels, stone colours, set counts and integral bottle lettering where visible in the source. The decorative hollow-gun images were described as silver-finish rather than solid silver. The peacock-boat request preserved every photographed sculptural figure and excluded people outside the product sculpture.

## Source-to-output prompt subjects

| # | Source photograph | Final PNG | Product-specific subject constraint |
| ---: | --- | --- | --- |
| 1 | WhatsApp Image 2026-08-13 at 5.50.20 PM.jpeg | sg-12-scalloped-floral-round-silver-singhasan-6x4.png | Round Singhasan with scalloped floral-scroll back, pierced rail, engraved seat and raised base |
| 2 | WhatsApp Image 2026-08-13 at 8.26.59 PM.jpeg | jh-11-elephant-foot-twin-peacock-silver-jhula.png | Complete Jhula with elephant-form feet, twin-peacock back, floral openwork and suspended seat |
| 3 | WhatsApp Image 2026-08-14 at 1.06.55 PM.jpeg | sg-14-petite-pointed-floral-silver-singhasan-2x2-5.png | Petite pointed floral Singhasan with exact rails, seat and base |
| 4 | WhatsApp Image 2026-08-14 at 1.09.13 PM.jpeg | sg-15-compact-floral-fan-silver-singhasan-4x3.png | Compact floral-fan Singhasan with engraved platform and slender rails |
| 5 | WhatsApp Image 2026-08-14 at 12.40.50 PM.jpeg | sg-13-twin-peacock-floral-elephant-foot-silver-singhasan-7x5.png | Twin-peacock floral Singhasan with curved rails and elephant-form feet |
| 6 | WhatsApp Image 2026-08-14 at 12.43.23 PM.jpeg | sg-16-openwork-arch-floral-silver-singhasan-7x5.png | Openwork arch Singhasan with floral back, engraved seat and decorative base |
| 7 | WhatsApp Image 2026-08-14 at 12.48.14 PM.jpeg | sg-17-twin-peacock-bolster-silver-singhasan-7x5.png | Twin-peacock Singhasan with cylindrical bolsters and ornate feet |
| 8 | WhatsApp Image 2026-08-14 at 12.51.24 PM.jpeg | sg-18-tiered-floral-crown-silver-singhasan-9x7.png | Tiered floral-crown Singhasan with engraved platform and raised rails |
| 9 | WhatsApp Image 2026-08-14 at 12.58.16 PM.jpeg | sg-19-gold-accent-peacock-canopy-silver-singhasan-10x8.png | Gold-accent peacock Singhasan with suspended canopy and tiered base |
| 10 | WhatsApp Image 2026-08-15 at 2.17.14 PM.jpeg | sg-20-chrysanthemum-tree-round-silver-singhasan-6x4.png | Round Singhasan with branching chrysanthemum back, pierced rail and floral base |
| 11 | WhatsApp Image 2026-08-15 at 2.29.51 PM.jpeg | sg-21-tiered-leaf-floral-silver-singhasan-7x5.png | Tiered leaf-and-floral Singhasan with engraved seat and low rails |
| 12 | WhatsApp Image 2026-08-15 at 2.34.15 PM.jpeg | sg-22-peacock-fan-two-tier-silver-singhasan-7x5.png | Two-tier Singhasan with fan-tail peacock back, pierced rails and raised feet |
| 13 | WhatsApp Image 2026-08-15 at 2.40.28 PM.jpeg | sg-23-pink-accent-floral-round-silver-singhasan-7x5.png | Round Singhasan with pink floral accents, openwork back and decorative feet |
| 14 | WhatsApp Image 2026-08-15 at 3.53.53 PM.jpeg | bt-01-glass-floral-band-silver-bottle-11in.png | Transparent glass bottle with silver floral bands, fitted cap and gold-tone inner base |
| 15 | WhatsApp Image 2026-08-15 at 3.58.08 PM.jpeg | bt-02-fluted-shoulder-floral-silver-bottle-9-5in.png | Fluted-shoulder bottle with floral body panels and exact cap |
| 16 | WhatsApp Image 2026-08-15 at 3.59.40 PM.jpeg | bt-03-arched-botanical-panel-silver-bottle-9-5in.png | Bottle with arched botanical panels, tapered neck and decorative cap |
| 17 | WhatsApp Image 2026-08-15 at 4.03.04 PM.jpeg | bt-04-rectangular-scroll-panel-silver-bottle-10in.png | Bottle with rectangular scroll panels, polished shoulder and fitted cap |
| 18 | WhatsApp Image 2026-08-15 at 4.05.03 PM.jpeg | bt-05-plain-polished-silver-bottle-8in.png | Plain polished bottle with smooth cylindrical body and rounded shoulder |
| 19 | WhatsApp Image 2026-08-15 at 4.06.54 PM.jpeg | bt-06-plain-brushed-silver-bottle-10in.png | Plain brushed bottle with tall cylindrical profile and fitted cap |
| 20 | WhatsApp Image 2026-08-15 at 4.17.28 PM.jpeg | bt-07-faceted-leaf-panel-silver-bottle-11in.png | Tall bottle with faceted shoulders, leaf panels and decorative cap |
| 21 | WhatsApp Image 2026-08-15 at 4.19.59 PM.jpeg | bt-08-frosted-chivas-regal-silver-wine-bottle-10-5in.png | Frosted floral wine bottle; retain integral CHIVAS REGAL, 18 YEARS, GOLD SIGNATURE and ESTD 1801 lettering |
| 22 | WhatsApp Image 2026-08-15 at 4.21.31 PM.jpeg | bt-09-blackdog-floral-panel-silver-wine-bottle-12in.png | Floral-panel wine bottle; retain integral vertical BLACKDOG lettering |
| 23 | WhatsApp Image 2026-08-15 at 4.23.17 PM.jpeg | bt-10-enamel-peacock-elephant-silver-bottle-10in.png | Bottle with multicolour enamel peacocks, elephants and gold-tone borders |
| 24 | WhatsApp Image 2026-08-15 at 4.38.04 PM.jpeg | jpb-01-plain-nine-piece-silver-jain-pooja-box-set.png | Preserve all nine visible pieces of the plain Jain pooja box set and their relative arrangement |
| 25 | WhatsApp Image 2026-08-15 at 4.48.27 PM.jpeg | sd-01-scrollwork-glass-lid-silver-sindoor-dani.png | Scrollwork Sindoor Dani with transparent glass lid and finial |
| 26 | WhatsApp Image 2026-08-15 at 4.51.42 PM.jpeg | sd-02-plain-glass-lid-silver-sindoor-dani.png | Plain round Sindoor Dani with transparent glass lid and finial |
| 27 | WhatsApp Image 2026-08-15 at 4.53.34 PM.jpeg | sd-03-fluted-floral-lidded-silver-sindoor-dani.png | Fluted floral Sindoor Dani with fitted domed lid |
| 28 | WhatsApp Image 2026-08-15 at 4.55.19 PM.jpeg | sd-04-plain-glass-lid-silver-sindoor-dani-3in.png | Wide plain Sindoor Dani with transparent glass lid |
| 29 | WhatsApp Image 2026-08-15 at 4.56.40 PM.jpeg | sd-05-scrollwork-glass-lid-silver-sindoor-dani-3in.png | Wide scrollwork Sindoor Dani with transparent glass lid and finial |
| 30 | WhatsApp Image 2026-08-15 at 4.57.56 PM.jpeg | sd-06-floral-crystal-knob-silver-sindoor-dani-4in.png | Floral Sindoor Dani with tall lid and crystal-style knob |
| 31 | WhatsApp Image 2026-08-15 at 5.37.44 PM.jpeg | hg-01-silver-finish-hollow-gun-display-set.png | Decorative silver-finish hollow gun-shaped display piece and sealed eight-capsule pack |
| 32 | WhatsApp Image 2026-08-15 at 5.37.56 PM.jpeg | hg-02-silver-finish-hollow-gun-display-set-alt.png | Alternate source view of the same silver-finish hollow gun-shaped display piece |
| 33 | WhatsApp Image 2026-08-18 at 12.31.38 PM.jpeg | pr-01-peacock-floral-silver-clutch-purse.png | Silver clutch with sculpted handle, peacock motifs, floral relief, curved flap and clasp |
| 34 | WhatsApp Image 2026-08-18 at 12.33.07 PM.jpeg | pr-02-gold-lattice-pearl-fringe-silver-clutch-purse.png | Silver-and-gold clutch with floral lattice, pearl fringe, stones and exact clasp |
| 35 | WhatsApp Image 2026-08-18 at 12.34.57 PM.jpeg | pr-03-elephant-peacock-floral-silver-clutch-purse.png | Low rectangular clutch with central elephant, paired peacocks, floral lattice and clasp |
| 36 | WhatsApp Image 2026-08-18 at 12.35.48 PM.jpeg | pr-04-scroll-vine-round-handle-silver-clutch-purse.png | Round-handle purse with scroll-vine relief, leaf inlays, beaded borders and clasp |
| 37 | WhatsApp Image 2026-08-18 at 12.37.01 PM.jpeg | pr-05-honeycomb-floral-silver-clutch-purse.png | Broad round-handle purse with honeycomb openwork, fan motif and ring clasp |
| 38 | WhatsApp Image 2026-08-18 at 12.39.25 PM.jpeg | pr-06-vertical-floral-panel-silver-clutch-purse.png | Curved purse with round handle, vertical floral-and-beaded panels and clasp |
| 39 | WhatsApp Image 2026-08-18 at 12.40.17 PM.jpeg | pr-07-honeycomb-floral-silver-clutch-purse-alt.png | Alternate photograph of the 455 g honeycomb floral purse |
| 40 | WhatsApp Image 2026-08-18 at 12.42.08 PM.jpeg | pr-08-scallop-pattern-silver-clutch-purse.png | Compact handle-free clutch with scallop relief, chevron borders and floral clasp |
| 41 | WhatsApp Image 2026-08-18 at 3.11.16 PM.jpeg | pr-09-enamel-birds-pearl-fringe-silver-shoulder-purse.png | Preserve exact pink beaded strap, enamel birds, pearl border and full gold-chain fringe |
| 42 | WhatsApp Image 2026-08-18 at 3.12.47 PM.jpeg | pr-10-jeweled-peacock-tassel-silver-handbag.png | Preserve exact round handle, jeweled peacocks, pearl drops and green-beaded tassels |
| 43 | WhatsApp Image 2026-08-18 at 3.18.55 PM.jpeg | kl-01-lakshmi-relief-silver-kalash.png | Single Lakshmi kalash with exact deity reliefs, engraved neck and lower openwork band |
| 44 | WhatsApp Image 2026-08-18 at 3.19.31 PM.jpeg | kl-02-lakshmi-relief-silver-kalash-tumbler-set.png | Preserve both the Lakshmi kalash and matching tumbler, their scale and spacing |
| 45 | WhatsApp Image 2026-08-18 at 3.20.55 PM.jpeg | tb-01-lakshmi-relief-silver-tumbler-pair.png | Preserve both matching cylindrical tumblers and their deity and floral panels |
| 46 | WhatsApp Image 2026-08-19 at 12.19.52 PM.jpeg | sg-24-twin-peacock-round-silver-singhasan-7x5.png | Round Singhasan with twin peacocks, botanical openwork back and animal-form feet |
| 47 | WhatsApp Image 2026-08-19 at 12.21.59 PM.jpeg | sg-25-floral-back-silver-singhasan-8x6.png | Rectangular Singhasan with tall floral back, engraved seat, perforated rails and animal feet |
| 48 | WhatsApp Image 2026-08-19 at 12.33.49 PM.jpeg | ds-01-ceremonial-peacock-boat-silver-sculpture.png | Complete ceremonial boat with peacock prow, hull panels, canopy, vessels and every photographed figure |

## Review notes

- The two approval images were accepted by the user before the remaining folder was processed.
- No source photograph was edited, renamed or overwritten.
- DDA-UT-KL-110 was excluded from the active gallery at the owner's request because its source combines a kalash and a tumbler. Its generated PNG is retained only in `docs/product-gallery-approvals/images-2026-08-20/excluded/` for recovery and audit history.
- JH-11 and PR-24 remain pending duplicate review. HG-02 is confirmed as an alternate gallery image for HG-01, not a separate product.
- Image generation removed source labels from the pixels; all legible weights and dimensions were retained in the manifest and review CSV.

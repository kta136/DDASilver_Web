> Implemented Homepage B on 12 September 2026. Final typefaces follow B's converted reference: Cormorant Garamond for display text and Montserrat for interface text. B's approved campaign plate is used as editorial imagery; catalogue and category images remain the original Sanity photographs. The mockup shopping bag is a WhatsApp enquiry action. See `implementation-report.md` for scope and verification.

# DDA Silver — complete redesign language

Version 2 · 12 September 2026 · Supersedes the first language and every improvement candidate

## Selected visual reference — Homepage B

The user selected **alternative Homepage B from the fresh design set**. Its unchanged original is `artifacts/dda-redesign-2026-09-12/fresh-design/draft-run/candidates/B.png`. This selection supersedes the earlier recommendation of C and takes precedence over composition suggestions below.

Carry B's dark single-row masthead, centered DDA identity, search at the left, navigation balanced around the brand, large full-width green-and-stone editorial hero, and light collection panels into future design work. Use its dramatic scale and continuous image stage as the homepage reference. The two-level light masthead and vertical category index of C are no longer the selected direction.

The selected composition still needs the actual DDA logo and real product assets, a clear browse action, and an enquiry control in place of the generated shopping-bag icon. Selection does not introduce checkout or approve invented inventory. The existing desktop and portrait branch studies were generated from C; they remain earlier explorations, not completed B-based page designs. No live implementation has been made.

## 1. A new starting point

The user has explicitly requested a complete redesign. The first approach preserved too much: the same ivory and copper palette, the same font pairing, the same split hero, the same navigation composition, and the same general rhythm. Those concepts are rejected. This brief starts from the business and its objects, rather than the present interface.

The new direction is **The Silver House**: a contemporary Indian design house with the visual confidence of an exhibition, the clarity of a useful catalog, and the personal service of the Agra showroom. It should be recognizable as a new website at a glance, even before reading the text.

The DDA family logo, real product photographs, item facts, business details, existing routes, and enquiry-led business model are the continuity. Palette, typography, page architecture, navigation hierarchy, image arrangement, controls, and mobile composition are open to redesign.

The current website screenshots are factual references only. Do not feed them to generation as a layout or style reference. Use 12ui's fresh draft workflow to explore new compositions, then extend a selected new concept consistently across the website.

## 2. Experience concept

Organize the visitor experience around three clear intentions: **discover an object**, **check rates**, and **speak to the showroom**. Each intention gets a recognizable visual mode while sharing the same underlying brand.

Discovery feels like a curated exhibition: large imagery, memorable typographic scale, small captions, and deliberate pacing. Browsing feels like a catalog: immediate images, precise labels, predictable controls, and useful density. Rates feel like a reading instrument: aligned numbers, explicit units, source state, and restrained color. Contact feels personal and practical: a real address, real hours, and direct routes to people.

The visual experience should alternate dramatic and quiet spaces. A dark opening composition can establish identity; a light product grid can make comparison effortless. This contrast gives the site character without putting decorative effects around every component.

## 3. Visual identity

The lead direction uses **midnight green, mineral white, and silver gray**. This is a substantial departure from the current all-over warm ivory and copper. The familiar copper-colored family mark remains as a small signature; it no longer dictates the entire interface palette.

| Token | Proposed value | Role |
| --- | --- | --- |
| Midnight green | `#123B35` | Hero stage, major brand panels, primary actions |
| Deep green | `#092A25` | Hover state and dark footer |
| Mineral white | `#F2F5F1` | Main reading and catalog canvas |
| Gallery white | `#FFFFFF` | Input and detailed content surfaces |
| Silver gray | `#C4CECA` | Large secondary type and decorative lines on dark surfaces |
| Pale sage | `#DCE5DF` | Selected filters and gentle section backgrounds |
| Carbon | `#172622` | Text on light surfaces |
| Slate green | `#53675E` | Secondary text on light surfaces |
| Warm clay | `#B9816B` | Very limited brand detail, echoing the original mark |
| Strong edge | `#7B8B82` | Input and control boundaries |
| Error | `#AF343F` | Error text paired with an icon or explanation |
| Focus blue | `#225FD1` | Clear keyboard focus on light surfaces |

Use white or mineral white text on midnight green. Use carbon for body copy. Warm clay is decorative unless a tested pairing supports its text use. Treat these as the lead proposal, not a requirement that every draft use the same palette. The exploration may compare a strongly different charcoal-and-silver or oxblood-and-chalk alternative if it produces a better design for the business.

Surfaces are flat and clean. Do not cover the site in simulated paper grain, metallic gradients, beige washes, rounded floating cards, or soft shadows. Metal texture belongs to the objects. Use a fine vertical rule or an indexed caption to communicate exhibition-like precision.

## 4. Typography with a new silhouette

Replace the current Cormorant Garamond and Manrope treatment. The lead pairing is **Bodoni Moda** for major editorial statements and **IBM Plex Sans** for navigation, product names, descriptions, prices, and utilities. Bodoni creates a sharper, more sculptural shape; Plex provides an efficient, clear counterpoint. Use actual font files in later implementation and verify loading, licensing, and fallback behavior at that stage.

The typography is intentionally bimodal: very large short statements in editorial areas, compact useful headings in shopping and rates areas. Avoid scaling every page title up to the homepage's size.

| Role | Desktop | Mobile |
| --- | --- | --- |
| Main editorial statement | 88–112 px, line height 0.98–1.05 | 44–54 px, line height 1.05 |
| Section statement | 48–64 px, line height 1.1 | 32–38 px, line height 1.12 |
| Catalog title | 32–40 px sans serif, line height 1.15 | 28–32 px |
| Product detail title | 36–44 px, line height 1.12 | 28–34 px |
| Product name | 16–18 px sans serif | 14–16 px |
| Body | 17 px, line height 1.6 | 16 px, line height 1.6 |
| Utility / caption | 13–14 px | 13–14 px |
| Main rate | 32–40 px, tabular figures | 28–34 px |

Keep display statements short enough to have visual impact without becoming a wall of words. Proposed homepage lines include “Silver, made meaningful.” or “Objects for a life well lived.” These are concept copy, not historical or manufacturing claims. Do not fabricate provenance, years in business, awards, or promises.

Use sentence case, strong legibility, and sparing uppercase metadata. Product titles remain informative; references and measurements remain visible. Use Indian currency grouping and preserve the difference between metal rate, captured reference value, and product price.

## 5. Architecture and navigation

Replace the current logo-left / five-links-right header arrangement with a more deliberate two-level desktop masthead. A centered DDA lockup establishes the house identity; product search sits on one side and account or contact utility on the other. A compact second line gives direct access to Products, Live Rates, Our Showroom, and Guides. “Our Showroom” can lead to the existing About page with clear Contact access. Keep existing routes and link semantics; this is a navigation redesign, not a silent removal of pages.

On mobile, use a single compact header with the existing logo, a labeled menu control, and a useful search action. Opening search should expose real product search; it must not be a decorative icon. Put app download links in a lower, dedicated area. Let the first screen establish the silver objects and the new identity.

Product discovery has two levels. Categories answer what the object is; collections answer a particular interest or occasion. Keep those concepts distinct. All 11 real categories remain available, including Hatri, Jhula, and Phone Covers. A compact visible subset must always have a clear route to the full list.

## 6. Layout, proportions, and pacing

Use a maximum 1360 px content area at 1440 px desktop width, with a 12-column grid and 24 px gutters. Major editorial sections may span the full viewport. Mobile uses 20 px outer margins, with selected image stages intentionally reaching the edge. Supporting text remains inset and comfortable to read.

The spacing system is 4, 8, 12, 16, 24, 32, 48, 64, 96, and 128 px. Editorial transitions can be generous, while product comparison uses compact 16–24 px grouping. The important change is composition and rhythm, not simply reducing all spacing.

The homepage must avoid the existing left-paragraph/right-photo rectangle followed by a sprawling category grid. Explore a full-width dark editorial stage with a large typographic statement and an asymmetric composition of real product image panels; or a monumental central object with carefully placed captions and a clearly separate introduction. One product image can dominate while one or two smaller image panels establish the breadth of the collection. The panels retain the approved images in full, rather than inventing cutouts or cropping objects.

Move from that opening into a light, useful product section with meaningful labels. The first view should feel authored; the next should make browsing easy. Do not repeat the hero composition across category, detail, contact, and article pages.

## 7. Photography and brand fidelity

The existing DDA monogram is a real asset. Place that asset, rather than asking an image model to redraw it. The wordmark can retain its identity while changing its placement in the masthead. Do not create a new family symbol.

Product images must preserve the exact object: shape, engraving, ornament, color, proportions, weight context, and complete watermark. The approved warm ivory photographs may appear as intentionally inset plates within the new green or white interface. Their warm tone does not require every page surface to be ivory.

Do not invent a workshop, artisan portrait, palace showroom, or luxury interior. Actual photographs may be used when available. If a generated mockup cannot reproduce an existing asset faithfully, call that out and treat the image as a layout placeholder, never a replacement gallery asset. Only one or two detailed product examples are needed for the mockups.

## 8. Component language

**Buttons:** rectangular, approximately 2–4 px corner radii, 48 px minimum height. The main action is green on light surfaces and white on green surfaces. Secondary actions are underlined text with a precise arrow or a fine outline. Avoid the current pill-button signature.

**Product cards:** no floating box or shadow. A square image plate sits over a disciplined text block: name, key facts, price state, and a small directional marker. Separate adjacent card rows with spacing or a fine rule. Use generous imagery without stripping out product identity.

**Category selection:** a useful editorial index rather than eleven decorative circular thumbnails. On desktop this may be a numbered list beside a changing image area, or a compact strip leading into category pages. Keyboard and touch must have a clear, equivalent interaction.

**Catalog controls:** search is prominent and adjacent to results. Desktop filters occupy a narrow, clearly structured column; mobile filters open a sheet. Selected filters become simple small-radius removable tags. Only relevant options appear. Include count, clear filters, and useful empty-result guidance.

**Detail information:** use a specification table or aligned list with clear label/value pairs, not widely tracked tiny gray facts. The product photo is the dominant block. Place reference, price context, and enquiry in a single readable sequence beside it.

**Rates:** reuse the typography and colors but use flatter, denser information surfaces. Avoid marketing-style quote cards with excessive whitespace. A selected instrument can be emphasized with a dark row or a side rule; changes require a sign and label as well as color.

**Dialogs and mobile sheets:** clean white or mineral surfaces, strong readable type, 8 px maximum corner radius, restrained overlay. Focus and close behavior must be specified. Cookie choices remain equally understandable and do not borrow the visual weight of a promotional offer.

## 9. New page compositions

### Homepage

1. Centered brand masthead and useful navigation.
2. A distinctive dark editorial opening built around a short large statement and real product plates. The composition must be visibly different from the current split hero.
3. A light “Explore the collection” area combining a concise category index with representative products. All real categories remain reachable.
4. One editorial collection story using real objects and existing collection content.
5. A product selection with readable names, specifications, and price states.
6. A direct live-rates entry, clearly separated from product pricing and without invented live figures.
7. A showroom section centered on the actual Agra address, hours, and contact actions.
8. Guides, app links, and a newly composed footer.

### Catalog, category, and collections

Use a compact sans serif heading and a purposeful utility layout. Results take most of the screen. On desktop a filter rail and three-column grid create a clear working area. On mobile the search and filter control lead directly into two readable columns, with a one-column fallback at narrow widths. Collection pages can have an editorial lead, but reuse the same catalog mechanics beneath it.

### Product detail

Use a gallery spread composition: an oversized complete image plate on one side and an ordered information column on the other. A narrow category or reference rail can give it an exhibition identity. Thumbnails appear only when real views exist. The price explanation and enquiry action remain connected. Mobile places the image early, followed by the name, essential facts, and enquiry; optional longer details follow.

### Live rates

Begin with a clear “Live rates” title, visible source/freshness state, and a concise explanation. Group showroom quotes and market data visibly. Show exact labels and verified units. If history is actually available, use a precise chart with clear axes and a readable data alternative; if it is unavailable, design that honest state. Mockup numbers copied from the capture are historical examples, not current rates.

### About and contact

Use a typographic editorial page with real business photography where available. The address, opening hours, phone, WhatsApp, and directions are primary content. No invented heritage timeline, testimonials, or customer count. The contact layout should feel like an invitation from the house rather than a generic form template.

### Guides and policies

Guides use editorial index rows and a comfortable article column. Legal pages share the type system and navigation with a quieter reading layout. Preserve all real content. New style must carry through the less glamorous pages as carefully as through the homepage.

### Login

Use a focused brand panel and the existing “Continue to DDAJewels” action. Preserve the shared-account redirect. Do not invent a local password form, account dashboard, or authentication provider.

## 10. Mobile as a designed composition

Desktop and mobile are separate compositions of the same system. The mobile opening should include both a concise statement and a real product image. Reduce display size and reorder blocks deliberately. Do not stack a giant desktop paragraph, two buttons, and promotional bars before the product appears.

Design the menu, search, filters, product zoom, cookie choices, and enquiry action at 390 px, with narrow-width checks at 320 px in implementation. Never depend on hover. Keep all information visible without horizontal page overflow; a long data table can have a clearly labeled local scroll region where necessary.

## 11. Motion and access

Use short 150–220 ms transitions for navigation, focus, and image-viewer changes. A subtle editorial reveal can be explored only if the content is already readable without it. Respect reduced motion and avoid scroll hijacking, parallax, rotating promotions, or decorative flashing rate numbers.

Target readable contrast, clear keyboard focus, 44–48 px controls, logical headings, meaningful image alternatives, and stable media dimensions. Verify the actual rendered colors and fonts later; a generated image is not an accessibility test. Do not use pale clay or silver text for essential information on a light surface.

## 12. Exploration and selection

Luna should use 12ui **draft**, not improve, for this reset. Generate at least four genuinely new candidates without using the current website screenshot as a style or layout reference. Give the service the product, audience, real business model, desired new visual identity, and constraints. Do not let the existing interface dominate generation.

Evaluate whether the proposals differ meaningfully in silhouette, hierarchy, typography, palette, navigation, and pacing. At least one should strongly express the midnight-green Silver House direction; an alternative may explore a distinctly editorial oxblood or a cool charcoal-and-silver treatment. The goal is a clear direction, not a cosmetic variant of the same screen.

Select a working recommendation after inspecting the actual images, then use branch to extend it into homepage continuation, catalog, product detail, rates, and contact/editorial mockups. Include a separate mobile composition. Keep factual errors and asset inaccuracies visible in the review notes. Do not represent a designer recommendation as user approval.

This stage ends with a detailed written language and genuine new mockups for review. It does not modify or deploy the production website.

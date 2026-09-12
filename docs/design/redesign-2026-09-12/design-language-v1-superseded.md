# DDA Silver — design language

Version 1 · 12 September 2026 · Direction for 12ui mockups

## 1. Design intent

DDA Silver should feel like stepping into a carefully arranged silver showroom in Agra: personal, composed, knowledgeable, and easy to explore. The objects supply the ornament. The interface supplies order, readable information, and a clear route to the showroom team.

The proposed direction is **Contemporary Silver Showroom**. Warm paper surfaces connect to the existing approved product backgrounds; dark charcoal provides structure; the family monogram and a small amount of copper retain brand recognition. A restrained editorial serif introduces collections and stories. A precise sans serif handles product information, navigation, prices, and rates.

The business journey is browse, understand, enquire, and visit. Preserve that journey throughout the redesign. Product prices remain estimates or quotations according to their actual source state. A metal rate is never presented as the final price of an object. Customer sign-in remains a real existing capability. Checkout, wishlists, customer reviews, offers, and appointment scheduling are outside this design unless separately implemented with real supporting data.

This phase delivers a written system and visual mockups. The selected visual direction is a proposal for review, not a change to the live site.

## 2. What the current captures tell us

The September 12 archive covers 29 public main, category, collection, editorial, legal, and login pages, plus two example product details at desktop and mobile sizes. The existing brand and product imagery are useful assets. The redesign should preserve their familiarity while improving the organization around them.

The mobile homepage begins with a long, oversized heading and two wide buttons. Product photography begins near the bottom of the initial viewport. Shorter display copy and a more compact introduction should bring the first object into view immediately.

The catalog opening combines a very large heading, category links, collection links, search, and filters before the first row of products. Reduce the introduction and give each browsing tool one clear place. Users should see recognizable products without working through a large preamble.

Product detail pages already expose the right kinds of facts, but their titles can dominate the composition and the vertical layout leaves long quiet areas beside the specifications. Keep the photograph generous; make the adjacent information compact, deliberate, and easy to scan.

The rates page needs a distinct information hierarchy: instrument, value, unit, freshness, and source state. Tables should retain their precision while gaining a clear page introduction and readable mobile treatment. The captured unavailable snapshot state is a first-class state to design, rather than something to replace with invented data.

## 3. Personality and visual signatures

The interface has four qualities: **assured**, through clear facts and stable alignment; **warm**, through paper tones and approachable copy; **object-led**, through generous product photography; and **practical**, through obvious controls and legible details.

Its recurring visual signatures are a fine copper rule, an unboxed square photograph, an editorial heading next to a small utility label, and a precise specification row. Use these consistently across routes so the identity does not depend on making every screen look like a homepage.

Use architectural spacing and horizontal rules to group content. Avoid decorating every component with a card, gradient, floating shadow, or pill shape. Reserve strong visual emphasis for the photograph, the section title, a meaningful number, and the primary action.

## 4. Color system

| Token | Value | Role |
| --- | --- | --- |
| Paper | `#F7F4EE` | Main page canvas; a quiet warm ivory |
| Porcelain | `#FFFEFB` | Inputs, menus, detailed information surfaces |
| Linen | `#EDE7DD` | Gentle section changes and empty media frames |
| Silver mist | `#D5D5D0` | Decorative metal-inspired detail, never body text |
| Ink | `#272823` | Body copy, headings, primary navigation |
| Muted ink | `#62635B` | Secondary labels and explanatory copy |
| Copper | `#8D4938` | Brand accent, primary enquiry action, active state |
| Copper deep | `#733829` | Hover and pressed accent state |
| Hairline | `#D8D1C6` | Nonessential separators and image boundaries |
| Control edge | `#88877E` | Visible input boundaries on light surfaces |
| Positive | `#2E614E` | Positive movement, accompanied by sign and text |
| Negative | `#A43835` | Negative movement and errors, accompanied by text |
| Focus | `#245E83` | Keyboard focus ring, visually distinct from copper |

Most of each screen should be paper, porcelain, and the natural colors of the product images. Copper appears in small concentrations. A charcoal showroom panel or footer can provide a strong transition, but product listing and detail surfaces remain light so silver edges remain visible. Avoid metallic gradients in text or controls: the real photography already supplies metallic texture.

These are proposed tokens. Verify rendered contrast before production: 4.5:1 for normal text, 3:1 for large text and essential UI boundaries. Hairline is a decorative separator, not an accessible input outline. Positive and negative colors always have another visible cue.

## 5. Typography

Retain the existing **Cormorant Garamond** and **Manrope** families to maintain continuity and avoid introducing a new font dependency. Change their proportions and jobs.

Cormorant Garamond at weight 500 or 600 is for page display headings, collection introductions, and editorial subheads. Manrope at 400, 500, and 600 is for everything that must be compared or operated. Product card names use Manrope for dense scanning. Long product titles on detail pages use a moderate display size rather than a promotional headline scale.

| Role | Desktop | Mobile | Guidance |
| --- | --- | --- | --- |
| Home display | 64–72 px / 1.02 | 38–42 px / 1.05 | Short copy; avoid seven-line introductions |
| Editorial page title | 48–56 px / 1.08 | 34–38 px / 1.1 | One coherent thought |
| Catalog page title | 36–40 px / 1.1 | 28–32 px / 1.1 | Product grid remains the main content |
| Product detail title | 34–40 px / 1.12 | 28–32 px / 1.15 | Wrap naturally; keep distinguishing details |
| Section heading | 32–40 px / 1.15 | 26–30 px / 1.15 | Consistent rhythm across routes |
| Product card name | 15–16 px / 1.45 | 14–15 px / 1.45 | Allow three lines where necessary |
| Body | 16 px / 1.65 | 16 px / 1.6 | Editorial measure of 60–70 characters |
| Utility | 13–14 px / 1.45 | 13–14 px / 1.45 | Essential facts never reduced to tiny gray text |
| Price / rate | 22–32 px / 1.15 | 22–28 px / 1.2 | Tabular numerals and Indian digit grouping |

Small uppercase labels are limited to section introductions and table headers, with modest tracking. Body copy is sentence case. Price digits use tabular figures; the rupee symbol remains attached to its number. Weight, purity, shape, and dimensions retain their actual meanings and stored precision.

## 6. Layout and spacing

Use a 12-column desktop grid inside a maximum 1320 px content width, with 48–60 px outer margins at a 1440 px viewport and 24 px gutters. Tablet uses 32 px margins. Mobile uses 20 px margins and a four-column underlying grid with 12–16 px gaps.

The spacing scale is 4, 8, 12, 16, 24, 32, 48, 64, and 96 px. Marketing sections typically use 72–96 px vertical separation on desktop and 40–56 px on mobile. Catalog and rate controls use 16–24 px groups. A heading and its explanation should feel connected; a section change should be unmistakable.

Homepage composition may be asymmetrical: approximately five columns of short copy and seven columns of product photography. The catalog is intentionally regular: a 216–240 px filter column beside a three-column product grid at desktop, or a full-width four-column grid where filters collapse into a toolbar. Choose one desktop catalog arrangement and keep it consistent on category and collection routes.

Use two product columns at 390 px only if titles, images, and facts remain readable; use one column on the narrowest widths when necessary. Do not achieve density by hiding distinguishing product information. Product media stays square, while the text below it expands naturally.

## 7. Brand and photography

Use the existing DDA family monogram and DDA SILVER wordmark. Keep the family name legible where the full lockup fits. The compact mobile lockup may reduce supporting text, but must retain the recognizable brand. Never generate a substitute logo or introduce a fictional founding date.

Actual product photographs are the source of truth. Carry the approved warm ivory backgrounds and watermarks intact. Use `contain` presentation with a square media frame and adequate breathing room so tall jhulas, handles, flags, lids, and the bottom logo remain visible. Different silhouettes should feel consistently presented without forcing them into the same crop.

Use the existing multicolor enamel pooja thali as a possible home hero. The frame may be enlarged or repositioned within the layout, but the product must retain its real proportions and decoration. Use existing showroom imagery only when it is a faithful representation of the business. Do not substitute a generated palace interior, imagined artisan workshop, or fabricated lifestyle photograph.

Mockups may use photographs already visible in the reference screenshots. Generated visual discrepancies must be noted during review and replaced with the original assets before implementation. This is interface concept work, not a request to ingest or regenerate the product catalog.

## 8. Shared components

**Header.** Use an approximately 80 px desktop header and 64–72 px mobile header. The brand sits left, primary routes occupy the center or right, and account access is a quiet utility. Retain Home, Products, Live Rates, About, and Contact. Give Live Rates enough prominence for returning visitors. On mobile, expose a labeled menu control and show clear current-page state. App-download links belong in a compact secondary placement or a lower app section so they do not consume the first screen's product space.

**Navigation menu.** A mobile panel opens beneath the header with large row targets, simple dividers, login, and direct route links. It supports Escape, keyboard traversal, and focus restoration. Product category navigation has one consistent location; long lists must not be repeated above and beside the same grid.

**Buttons.** The main browsing action may use charcoal with a light label; enquiry actions use copper with a light label. Secondary actions have an ink outline or a quiet text treatment. Use a small 4–6 px corner radius and a minimum 44–48 px target height. Reserve pills for removable selected-filter chips. Each section has one visually dominant action. Use specific verbs: “Explore products”, “Enquire about this piece”, “Get directions”, and “View live rates”.

**Product cards.** A generous square image sits above the product name, one or two concise specification lines, and the price state. Use a thin lower rule instead of a heavy card outline. Pointer hover may clarify the name and reveal a small directional arrow; it must not crop or scale away part of the product. Both image and title lead to the same product. Touch users see the same important content without hovering.

**Search and filters.** Search has a visible purpose and comfortable width. Filter labels remain available after selection. On mobile, a “Filters” button opens a sheet with relevant options, active selections, clear, and apply. Show only options represented in the actual results. Maintain selected filters and pagination in shareable URLs. Empty results explain what happened and offer to clear filters.

**Detail gallery.** Keep the main image and specification block adjacent on desktop. Thumbnails appear only when real additional images exist. Open a labeled zoom viewer on demand; support keyboard close and touch zoom without trapping scrolling. The enquiry action carries the real item reference and URL. Mobile may use a compact sticky enquiry bar if it does not cover content, cookie controls, or the keyboard.

**Overlays and consent.** Use porcelain surfaces, readable ink, and a restrained shadow. Cookie consent has equally understandable choices. An expanded preferences state clearly labels each purpose. The WhatsApp utility becomes a small accessible control on mobile and must not obscure another action.

## 9. Page-by-page composition

**Home.** Begin with the real brand, a concise introduction such as “Silver for everyday rituals and lasting gifts”, one main browse action, and the existing hero product. This is proposed marketing copy, not a new factual claim. Put a recognizable product within the initial mobile viewport. Follow with a disciplined category strip or grid covering all 11 current categories, a selected-products row, a concise showroom invitation, a buying-guide introduction where useful, and app links. Use a strong darker showroom band toward the end for rhythm. Preserve access to rates without adding an unsourced rate teaser.

**Products and categories.** Start with a compact title, a short explanation, and the result count. Search and filters sit directly alongside the browsing area. The first desktop product row should begin within roughly the first 400–450 px of the page, including the header. Category landing pages reuse this layout with category-specific title and real descriptive content. Keep pagination deliberate and readable.

**Collections.** Use a shallow editorial introduction and a real representative image if appropriate, then reuse the catalog grid. Collections should feel curated through the selection and introduction, without requiring a large repeated hero on every route.

**Product detail.** Breadcrumb, photograph, category, readable product title, reference, clearly labeled specifications, price and freshness explanation, short description, and enquiry action form one coherent opening composition. Related products follow beneath a clear section boundary. Preserve actual purity, weight, shape, deity, construction type, and applicable dimensions; omit only genuinely absent values.

**Live rates.** Place a concise page heading above the quote area. Show source freshness, unit, and market status with each applicable group. Give primary showroom quotes a clear label/value structure and market data a compact aligned table. Where the actual interface provides history, give the selected instrument, timeframe controls, chart axes, and a keyboard-accessible data alternative clear space. When history or a snapshot is unavailable, show that state without a fictional chart. Mobile prioritizes label and value and exposes secondary columns in a readable responsive table or detail layout. Keep rate context and disclaimers near the figures they explain.

**About.** Use a restrained editorial grid, the actual family brand, and verified showroom imagery. Establish who DDA Silver is and how customers can visit. No invented age, awards, certifications, testimonials, or customer counts.

**Contact.** Pair the real address and opening hours with phone, WhatsApp, and map actions. Use the actual map link. Let the practical contact details appear early on mobile. An external directions action must clearly behave as a link, not an unimplemented embedded map control.

**Guides.** The index uses a small set of editorial cards with descriptive titles. Articles use a 680–740 px reading column, clear subheads, and contextual links back to relevant catalog pages. Photography is optional; useful reading structure is essential.

**Login.** A compact, calm account panel sits under the same brand shell. The existing flow redirects to DDAJewels; use “Continue to DDAJewels” and a short explanation that customers use their existing DDA account. Do not add local password inputs or a new signup form. Error, loading, and unavailable states are readable and actionable without exposing implementation details.

**Privacy, terms, cookies, and rates disclaimer.** Use the shared reading layout with a modest title, comfortable measure, clear section hierarchy, and the complete existing content. These pages need the same typographic care as the rest of the site.

**Footer.** Organize brand, visit/contact details, and information links in three calm desktop columns; stack them with clear headings on mobile. Preserve sister-brand and customer-login links. Use only the actual business address, hours, phone numbers, and app links.

## 10. Responsive behavior and motion

Design desktop at 1440 px and mobile at 390 px, then validate 320, 768, and 1024 px when implemented. Mobile is a deliberate composition: shorter introduction, earlier imagery, stacked detail content, reachable filtering, and no desktop table compressed into unreadable type.

Use 140–180 ms color and border transitions; menus and sheets may use approximately 200 ms opacity and short-distance movement. Respect reduced-motion preferences. Avoid parallax, scroll hijacking, continuous marquees, animated numbers on every rate tick, and entrance effects that hide content until animation completes.

Preserve visible keyboard focus, logical headings, a skip link, descriptive image alternatives, correct dialog semantics, and adequate target spacing. A displayed price or fact must not disappear on hover or require a tooltip to be understood. Loading media reserves its final shape to avoid layout shifts.

## 11. Mockup brief and review criteria

Luna will use 12ui to create genuine visual alternatives, inspect them, select the one that best fits this written direction, and extend it into a consistent set of page mockups. The selection is a working recommendation for the user to review. It is not represented as user approval.

Explore differences in composition and hierarchy within this system: stronger product-led split hero, quieter editorial arrangement, and a more architectural showroom treatment. Preserve the recognizable brand and real content in every option. Do not average unrelated candidate styles.

Target coverage is a desktop homepage with its lower sections, mobile homepage, catalog/category page, product detail, live rates, and a supporting editorial/contact layout. Additional legal and login layouts can reuse the established reading and form systems. Two real product examples are sufficient; do not generate individual designs for the catalog inventory.

Review each actual generated image for brand fidelity, early product visibility, readable type, complete product framing, realistic content, price/rate clarity, useful density, and consistency across pages. Record any invented facts, altered product details, or unimplemented controls as mockup limitations. Prefer another candidate when a defect is substantial. Keep all generated originals and the run metadata so later implementation can follow the selected design accurately.

## 12. Handoff boundary

The deliverable is this language, original candidate images, the recommended direction, page mockups, and a short review record. A generated prototype, if produced by 12ui, is a design artifact. Production work should later use those outputs as its visual baseline, preserve the existing Next.js and Sanity behavior, and compare rendered pages against the selected mockups at desktop and mobile widths. No production deployment is part of this concept phase.

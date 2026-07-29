# Locked decisions

**Status:** Current decision record  
**Implementation:** In progress

## Product

- DDA Silver is a full digital showroom, not a rate-only utility.
- Primary audience is retail consumers across India.
- The brand is distinct from DDAJewels but presented as a sister brand.
- The first release supports 50–200 products.
- Products are curated designs with availability confirmed through WhatsApp.
- No price, inventory, form submission, or e-commerce capability.
- Product types are primary navigation; collections are optional editorial
  groupings.
- Catalog-only scope: no dedicated custom-order, corporate-gifting, or journal
  sections.

## Brand and UX

- Public name is “DDA Silver.”
- Use the logo displayed on the DDA Jewels website as the shared family mark,
  per the owner’s 28 July 2026 direction.
- Identify the sister brand with a separate “SILVER” label and its own visual
  system; do not redraw or recolor the family mark.
- Do not publish a numeric heritage year in replacement-site copy until the
  owner resolves the discrepancy between the earlier 1978 brief and current
  DDA Silver brand materials that say 1977.
- Visual direction is modern and approachable.
- Homepage leads with brand story.
- English first.
- Use mockup-matched generated concept images in the private preview until the
  owner supplies new real photography, per the owner’s 28 July 2026 direction.
- Concept images must be replaced with verified real product photography
  before production launch.
- Exactly three visual concepts are required before UI implementation; the
  owner selects one.
- The owner selected displayed visual option 1 on 28 July 2026.

## Content

- Sanity Studio instead of a custom admin.
- Start on Sanity Free with 1–2 trusted administrators.
- Load initial metadata through spreadsheet and attach images manually.
- Product pages use minimal public details.
- Copy may be drafted from verified facts and requires owner approval.

## Contact and acquisition

- WhatsApp, call, and map only; no web enquiry form.
- Phone: 0562-4100044.
- WhatsApp: +91 7060001491.
- Tuesday–Sunday, 12:00–20:00.
- Link to Google Business Profile without copying live review text.
- Promote Android and iOS apps on the homepage and rates page.
- Use GA4 and Search Console with consent controls.

## Rates

- Same rate data and behavior as DDAJewels, inside DDA Silver styling.
- Preserve four customer rows and five market rows.
- No independent history charting.
- Public direct SSE after server-rendered snapshot.
- DDAJewels remains authoritative.
- Link to DDAJewels TV instead of building a DDA Silver TV route.

## Accounts

- Preserve existing DDA users.
- Redirect authentication to DDAJewels.
- Separate host-only session for DDASilver.
- Signup, recovery, Google sign-in, and account help remain on DDAJewels.
- Logged-in DDASilver behavior is limited to personalized-rate visibility.
- Use short-lived stream tickets rather than sharing cookies across domains.

## Platform

- Next.js App Router and TypeScript.
- Tailwind plus CSS-variable design tokens.
- Vercel previews and production runtime.
- Cloudflare in front only during approved production work.
- Public unlisted preview with crawler blocking.
- Until `NEXT_PUBLIC_SITE_ENV=production` is explicitly enabled during an
  approved cutover, metadata and robots rules block indexing.

## Launch

- No production-domain change until the owner says:
  “Go live on ddasilver.com.”
- Keep the old server for at least 14 days after launch.
- Prepare and test rollback before cutover.

# SEO and AI discovery implementation

Date: 26 August 2026. Companion to the original audit and its pre-change CSV.

## Release status

Sanity content updates are published and verified. The owner has authorized the
production release through the normal GitHub Actions → Coolify workflow. The
runtime rejected launching a local preview server, so the remaining rendered
browser checks will run against production after rollout. A successful webhook
alone is not release completion: `/api/health` must report the released commit,
and live crawler output and representative pages must pass verification.

## Completed changes

- Removed hard title truncation; product identity consistently retains verified
  gram weight across headings, cards, breadcrumbs, structured names and social
  images. Added an optional, validated Studio SEO title. All 569 published
  products generate distinct final title names; URLs are unchanged.
- Corrected gold category naming and redundant collection naming.
- Restored inherited Google preview directives on indexable pages.
- Published four featured products and added a bounded fallback to four real
  catalog cards if no featured selection remains. Empty selections emit a
  warning. The live homepage now renders four product cards from the CMS change.
- Replaced the concept hero/default social photograph in code with the approved
  DDA-UT-PT-2201 photograph already published in Sanity. No product images were
  generated or altered.
- Backfilled 33 coin weight fields only where the title, description and product
  reference agreed. Fixed the coin importer so future uploads retain weights.
- Assigned 31 missing internal utensil references using the existing GL/BW
  convention and updated the source manifest. All 569 products now have a
  reference. No GTINs, prices, stock claims, reviews or ratings were fabricated.
- Added editable guidance fields to category and collection schemas, queries
  and validated read contracts. Published two sections for each of seven
  populated categories.
- Published four curated collections, with memberships owned by
  `product.collections`: Ganesha idols (20), Lakshmi–Ganesha pairs (37), pooja
  thali sets (23), wedding gifts (4). Existing listing/product links discover them.
- Added three server-rendered guides, their index, sitemap entries, footer links
  and contextual product/category links. Guidance avoids unverified service,
  certification, shipping, health or return claims.
- Added a public-only rates snapshot with freshness, privacy and unit checks.
  The real anonymous DDAJewels feed decoded successfully into four public rows.
  Browser live updates and personalized rates were not changed.
- Explicitly allowed search/retrieval crawlers on public paths while preserving
  private exclusions and existing training restrictions.
- Added nofollow to sign-in links and noindex HTTP headers to auth and Studio
  paths. Existing robots exclusions remain. Headers do not promise removal of
  already-indexed blocked URLs because crawlers may not read those headers.
- Added the owner's official Maps/Business Profile URL to directions, `hasMap`
  and `sameAs`. The supplied link resolves to Deen Dayal Anand Kumar Saraf / DDA
  Silver. The existing environment override remains supported.
  Verified postal code 282002 and the place pin from this profile are included
  in the business details and structured data; no reviews were copied.

## Content migration and rollback

Run `npm run sanity:improve-seo` for the default dry run; publishing explicitly
requires `npm run sanity:improve-seo:apply`. The script aborts on conflicting
weights/references/titles, backs up affected documents locally, creates the
four collections, and patches existing documents in one revision-guarded
transaction. It does not replace products or upload image assets.

The applied transaction created four collections and patched 153 documents.
A subsequent dry run reported zero creates and zero patches. A full read through
the website's Sanity contract returned all 569 products, all four collections,
seven categories with guidance, and no degraded fallback.

Before-images are in the local OS temporary directory in
`dda-seo-before-1787735800324.json`. To reverse content, compare current revisions
and restore only this migration's fields. Do not blindly replace documents or
remove collections referenced by subsequent edits. The application rollback
target remains the previous healthy Coolify image/commit.

## Verification

- `npm run check` passed: lint, TypeScript, all 188 tests, and build. A separate
  build with the production canonical URL and indexability configuration passed.
  Generated Sanity schema/types were refreshed.
- Unit tests cover full names, metadata inheritance, gold naming, crawler rules,
  real four-card fallback, public-rate privacy/freshness/units, server-rendered
  timestamp/currency and browser expiry.
- Production build passed. Built homepage and guide HTML have one H1, expected
  canonicals and indexability. Homepage HTML has four product cards, the real
  hero, and `max-image-preview:large`, `max-snippet:-1`, `max-video-preview:-1`.
- Live HTTP checks confirm the CMS-backed featured cards, corrected coin weight
  and a new collection render successfully on the currently deployed code.
- Browser E2E assertions were extended; not yet run because local server launch
  was rejected. Do not describe the application changes as deployed or browser
  verified until the remaining release checks pass.

## Account review

Google Search Console, Bing Webmaster Tools and Cloudflare were reviewed in the owner's
signed-in browser. The canonical sitemap was already successfully submitted and
read by Google. No duplicate submission was made. The Search generative AI
setting was not visible in this property; that does not mean exclusion.

The owner confirmed submitting the canonical sitemap to Bing after the account
review. No duplicate submission was made by this task. Processing status and
later indexing still need to be checked in Bing Webmaster Tools.

Cloudflare's dashboard shows actual successful requests from Googlebot, BingBot,
OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User and PerplexityBot. No
firewall exception or training-policy change was needed. Managed robots.txt is
still enabled. Do not enable training or full-reproduction permissions as a
purported ranking switch.

Private indexing, traffic and Core Web Vitals observations are kept separately
in `.codex-tmp/seo-account-baseline-2026-08-26.md`, excluded from this public repo.
The field-vitals report covers a small sample and does not establish the
performance of all catalog pages. The earlier failed Lighthouse run is not a score.

## Owner-dependent items

1. Supply official social-profile links if they should be published. The Maps
   URL, postal code and place coordinates were verified against the supplied profile.
   Supply approved real showroom/team photographs if they should be published.
2. Measure Sindoor Dani references SD-08, SD-09 and SD-10. JPB-01 correctly uses
   four weight/diameter variants and must not receive one invented weight.
   Confirm any other unrecorded physical dimensions before adding them.
3. Verify processing of the submitted sitemap and available AI reports in Bing
   Webmaster Tools; confirm Bing Places details against the same showroom.
4. Review genuine customer-feedback collection and any additional service claims
   before publishing them. Do not create or incentivize reviews.
5. After release, inspect representative new/updated URLs, review the older
   indexing backlog, and measure qualified enquiries and search/AI referrals.
   Existing analytics events were retained; account conversion setup needs its
   own verified account access. No recurring automation was requested or created.

`llms.txt`, artificial FAQ/rating markup, fabricated offers and broad training
permission changes were deliberately not added. They are not prerequisites for
search or AI inclusion. Useful crawlable content and accurate product facts are
the implementation focus; recommendations or rankings cannot be guaranteed.

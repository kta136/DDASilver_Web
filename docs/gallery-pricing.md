# Gallery pricing

The website calculates silver product prices from one durable Silver Bank rate
and the product's weight and making charge. Gallery cards show the rupee amount
or range only. Opening an item shows the rate snapshot date, any fallback notice,
and “Includes making charges and taxes. Final price confirmed on enquiry.”
There is no “Approx.” prefix. Manual totals show their own review date instead.

The public `GET /api/catalog/prices` feed supplies the same calculated estimates
to the DDA Silver native apps through the Live Rates V3 gallery API. It returns
only published product IDs, slugs and optional estimates, never raw making-charge
inputs or drafts. Responses are `no-store`; the consuming web service may cache
them for 60 seconds. Stale/fallback catalogs return 503 without affecting product
browsing. The feed shares this service's existing durable reference and refresh
lock, so it does not create a second rate sampler.

## Calculation and category charges

`total = weightGrams × (silverRatePerKg / 1000) + makingCharge`

Making is either weight multiplied by the per-gram charge or one fixed per-piece
charge. The owner supplied tax-inclusive making charges: do not add tax again or
apply an additional purity multiplier. Calculate each weight/diameter variant
independently, round the final totals to the nearest rupee, and show a range when
the totals differ. A product override takes priority over category rules. Zero is
a valid making charge; a missing value is not zero.

Owner-confirmed defaults are in [gallery-pricing-defaults.json](gallery-pricing-defaults.json).

| Category / condition | Making charge |
| --- | --- |
| Coins, plain silver, up to and including 250 g | ₹5/g |
| Coins, gold polish, up to and including 250 g | ₹10/g |
| Coins, plain silver, over 250 g | ₹3/g |
| Coins, gold polish, over 250 g | ₹8/g |
| Hollow idols, plain/white, colour or antique | ₹25/g |
| Hollow idols, steel polish (including gold accents) | ₹30/g |
| Solid idols, plain silver | ₹10/g |
| Solid idols, antique | ₹15/g |
| Semi-solid idols, all non-colour finishes | ₹15/g |
| Semi-solid idols, substantial colour painting | ₹30/g |
| Singhasan and Hatri, plain silver | ₹10/g |
| Singhasan and Hatri, antique | ₹15/g |
| Jhula | ₹15/g |
| Utensils, up to and including 20 g | ₹250/piece |
| Utensils, over 20 g | ₹10/g |
| Phone covers | ₹3,000/piece |
| Purses | Individual product charges: ₹15, ₹35, ₹50, ₹80 or ₹90/g |
| Boxes and gifts | Deferred; enquiry only |

Purse making charges for all 36 products were activated as individual product
overrides on 10 September 2026, including the owner's clarification of PR-2 at
₹35/g. The transcription, photo confirmation and application record is in
[gallery-purse-making-2026-09-10.json](gallery-purse-making-2026-09-10.json).
The owner supplied the final five charges by labelled photo: A, C, D and E use
₹15/g; B uses ₹90/g. These photo-confirmed charges replace the unmatched sheet
rows. The five legacy import codes PR-2201 through PR-2205 were corrected to
PR-32 through PR-36 in A–E order, preserving document IDs and product URLs.
Purse display order is `2000 + itemNumber * 10`, matching the existing PR-1
through PR-17 sequence. Mixed-gallery publishing uses that same sequence so
reimports preserve the ordering; the source manifests and asset mappings carry the
corrected references. Studio provides **Purses — item code order** and displays
item codes in product list subtitles. No category-wide making charge is assumed;
new purses require their own verified making charge before publishing.

Singhasan decorations use the underlying finish's rate. Small painted eyes, lips
and tilaks still count as plain silver. Steel polish means the reflective dark or
chrome-looking finish, including gold accents. Photographs determine finish
labels only; construction and weight must come from verified product metadata.
Gold products are outside this feature.

## Refresh and outage behaviour

`GALLERY_PRICING_DIR` holds `reference.json` and `reference.backup.json`, including
the accepted rate's original `snapshotAsOf` and separate refresh bookkeeping:
`lastAttemptAt`, `nextAttemptAt` and outcome. These records have no expiry and are
outside catalogue-cache eviction. The backup protects against file corruption on
the same volume; it is not a backup on another host.

When due, a request schedules Next.js `after()` work. A cross-process filesystem
lock covers old and replacement containers sharing that directory. The attempt
schedule is persisted before the request to the feed. A failed request therefore
consumes the same five-minute interval as a successful one. The lock has heartbeat,
ownership checks and recovery after abandonment.

Each attempt performs one anonymous, uncached (`cache: 'no-store'`) upstream fetch
with a three-second timeout. The existing public decoder validates feed status,
freshness (90 seconds), identity, positive value and unit. The gallery accepts only
the Silver Bank item in `PER_KG`, and refuses a backwards snapshot timestamp. The
existing cached public reader and live-rates consumers remain unchanged.

Under sustained traffic this feature makes at most one upstream attempt every
five minutes across the website service, approximately 12 per hour. The rate file
and lock directory must be shared by every process performing these attempts.
This bound does not describe the separate live-rates feature.

The request that starts a refresh receives the saved rate. A later render receives
the newly accepted rate. Sparse traffic, an outage or an already-open page can
produce older prices. There is no browser polling. Saved references never run
through the incoming freshness test again. A product's weight or making-charge
edit still changes its total during a feed outage using the last validated rate.
Missing/corrupt product inputs or loss of both rate files produces a price
unavailable state while preserving the product.

## Rendering and crawlability

Pricing-bearing routes explicitly use request-time rendering with `connection()`;
catalogue reads retain their existing data cache. React request memoization reads
one pricing context for the page and all its calculations. Updating the rate does
not invalidate or regenerate catalogue data.

Amounts are ordinary visible text in server-rendered HTML, associated with each
product card and a normal `<a href="/products/...">` link. Direct product pages
also render the amount and disclosures without JavaScript. A dialog reuses its
card's serialized estimate rather than recalculating in the browser. A newly
opened full page can correctly show a newer price than an older gallery tab.

This follows Google's guidance on
[server rendering](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
and [crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable).
Google can extract the visible prices, but indexing and showing prices in search
results remain Google's decision. Estimates are excluded from structured-data
`Offer` prices, as agreed. The existing product URLs, sitemap and canonical URLs
provide discovery independently of the JavaScript dialog.

## Studio and publishing

Gallery Pricing is a singleton with an enable switch. Categories own making
charges, conditional rules and an explicit defer option. Products can override
making charges or use manual totals, with a review date and an optional next-review
reminder. Manual prices remain visible after the reminder date and during rate
feed outages. Multi-size manual products require a total for each size.

Verified finish labels include source-photo ID, review time and visual evidence.
Photo-review manifests are retained in this directory. The application script
checks document revision and that the source photo is still attached; only
high-confidence entries are applied.

Enabling pricing checks catalogue coverage. While enabled, product publishing,
affected-category changes and supported bulk workflows validate the same rules.
Imports preserve saved pricing when no replacement is supplied. Category edits
are checked against existing products, including clearing a default charge.
External API writers must use the same validation: Sanity Studio validation does
not enforce constraints on arbitrary Content Lake mutations.

Useful commands (authenticated Sanity CLI for CMS commands):

```sh
npm run pricing:defaults                    # preview owner-confirmed defaults
npm run pricing:defaults:apply              # explicitly apply those defaults
npm run pricing:audit                       # coverage; exits nonzero on gaps
npx sanity exec scripts/sanity/apply-gallery-finishes.ts --with-user-token -- --manifest=docs/gallery-idol-finish-review-2026-09-10.json
```

Add `--apply` to the last command to save reviewed labels. Reapplying matching
finish/photo labels is a no-op. Applying defaults never enables pricing.

## Production activation and rollback

1. Mount a dedicated persistent directory at `/app/gallery-pricing`, writable by
   UID/GID 1000. Set runtime `GALLERY_PRICING_DIR` to that path. Both old and new
   containers must see the same directory during replacement.
2. From a maintenance checkout with dependencies installed and access to that
   same volume, run `GALLERY_PRICING_DIR=/app/gallery-pricing npm run pricing:reference -- --refresh`.
   The command uses the configured anonymous feed and the same attempt gate. Read
   it again without `--refresh` to verify recovery. The standalone production image
   does not contain the maintenance CLI or development dependencies.
   Set `DDAJEWELS_RATES_SNAPSHOT_URL` in the maintenance environment as well;
   the documented endpoint is `https://ddajewels.com/api/v1/rates/current`.
3. Verify replacement-container mounting and recovery from the real production
   volume. Confirm that the stored snapshot came from the live feed, never a QA
   fixture. Run `npm run pricing:audit` and resolve remaining gaps.
4. Update the hosted Sanity webhook using the filter and projection in
   [content-model.md](content-model.md#signed-publish-webhook), including
   `galleryPricing`. Deploy the verified application, then enable Gallery Pricing
   in Studio after storage and coverage checks pass.
5. Fetch gallery and direct product HTML without JavaScript. Check a dialog,
   price range, manual total, deferred category and mobile layout. Confirm rate
   feed failure retains the saved rate and does not fail website liveness.

`/api/health` reports gallery pricing as `ok`, `degraded` or `unavailable` and
includes the snapshot timestamp and age. These operational warnings do not
change the website's liveness status or cause restarts. Alert separately on
missing references, old rates, refresh failures and storage recovery.

To roll back visibility, disable Gallery Pricing and verify webhook invalidation
(or allow the existing five-minute catalogue cache fallback). Keep the volume and
category/finish metadata. An application rollback must retain that same volume.

## Verification

Tests cover the formula, rate/weight boundaries, explicit zero, fixed making,
manual dates and variants, incoming-rate rejection, saved-rate retention, failed
attempt throttling, five independent worker processes, primary corruption,
backup recovery, abandoned locks and lost ownership. Studio/category/import
validation and server-rendered HTML/dialog consistency have separate checks.

An isolated Linux Docker volume was exercised across separate replacement
containers running as UID 1000, including primary corruption and abandoned-lock
recovery. Browser QA uses a clearly isolated synthetic rate and checks desktop,
mobile, JavaScript-disabled HTML, dialog consistency and absence of browser
polling. Those checks do not substitute for mounting and validating the actual
production volume before activation.

# Google Search Console review — 10 September 2026

Property: `sc-domain:ddasilver.com`, inspected in the owner's open Chrome tab.

## Findings

The Page indexing report was last updated on 4 September. All known URLs:
550 indexed and 428 not indexed. Those totals include non-page assets and
authentication endpoints, so they do not represent 428 broken product pages.

| Reason | All known URLs | Submitted sitemap URLs |
| --- | ---: | ---: |
| Blocked by robots.txt | 112 | 0 |
| Page with redirect | 7 | 0 |
| Excluded by noindex | 6 | 0 |
| Not found (404) | 2 | 0 |
| Alternative page with proper canonical | 2 | 0 |
| Crawled, currently not indexed | 183 | 2 |
| Discovered, currently not indexed | 116 | 116 |

The submitted-page report contains 655 URLs: 537 indexed, 118 not indexed.
The live sitemap also contains 655 URLs. No submitted URLs are reported as
blocked, noindex, missing, redirected, or alternate canonicals.

Sitemaps confirms `https://www.ddasilver.com/sitemap.xml` is **Success**, last
read 9 September, with 655 discovered pages. Three historical HTTP sitemap
submissions last read in 2021 also remain in the account; they were not deleted.

- Blocked examples are `/api/auth/login?returnTo=...`; preserve their exclusion.
  Both header login links already have `rel="nofollow"`.
- Crawled-but-unindexed examples include `/api/og/product/...`, versioned
  JavaScript, and favicon assets. Keep social images crawlable; do not try to
  make these URLs appear as ordinary search pages.
- The two 404s are an obsolete versioned font and
  `/favicon.ico?favicon.2vob68tjqpejf.ico`. The latter now returns HTTP 200.
  Do not redirect missing JavaScript/font assets to an HTML page.
- Submitted crawled examples: `/products/kneeling-bal-krishna-laddoo` and
  `/category/singhasan`. Both currently return HTTP 200, allow indexing,
  and declare their own canonical URL in Googlebot HTML.
- Current URL Inspection supersedes the older aggregate report: the Krishna
  product is already indexed, with one invalid product snippet. Singhasan
  remains unindexed; its last reported crawl is 1 September, with successful
  fetch and a temporary sitemap-processing error.
- Requested indexing for `/category/singhasan`. Google completed its live
  eligibility check and confirmed **Indexing requested**, added to the priority
  crawl queue. This is an accepted request, not confirmation of indexing.
- Discovered examples include `/category/gold`, four curated collections,
  two guides, and product pages. Discovery exists; Google schedules crawling.
- Overview: Core Web Vitals shows 18 good URLs on mobile and desktop, zero
  poor or needs-improvement URLs; HTTPS shows 18 HTTPS and zero non-HTTPS;
  Breadcrumbs has 13 valid and zero invalid items.

## Code correction

The Product snippets report, updated 9 September, has 207 invalid items and
zero valid items. Its sole critical issue is missing `offers`, `review`, or
`aggregateRating`. Examples include multiple incomplete Product objects on
`/category/coin`. Direct product pages also emit incomplete Product objects.

The owner confirmed during this review that published item prices should now
be used. This supersedes the earlier exclusion of estimates from Offer markup
in `docs/gallery-pricing.md`.

- Catalogues emit `CollectionPage` / `ItemList` / `ListItem`, with each item's
  name, canonical URL, and correct pagination position. They no longer emit
  incomplete nested Product objects.
- Priced product pages emit `Product` with INR `Offer` prices taken from the
  same request's estimate used by the visible price component. Each size has an
  individual named Offer matching the visible size table; no AggregateOffer is
  used for variants. Stock, reviews, and expiry dates are not invented.
- Unpriced/unavailable products and prices based on fallback or stale automatic
  references emit `WebPage` with a `Thing` as their main entity. Automatic
  references older than 390 seconds are excluded from offers; manual review dates
  are not expiry dates. Invalid totals and inconsistent size ranges also fail closed.
  Names, descriptions, images, item reference, modification time when available,
  and visible product measurements remain described. The ordinary page content,
  estimates, canonical, sitemap, and BreadcrumbList remain available.
- Priced products now supply the offers missing from the Search Console report.
  Actual indexing and enhanced search display remain Google's decision.

References:
[Google product snippet requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet),
[Google recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

## Release follow-up

Initial validation completed locally: 23 SEO/robots/sitemap tests passed, targeted ESLint
passed, TypeScript passed, and the production build succeeded. Googlebot HTTP
checks against that build verified the direct Krishna product, `/category/coin`,
`/collections/silver-wedding-gifts`, and `/products`: HTTP 200, page/list schema,
canonical link, and no incomplete Product markup. Existing breadcrumbs remain
on the direct product, category, and collection pages. The local server has no
production pricing volume, so live-price delivery was not validated locally.
After enabling price markup, tests additionally cover exact INR offers, each size,
manual prices, missing prices, stale/fallback references, and malformed amounts.
A server-rendering integration test compares each size Offer against the actual
ProductPrice component's HTML, including the enquiry disclosure.
Final validation of the revised price-aware implementation: 31 tests passed,
targeted ESLint and TypeScript passed, and the production build succeeded.

The code changes have not been deployed. Production was observed at version
`9737d201fcdf`. Existing unrelated pricing and gallery working-tree edits were
left intact.

After deploying these code changes, verify `/category/coin`, a collection,
`/products`, and a direct product page with Google's live/Rich Results tests.
Then start validation for the missing offers/reviews issue. Do not start that
validation against the old live markup. Google must recrawl the affected pages
before the report changes. Do not promise that requesting indexing guarantees
indexing or rich-result display.

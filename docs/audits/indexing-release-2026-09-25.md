# Indexing and discovery release baseline — 2026-09-25

This records the production state gathered before the code changes in this
release. Google Search Console statuses below are manual URL Inspection
observations from the desktop UI; HTTP and sitemap checks do not establish
Google's indexing decision.

The 49 URLs from the 21 September “Discovered – currently not indexed” report
were checked on 25 September between **06:14:41.350 and 06:20:37.117 UTC**.
Every URL returned HTTP 200 at its requested URL, appeared in the current
662-URL HTTPS sitemap, had a self-canonical and `index, follow` robots metadata,
and had no `X-Robots-Tag`. The Google status changed for some entries:

- 45 remained “Discovered – currently not indexed”.
- 3 were “URL is unknown to Google”: `/guides/caring-for-silver`,
  `/products/compact-floral-fan-silver-singhasan`, and
  `/products/ornate-peacock-floral-silver-jhula`.
- 1 was “Page is indexed”: `/products/polished-rim-silver-bowl`, a stale entry
  from the original report.

The full per-URL HTTP, sitemap, canonical, robots, timestamp, and manual Google
Inspection evidence is in
[`indexing-release-baseline-2026-09-25.json`](indexing-release-baseline-2026-09-25.json).
The older aggregate report dated 21 September recorded 609 indexed and 416
excluded URLs. Its 217 “crawled – currently not indexed” entries were 139
generated social-preview images, 65 Next.js build assets, 6 favicons, one
manifest, and 6 payal brand pages. The six brand detail pages were separately
confirmed indexed on 25 September.

The corrected HTML-only breadth-first crawl started at the homepage, resolved
relative links against each source page, followed pagination, and excluded
search/filter combinations. It reached **all 662 sitemap URLs** through HTML
anchors, visiting 79 non-product pages and recording 709 unique links with no
fetch errors. Product pages were treated as linked leaves; their HTTP health
was separately checked for the 49-URL baseline. The crawl output is preserved
in [`discovery-crawl-2026-09-25.json`](discovery-crawl-2026-09-25.json). No
unlinked sitemap product was found, so the product route-link structure needs
no release-specific change.

The current sitemap was read on 24 September and contained 662 HTTPS URLs.
Homepage/category/pagination HTML, canonical metadata, and the sitemap were
healthy during the 25 September checks. Search Console’s Crawl Stats report,
updated 23 September, showed 5,020 total requests at a 728 ms average response
time and no current host difficulty. For `www`, it showed 4,717 requests at a
714 ms average, with 93% 200, 4% 301, 3% 404, and less than 1% 5xx or
unreachable. The report describes past high host difficulty but no current
connectivity, robots, or DNS issue; it does not support a hosting upgrade in
this release.

Expected exclusions remain intentional: 131 robots exclusions are auth login
URLs with `returnTo` values; noindex applies to `/login`, `/terms`, `/cookies`,
`/privacy`, `/rates-disclaimer`, and an auth URL. Policy pages stay out of the
sitemap. Seven redirects cover the HTTP/apex host routes, retired
`/index.php/c_booking/index` to `/rates`, and
`/index.php/c_client_main/Contactus` to `/contact`, preserving query strings
and landing on HTTP 200 pages. Four historical asset URLs return 404 and are
not referenced by the current sampled product pages; keep them 404 rather than
redirecting CSS or JavaScript paths to HTML. Two filtered category URLs have
alternate canonicals; the page-two purse URL correctly canonicalizes to
`/category/purse?page=2`. Generated `/api/og/product/*` PNGs are share assets;
this release adds `X-Robots-Tag: noindex` to successful responses only. Real
product photos remain indexable.

Old Search Console sitemap submissions are ready for cleanup after the
canonical sitemap’s full coverage is reconfirmed: HTTP
`product_0.xml?20210210` and `website.xml?20210210` now redirect to HTTPS and
then return 404; old HTTP `sitemap.xml` redirects to the working canonical
HTTPS sitemap. Do not restore these obsolete paths. Remove their stale
submissions only after the current sitemap remains accepted and complete.

After the application release, the operator should recheck the current sitemap
and representative canonical pages, run fresh URL Inspections, request
indexing for the highest-priority eligible pages, and review progress manually
after 7, 14, and 28 days. Search Console submission cleanup and indexing
requests are external operator steps; they are not part of this code change.

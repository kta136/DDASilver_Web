# Implementation status

**Updated:** 28 July 2026  
**Environment:** Local only  
**Production authorization:** Not granted

## Implemented

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and a pinned
  npm lockfile.
- Selected visual option 1 translated into the homepage shell.
- Official DDA Jewels family mark with a DDA Silver sister-brand lockup.
- Temporary mockup-matched concept imagery, isolated under
  `public/images/mockup` and documented for replacement before launch.
- Responsive navigation, footer, focus treatments, skip navigation, and
  reduced-motion handling.
- Homepage, product catalog, product detail, category, collection, rates,
  About, Contact, login, and legal routes.
- Search, category, collection, and purity filtering with no price or inventory
  fields.
- Initial Jewellery, Coin, Idols, Gifts, and Utensils taxonomy, including
  Idols-only Hollow/Solid/Semi Solid filtering and Coin-only
  Round/Oval/Square/Rectangle filtering.
- WhatsApp enquiry links that include product title, optional reference, and
  canonical URL.
- Sanity document schemas for product, category, collection, page, and site
  settings.
- Dedicated DDA Silver Sanity project and public `production` dataset,
  connected locally without altering the DDA Jewels project.
- Sanity preview-read token stored outside the repository in Bitwarden Secrets
  Manager as `DDA_SILVER_WEB__SANITY_API_READ_TOKEN`. The existing
  `DDA_Live_Rates` BWS project is used because the current BWS plan has reached
  its three-project limit.
- Credentialed local CORS origins for the embedded Studio on ports 3000 and
  4173.
- Embedded Studio route with a safe unconfigured state.
- Signed Sanity webhook handling and draft-mode routes.
- Validated v1 live-rate snapshot and SSE event schemas, sequence handling,
  stale detection, reconnection, semantic rate tables, and unavailable states.
- Authorization-code/PKCE handoff routes, state/nonce checks, secure session
  cookies, logout, and personalized rate-ticket route boundaries.
- Consent Mode defaults, persistent preference controls, and consent-gated
  analytics loading.
- Preview crawler blocking, metadata, sitemap foundation, security headers,
  structured business data, and feature-gated legacy redirects.
- Unit-test and Playwright foundations.
- Desktop design comparison and remediation against the selected option, with
  the final result recorded in `design-qa.md`.
- Compact responsive spacing across content, catalog, rate, legal, contact,
  product-detail, collection, app-promo, and footer sections.
- Chrome desktop and mobile route checks, including remediation of hidden
  rate-table accessibility text that enlarged the measured mobile width.

## Intentionally unavailable until prerequisites arrive

- Initial Sanity product catalog and production photography. The DDA Silver
  dataset contains the five initial category documents with temporary mockup
  imagery; the private preview continues to use its local fallback catalog
  until real products are published.
- DDAJewels rate snapshot/SSE connection and personalized visibility.
- DDAJewels shared-account login and code exchange.
- GA4 reporting and Search Console verification.
- Verified Google Business Profile link.
- Final product catalog, approved copy, legal approval, and complete image set.
- Real product and showroom photography to replace every concept image.
- Vercel preview deployment.
- Compatible upstream dependency patches for the findings recorded in
  `docs/security-dependency-audit.md`.

## External backend work still required

- Extend the DDAJewels v1 snapshot response with the agreed fields.
- Confirm exact payload field names for all five SSE event types.
- Add narrow CORS rules for the final stable preview origin.
- Implement the authorization-code exchange contract expected by DDASilver.
- Implement single-use rate tickets with short expiry and rates-only scope.
- Provide staging endpoints and test credentials that contain no production
  customer data.

## Launch protection

No custom domain, DNS, Cloudflare, production alias, redirect activation, or
current-server change has been made. `ENABLE_LEGACY_REDIRECTS` defaults to
`false`, and the site defaults to preview/noindex behavior.

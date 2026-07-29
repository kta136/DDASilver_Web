# Implementation status

**Updated:** 29 July 2026
**Environment:** Local production build plus linked, undeployed Vercel project
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
- Search, category, collection, and purity filtering with reloadable,
  shareable URL state and no price or inventory fields.
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
- Validated and bounded v1 live-rate snapshot and SSE event schemas, sequence
  handling, conservative stale detection, full-snapshot reconnection,
  semantic rate tables, and unavailable states.
- Authorization-code/PKCE handoff routes, state/nonce checks, secure session
  cookies, logout, and personalized rate-ticket route boundaries.
- Consent Mode defaults, persistent preference controls, consent-gated
  analytics loading, and an allowlisted event/parameter taxonomy.
- Preview crawler blocking, route metadata, canonical/social metadata,
  sitemap generation, security headers, structured business data, and
  feature-gated legacy redirects.
- CI for lint, type checks, unit tests, production builds, and desktop/mobile
  Playwright journeys.
- Defensive external-service boundaries for rate, authentication, ticket, and
  Sanity webhook requests, including origin allowlists, timeouts, bounded
  payloads, rate limiting, and runtime catalog validation.
- Non-sensitive `/api/health` readiness reporting for application, Sanity,
  DDAJewels snapshot connectivity, and build version.
- Vercel project `dda-silver-web` linked to `kta136/DDASilver_Web`, with
  automatic Git deployments disabled until a deliberate preview deployment.
- Read-only Sanity integration verified against 22 published product routes.
  No catalog records or assets were changed during the 29 July quality pass.
- Desktop design comparison and remediation against the selected option, with
  the final result recorded in `design-qa.md`.
- Compact responsive spacing across content, catalog, rate, legal, contact,
  product-detail, collection, app-promo, and footer sections.
- Chrome desktop and mobile route checks, including shareable catalog state,
  product enquiry, unavailable-rate behavior, analytics events, preview
  crawler controls, and mobile navigation.
- Current automated evidence: ESLint passed, TypeScript passed, 38 unit tests
  passed, production build passed, and 14 Playwright journeys passed.

## Intentionally unavailable until prerequisites arrive

- Catalog expansion, copy approval, and production photography. This work was
  explicitly left out of the 29 July implementation pass.
- DDAJewels rate snapshot/SSE connection and personalized visibility.
- DDAJewels shared-account login and code exchange.
- GA4 reporting and Search Console verification.
- Verified Google Business Profile link.
- Final product catalog, approved copy, legal approval, and complete image set.
- Real product and showroom photography to replace every concept image.
- Stable Vercel preview deployment and owner UAT.
- Upstream dependency patches or documented risk acceptance for the residual
  findings recorded in `docs/security-dependency-audit.md`.

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

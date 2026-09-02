# Implementation status

**Updated:** 2 September 2026
**Environment:** Oracle Coolify production behind Cloudflare
**Production authorization:** Granted for the approved Coolify/Cloudflare
cutover plan

## Implemented

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and a pinned
  npm lockfile.
- Selected visual option 1 translated into the homepage shell.
- Official DDA Jewels family mark with a DDA Silver sister-brand lockup.
- Owner-confirmed DDA family heritage year of 1977, reflected in the About
  page and project decision records.
- Temporary mockup-matched concept imagery, isolated under
  `public/images/mockup` and documented for replacement before launch.
- Responsive navigation, footer, focus treatments, skip navigation, and
  reduced-motion handling.
- Homepage, product catalog, product detail, category, collection, rates,
  About, Contact, login, and legal routes.
- Search, category, collection, and purity filtering with reloadable,
  shareable URL state and no price or inventory fields.
- Initial Jewellery, Coin, Idols, Gifts, and Utensils taxonomy, including
  Idols-only Idol Construction and Deity filtering and Coin-only
  Round/Oval/Square/Rectangle filtering.
- Approved idol Item Name and reference terminology using `HM` for hollow,
  `SSM` for semi-solid, and `SM` for solid construction with independent
  family sequences documented in `docs/idol-item-codes.md`.
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
- Same-origin authenticated snapshot, SSE, rate-history, and source-history
  proxies that translate the separate DDA Silver SSO session into the regular
  DDAJewels session accepted by its authoritative rates service.
- Complete server-authorized item rendering, authorized buying-rate fields,
  persistent row rearranging/hiding, and authorized rate/market history charts.
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
  and source-commit build version.
- ARM64-compatible multi-stage Docker image using Next.js standalone output,
  a non-root runtime user, an internal port, and Docker health checks.
- Application-owned apex-to-`www` redirect, preserving request paths and query
  strings independently of the hosting platform.
- GitHub production workflow that gates the deploy-only Coolify webhook behind
  the repository checks and serializes production releases.
- Former hosting project, deployments, stored environment, aliases, and
  account-level `ddasilver.com` domain registration permanently removed after
  the Oracle cutover was validated.
- Read-only Sanity integration verified against 22 published product routes.
  No catalog records or assets were changed during the 29 July quality pass.
- Desktop design comparison and remediation against the selected option, with
  the final result recorded in `design-qa.md`.
- Compact responsive spacing across content, catalog, rate, legal, contact,
  product-detail, collection, app-promo, and footer sections.
- Chrome desktop and mobile route checks, including shareable catalog state,
  product enquiry, unavailable-rate behavior, analytics events, preview
  crawler controls, and mobile navigation.
- Current automated evidence: ESLint passed, TypeScript passed, 47 unit tests
  passed, production build passed, and 14 Playwright journeys passed.
- Eight representative routes pass automated axe checks with zero violations
  after button-contrast, brand-link naming, and catalog-heading remediation.
- Local production Lighthouse evidence scores 94 Performance, 100
  Accessibility, and 100 Best Practices. Preview-only noindex controls produce
  the expected reduced SEO score, while a 3.1-second lab LCP remains open
  against the 2.5-second launch target.
- Internal links/fragments pass validation, and the six primary external
  destinations return HTTP 200.

## Content follow-up

- Catalog expansion, copy approval, and production photography. This work was
  explicitly left out of the 29 July implementation pass.
- GA4 reporting and Search Console verification.
- Verified Google Business Profile link.
- Final product catalog, approved copy, legal approval, and complete image set.
- Real product and showroom photography to replace every concept image.
- Owner UAT on production or an explicitly created, Access-protected temporary
  Coolify validation route.
- Upstream dependency patches or documented risk acceptance for the residual
  findings recorded in `docs/security-dependency-audit.md`.

## Production operations

- Coolify owns the production container and runtime environment on Oracle
  `coolify-a1`.
- Cloudflare remains the public TLS/CDN/WAF layer and forwards both site hosts
  through the existing named tunnel to Coolify Traefik.
- GitHub Actions is the only automatic production release trigger.
- Rollback uses a retained healthy Coolify image or a reverted Git commit;
  there is no dormant external hosting origin.

See [Oracle Coolify production deployment](oracle-coolify-deployment.md) and
[Delivery, launch, and rollback](delivery-launch-rollback.md) for current
controls and validation requirements.

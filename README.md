# DDA Silver Web Replacement

Implementation foundation for the future replacement of
[ddasilver.com](https://www.ddasilver.com/).

## Project status

**Phase:** Local implementation and integration scaffolding  
**Application code:** In progress  
**Preview deployment:** Not created  
**Production changes:** Not authorized

The existing DDASilver website, DNS, hosting, redirects, and integrations must
remain untouched until the owner gives the exact instruction:

> Go live on ddasilver.com.

Creating source code, local previews, Vercel preview deployments, Sanity
schemas, or test environments does not grant production-launch authority.

## Approved direction

- Modern, approachable digital showroom for retail customers across India.
- DDA Silver remains a distinct sister brand to DDAJewels.
- Use the official DDA Jewels family mark on DDA Silver, per the owner’s latest
  direction, and distinguish the sister brand with the “SILVER” label and its
  own visual system.
- English-first, mobile-first, and WCAG 2.2 AA.
- Editorial catalog of approximately 50–200 products.
- Browse and enquire through WhatsApp; no prices, stock promises, checkout, or
  e-commerce.
- Sanity Studio for catalog and page content.
- DDAJewels remains authoritative for live rates, users, and personalized-rate
  visibility.
- Next.js and TypeScript on Vercel, with Cloudflare introduced only during an
  approved production cutover.

## Documentation

1. [Product requirements](docs/product-requirements.md)
2. [Information architecture and UX](docs/information-architecture.md)
3. [Technical architecture](docs/technical-architecture.md)
4. [Sanity content model](docs/content-model.md)
5. [Live-rates integration](docs/rates-integration.md)
6. [Shared-account authentication](docs/authentication.md)
7. [Analytics, SEO, accessibility, and testing](docs/quality-strategy.md)
8. [Delivery, launch, and rollback](docs/delivery-launch-rollback.md)
9. [Prerequisites and content intake](docs/prerequisites.md)
10. [Locked decisions](docs/decisions.md)
11. [Implementation status](docs/implementation-status.md)
12. [Photography and brand asset audit](docs/asset-audit.md)
13. [Dependency security audit](docs/security-dependency-audit.md)
14. [Design QA](design-qa.md)

Content intake templates:

- [Catalog import template](docs/templates/catalog-import-template.csv)
- [Asset inventory template](docs/templates/asset-inventory-template.csv)

## Intended implementation order

1. [x] Produce exactly three visual concepts and obtain owner selection.
2. [x] Select option 1 as the visual target.
3. [x] Scaffold the Next.js application, Sanity schemas, and test tooling.
4. [x] Build catalog and editorial route foundations using temporary
   mockup-matched concept imagery.
5. [x] Scaffold the validated public-rate snapshot/SSE consumer.
6. [x] Scaffold the redirected DDA account handoff and rate-ticket route.
7. [ ] Connect DDAJewels staging endpoints and Sanity credentials.
8. [ ] Import the approved catalog and replace provisional copy/assets.
9. [ ] Complete accessibility review, integration testing, and owner UAT.
10. [ ] Prepare—but do not execute—the launch and rollback runbook.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add only the integrations available
for the current environment. With no secrets configured, the catalog uses the
official-photo fallback data and rates/auth show safe unavailable states.

Quality commands:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

## External systems

- Public reference: [DDAJewels live rates](https://ddajewels.com/rates)
- Existing TV display: [DDAJewels TV view](https://ddajewels.com/tv)
- Android app:
  [Google Play](https://play.google.com/store/apps/details?id=lmx.dda.bullion)
- iOS app:
  [Apple App Store](https://apps.apple.com/in/app/dda-silver/id1565809906)
- Sanity:
  [pricing](https://www.sanity.io/pricing?lang=en) and
  [roles](https://www.sanity.io/docs/user-guides/roles)
- Google:
  [Consent Mode](https://developers.google.com/tag-platform/security/guides/consent)

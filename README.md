# DDA Silver

The Next.js application for [ddasilver.com](https://www.ddasilver.com/).

DDA Silver is being built as a modern, mobile-first digital showroom for
customers across India. Visitors can browse silver products and collections,
view live-rate experiences when integrations are available, and enquire through
WhatsApp. The site intentionally has no checkout, inventory promises, or public
product pricing.

## Project status

This repository contains the production application and its Oracle Coolify
deployment configuration.

| Area | Status |
| --- | --- |
| Application and responsive UI | Production |
| Catalog and editorial routes | Production; content remains Sanity-managed |
| Sanity schemas and Studio | Production |
| DDAJewels rates and authentication | Production integration configured server-side |
| Production hosting | Oracle `coolify-a1`, reached only through Cloudflare Tunnel |
| Rollback | Previous healthy Coolify image or a reverted `main` commit |

## Highlights

- Responsive homepage, catalog, product, category, collection, rates, and
  editorial pages.
- Search and product filtering without exposing price or inventory data.
- Product enquiries through prefilled WhatsApp links.
- Sanity Studio schemas for products, categories, collections, pages, and site
  settings.
- DDA Silver-branded `/rates` page with validated DDAJewels snapshot and
  server-sent event contracts.
- Authorization-code and PKCE scaffolding for shared DDA account access.
- Consent-aware analytics, preview crawler blocking, metadata, sitemap, and
  structured business data.
- Non-sensitive dependency readiness at `/api/health`.
- Accessible navigation, focus states, reduced-motion handling, and responsive
  layouts.
- Unit tests with Vitest and browser tests with Playwright.

## Technology

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Sanity
- Zod
- Vitest, Testing Library, and Playwright

## Getting started

### Requirements

- Node.js 24.19 or newer
- npm

### Installation

```bash
git clone https://github.com/kta136/DDASilver_Web.git
cd DDASilver_Web
npm ci
```

Create a local environment file from the committed template:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

The application starts safely without integration secrets. It uses fallback
catalog data, while rates, authentication, and CMS-dependent experiences show
their unavailable or preview states.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment configuration

The available variables and safe defaults are documented in
[`.env.example`](.env.example). They cover:

- Site URL and preview behavior
- Sanity project access and webhook secrets
- Server-side DDAJewels rate snapshot and event-stream endpoints
- Shared-account authorization
- Optional Google Business and Analytics destinations

Keep real credentials in `.env.local` or an approved secret manager. Environment
files other than `.env.example` are excluded from Git.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Run a completed production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check TypeScript types |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run the unit test suite once |
| `npm run test:e2e` | Run desktop and mobile Playwright tests |
| `npm run check` | Run linting, type checks, unit tests, and a build |
| `npm run sanity:seed-categories` | Preview category seeding without writes |
| `npm run sanity:seed-categories:apply` | Apply category seeding to the asserted dataset |
| `npm run sanity:seed-deities` | Preview Deity taxonomy seeding without writes |
| `npm run sanity:seed-deities:apply` | Apply Deity taxonomy seeding to the asserted dataset |
| `npm run sanity:upload-idols` | Preview the 19-product idol import without writes |
| `npm run sanity:upload-idols:apply` | Upload and publish missing idol products |
| `npm run sanity:upload-idols:overwrite` | Replace existing script-managed idol products |

The Sanity catalog import utilities are defined in `package.json` and documented
under [`scripts/images`](scripts/images/README.md). Commands ending in `:apply`
write to the configured Sanity dataset and should only be used with the intended
project and credentials.

## Project structure

```text
src/app/          App Router pages, layouts, and route handlers
src/components/   Shared UI and feature components
src/lib/          Authentication, catalog, rates, security, and utility logic
src/sanity/       Sanity client configuration, queries, and schemas
public/           Brand, catalog, and presentation assets
scripts/          Image preparation and Sanity import utilities
tests/e2e/        Playwright browser tests
docs/             Product, architecture, integration, and launch documentation
```

## Documentation

- [Product requirements](docs/product-requirements.md)
- [Information architecture and UX](docs/information-architecture.md)
- [Technical architecture](docs/technical-architecture.md)
- [Sanity content model](docs/content-model.md)
- [Idol item-code terminology](docs/idol-item-codes.md)
- [Live-rates integration](docs/rates-integration.md)
- [Shared-account authentication](docs/authentication.md)
- [Quality strategy](docs/quality-strategy.md)
- [Delivery, launch, and rollback](docs/delivery-launch-rollback.md)
- [Oracle Coolify production deployment](docs/oracle-coolify-deployment.md)
- [Prerequisites and content intake](docs/prerequisites.md)
- [Implementation status](docs/implementation-status.md)
- [Design QA](design-qa.md)

See the [documentation index](docs/README.md) for the complete project record.

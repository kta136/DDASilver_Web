# Homepage B implementation

Applied 12 September 2026 in the existing Next.js application. Preview: http://localhost:3000. No deployment, account configuration, catalogue upload, or production content mutation was performed.

## Delivered

- Deep green shared masthead with centred typographic DDA/SILVER lockup, functional search, desktop links, customer account controls, WhatsApp enquiry, and mobile menu. The established family logo remains in the footer.
- Approved B editorial hero plate, large serif headline, real category panels, all remaining category links, featured products, live-rate entry, showroom details, guides, app links, and dark footer.
- Catalogue sidebar with mobile disclosure, rectangular search/filter controls, square product images and clearer product information. Existing URL filters, pagination, dynamic estimates, product overlays, gallery interactions, and enquiry URLs are retained.
- Consistent category, collection, product detail, showroom, contact, login, rates, guide, and policy templates. Editorial pages have an on-page contents navigation. Real phone, address, hours, store links, and authentication handoff remain intact.

## Design provenance and deliberate adaptations

Source: `artifacts/dda-redesign-2026-09-12/fresh-design/draft-run/candidates/B.png` (1536 × 1024).
12ui conversion: `78c229ea-6100-474f-a0f7-a18ac1a5179a`; responsive export: `866049eb-8b36-4936-8358-16a74a6936fd`.
The exported layout and measured proportions informed the responsive React integration. The original campaign plate is at `public/images/design/homepage-b-editorial.png`. It is editorial artwork and does not substitute for the catalogue's source product photographs.

The 12ui target-based improve kit completed in `artifacts/dda-redesign-2026-09-12/implementation-b/fidelity`. Its measured DOM overlap was 48.1% (below the 60% anchoring threshold), so this is not a claim of exact pixel equivalence. Reviewed recommendations were applied for typography, masthead colours, collection spacing, and the original hero plate. The original category inventory, readable font sizes, search, browse CTA, and enquiry action take precedence over mockup-only content and shopping controls. Existing C-based branch mockups were not used as approved B targets.

## Validation

- TypeScript and production build passed.
- ESLint passed.
- Unit suite: 253 tests across 50 files passed.
- Browser journey suite: 20 passed; 6 production-only SEO tests skipped by the existing preview-environment guard.
- 31 existing routes checked at 1536 × 1024 and 390 × 844: 62 successful responses, no horizontal overflow, no captured page exceptions, and no failed loaded images.
- New browser coverage: keyboard focus and Escape for header search, shareable search query, mobile category disclosure, and mobile navigation to guides. Existing tests cover filtering, product overlay, browser history, enquiry paths, consent analytics, rates fallback, and robots/health behavior.

Screenshots and route results: `artifacts/dda-redesign-2026-09-12/implementation-b/verification/report.json`. Full-page screenshots may contain not-yet-loaded lazy images below the initial viewport; viewport screenshots show the rendered first-screen design.

The local live-rate upstream was unavailable during review. The existing unavailable/last-accepted-data behavior remains; no fabricated values were introduced. Successful UI tests do not certify upstream live-rate availability or a real authenticated customer session.

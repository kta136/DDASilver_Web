# Analytics, SEO, accessibility, and testing

**Status:** Approved quality requirements  
**Implementation:** Not started

## Analytics and consent

Use GA4 and Google Search Console.

### Consent behavior

- Default `analytics_storage`, `ad_storage`, `ad_user_data`, and
  `ad_personalization` to denied.
- Offer Accept, Reject, and Manage preferences.
- Persist the user’s choice in first-party storage.
- Allow withdrawal or modification from the footer.
- Do not send analytics events before the configured consent behavior permits
  them.
- Keep preview analytics separate or disabled.

The final implementation and legal copy require owner/legal review.

### Approved GA4 events

| Event | Trigger | Allowed parameters |
| --- | --- | --- |
| `catalog_search` | Search submitted or debounced | Query length, result count |
| `catalog_filter` | Category/collection changed | Filter type, public slug |
| `product_view` | Product detail viewed | Product slug, category slug |
| `whatsapp_click` | WhatsApp enquiry selected | Placement, product slug if applicable |
| `phone_click` | Phone link selected | Placement |
| `map_click` | Directions/profile selected | Placement |
| `app_store_click` | Store badge selected | Platform, placement |
| `login_start` | Redirected login begins | Placement |
| `login_success` | Valid DDASilver session created | No user identity |
| `rate_expand` | Market row expanded | Public source name |

Never send names, phone numbers, email addresses, authorization data, session
IDs, stream tickets, free-form WhatsApp text, or internal customer identifiers.

## SEO

### Production

- Canonical URLs on every indexable route.
- Generated XML sitemap.
- Production robots policy.
- Unique title and description for home, product, category, collection, rates,
  about, and contact routes.
- Open Graph and social images.
- Breadcrumb structured data.
- Organization/LocalBusiness structured data using verified facts.
- Product structured data without fake offers, prices, ratings, or stock.
- Search Console verification and sitemap submission.
- Redirect inventory for indexed legacy URLs.

### Preview

- `X-Robots-Tag: noindex, nofollow`.
- Robots disallow all.
- No production canonical.
- No production sitemap submission.
- No `ddasilver.com` or `www.ddasilver.com` domain alias.

## Accessibility

Target WCAG 2.2 AA.

Required checks:

- Keyboard-only navigation.
- Visible focus at all breakpoints.
- Skip link.
- Correct landmarks and heading order.
- Accessible mobile menu.
- Text alternatives for all meaningful images.
- Empty alt only for intentionally decorative images.
- Rate tables retain correct headers and captions.
- Rate status uses a polite live region without tick-by-tick noise.
- Expansion controls expose name and state.
- Color contrast meets AA.
- Meaning is not conveyed by color alone.
- Touch targets meet recommended size.
- Zoom to 200% without content loss.
- Reduced motion respected.
- Error and unavailable states remain understandable without icons.

## Performance budgets

- No horizontal page overflow at 320px or wider.
- LCP target: 2.5 seconds or less.
- INP target: 200 milliseconds or less.
- CLS target: 0.1 or less.
- Lighthouse mobile target: at least 90 for accessibility, SEO, and best
  practices.
- Any performance score below target requires a recorded explanation and owner
  approval before launch.

Implementation requirements:

- Responsive image sizes and modern formats.
- Explicit image dimensions.
- No oversized hero assets.
- Server-render critical page content.
- Keep rate updates scoped so a tick does not rerender the whole page.
- Lazy-load non-critical media and Studio-only code.
- Avoid third-party scripts before consent.

## Test layers

### Unit

- Catalog projections and filters.
- WhatsApp URL construction.
- Indian-number and market-value formatting.
- Rate snapshot/event validation.
- Sequence ordering and incremental reducers.
- Stale-state transitions and reconnect delay calculation.
- Safe redirects and callback transaction validation.
- Consent state and analytics event sanitization.

### Component

- Header and mobile navigation.
- Product cards and galleries.
- Catalog filters and empty state.
- Customer-rate and market-rate tables.
- Expanded market detail.
- Rate connection/status announcements.
- Consent banner and preference panel.
- Login/logout controls.

### Contract

Against a DDAJewels staging environment:

- Snapshot v1 compatibility.
- Each SSE event type.
- Unknown additive fields.
- Malformed and unknown-version rejection.
- CORS and preflight from approved origins.
- Connection loss, stale state, and recovery.
- Authorization-code exchange.
- Personalized stream tickets and visibility.

### End to end

- Browse, search, filter, and clear catalog state.
- Open a product and create the correct WhatsApp URL.
- Phone, map, app, DDAJewels, Google profile, and TV links.
- Accept/reject/update consent and verify analytics behavior.
- Redirected login success and safe failure.
- Personalized and public rate views.
- Logout.
- Preview noindex behavior.
- Legacy redirects in a production-like test environment.

### Visual and manual

- Visual regression at representative 360px, 768px, and 1440px viewports.
- Manual Safari/iOS and Chrome/Android checks.
- Manual keyboard and screen-reader review.
- Full content and factual review by owner.
- Legal review of privacy, terms, cookies, and rates disclaimer.

## Release evidence

The launch-review package should contain:

- Test summary and failing-test exceptions.
- Accessibility audit and manual findings.
- Lighthouse and Core Web Vitals results.
- Rate contract and outage-recovery results.
- Authentication/security test results.
- Link checker output.
- Content approval record.
- Redirect inventory.
- Rollback verification.


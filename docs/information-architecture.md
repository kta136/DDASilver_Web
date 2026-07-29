# Information architecture and UX

**Status:** Locked route and navigation model  
**Implementation:** Implemented; final catalog content and external service
validation remain

## Primary navigation

1. Home
2. Products
3. Live Rates
4. About
5. Contact

The mobile navigation must expose the same destinations, preserve keyboard
focus, close on navigation, and support Escape dismissal.

## Sitemap

```text
/
├── products
│   └── [product-slug]
├── category
│   └── [category-slug]
├── collections
│   └── [collection-slug]
├── rates
├── about
├── contact
├── login
├── auth
│   └── callback
├── privacy
├── terms
├── rates-disclaimer
└── cookies
```

Generated system routes include `/robots.txt`, `/sitemap.xml`, image/social
metadata endpoints, Sanity revalidation, session/logout, and authenticated
stream-ticket endpoints.

## Page specifications

### Home

Recommended content order:

1. Brand-story hero with one primary “Explore products” action.
2. Short DDA family heritage statement.
3. Product-category discovery.
4. Optional featured collection.
5. Live-rate teaser with connection state.
6. Craft, purity, and service principles using owner-approved claims.
7. Mobile-app promotion.
8. Visit/contact section.

The first viewport must not be dominated by rates or app downloads.

### Products

- Page heading and short catalog introduction.
- Search input with a persistent accessible label.
- Category and collection filters.
- Active-filter summary and clear-all control.
- Product grid with editor-controlled ordering.
- No price, stock badge, quick-buy, or shopping-cart affordance.

Query parameters:

```text
/products?q=coin&category=coins&collection=festive
```

Unknown filter values are ignored, and an invalid combination renders a normal
empty state rather than an error page.

Search and supported filters are encoded in the URL so a filtered catalog can
be bookmarked, shared, and restored after reload or browser navigation.

### Product detail

- Breadcrumbs.
- Image gallery with thumbnails and descriptive alt text.
- Product name and short description.
- Category and optional collection links.
- “Confirm availability on WhatsApp” primary action.
- Optional related products from the same category or collection.
- App and rate promotions remain secondary.

### Category and collection

- Editable title, description, and image.
- Published matching products.
- Same filter/grid behavior as the all-products page where useful.
- Canonical URL must be the category or collection route, not a filtered
  `/products` query.

### Rates

- Page introduction and accessible live-status announcement.
- Customer-rate table.
- Short explanation that rates update automatically.
- Market-data table with expandable high/low detail.
- Personalized visibility when the user has a valid DDA Silver session.
- Sign-in or sign-out action.
- DDAJewels TV-display link.
- Mobile-app promotion.
- Rates disclaimer link.

### About

- DDA family heritage since 1978.
- DDA Silver’s distinct role and approach.
- Showroom and craft photography.
- Owner-approved claims only.
- Sister-brand relationship to DDAJewels.

### Contact

- Phone, WhatsApp, address, directions, verified business-profile link, and
  hours.
- Clear Monday-closed state.
- No submission form.

## Global footer

- DDA Silver identity and short description.
- Contact and hours.
- Product, rates, about, contact, and legal links.
- DDAJewels sister-brand link.
- Android and iOS links.
- Cookie-preferences control.

## URL and redirect rules

- Use lowercase, human-readable slugs.
- Sanity must reject duplicate slugs per content type.
- Published slug changes require a redirect entry before release.
- Product canonical URLs use `/products/[slug]`.
- Category canonical URLs use `/category/[slug]`.
- Collection canonical URLs use `/collections/[slug]`.

Required legacy redirects after explicit production approval:

```text
/index.php/c_booking/index              -> /rates
/index.php/c_client_main/Contactus      -> /contact
```

Additional indexed legacy URLs must be inventoried before launch and mapped to
the closest relevant route. Do not redirect unrelated URLs to the homepage.

## Responsive and accessibility rules

- Support 320px and wider without horizontal page overflow.
- Do not hide essential actions by breakpoint.
- Use semantic headings in order.
- Use real links for navigation and real buttons for actions.
- All menus, dialogs, galleries, accordions, and tables must work by keyboard.
- Expanded market rows expose `aria-expanded` and a clear accessible name.
- Rate connection changes use a polite live region and avoid announcing every
  price tick.
- Respect `prefers-reduced-motion`.

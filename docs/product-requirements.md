# Product requirements

**Status:** Locked product brief  
**Implementation:** Core web experience implemented; catalog/content and
external service completion remain

## Product statement

DDA Silver will be a modern, approachable digital showroom for retail
customers across India. It will present the business, its DDA family heritage,
and a curated catalog of silver designs while making live rates and direct
contact easy to find.

The website supports discovery and enquiry. It is not an online store.

## Audience

### Primary audience

Retail customers in India browsing silver jewellery, coins, pooja articles,
gifts, and home or tableware products.

### Important user intents

- Understand who DDA Silver is and why the business is trustworthy.
- Browse products by type or collection.
- Inspect clear product photography and a short description.
- Check current DDA gold, silver, and market rates.
- Ask about a particular product through WhatsApp.
- Call the showroom, view directions, or check opening hours.
- Download the existing mobile apps.
- Sign in with an existing DDA account to receive authorized personalized-rate
  visibility.

## Goals

- Replace the current broken and outdated experience with a credible,
  mobile-first showroom.
- Make product discovery the central browsing experience.
- Preserve DDAJewels as the authoritative live-rate and identity backend.
- Make WhatsApp the measurable product-enquiry conversion.
- Establish a maintainable catalog workflow for 1–2 trusted administrators.
- Build and validate the replacement without changing the current production
  website.

## Non-goals

- Product prices or price calculations.
- Real-time product inventory or stock promises.
- Cart, checkout, payment, shipping, returns, or order management.
- Customer enquiry forms or storing enquiry submissions.
- Saved products, wishlists, member profiles, or purchase history.
- Wholesale-specific or trade-buyer journeys in v1.
- Dedicated custom-order, corporate-gifting, or editorial-journal sections.
- A separate DDA Silver TV display.
- Hindi or other localization in v1.
- Rebranding or replacing the existing DDA Silver logo.

## Brand and public facts

### Locked brand direction

- Public name: **DDA Silver**
- Relationship: distinct sister brand to DDAJewels
- Heritage claim: DDA family heritage since 1977
- Visual character: modern and approachable
- Homepage emphasis: brand and family story first
- Logo: retain the existing mark

### Approved contact defaults

- Phone: `0562-4100044`
- WhatsApp: `+91 7060001491`
- Location: MG Road, opposite Nagar Nigam, Agra
- Hours: Tuesday–Sunday, 12:00–20:00

The final map URL and Google Business Profile URL are launch blockers and must
be verified before production.

## Functional requirements

### Homepage

- Lead with the approved DDA Silver story and real brand photography.
- Introduce core product categories and optional featured collections.
- Show a compact live-rate teaser linking to `/rates`.
- Promote both mobile apps.
- Present phone, WhatsApp, directions, and showroom hours.
- Link to DDAJewels only as a sister brand in the footer.

### Catalog

- Browse all published products.
- Search title and short description.
- Filter by category and optional collection.
- Preserve an editor-defined ordering.
- Support featured products.
- Show a deliberate empty state when no result matches.
- Keep search/filter state shareable through URL query parameters.

### Product detail

- Show title, category, optional collections, short description, and an
  accessible image gallery.
- Show “Confirm availability on WhatsApp.”
- Generate a WhatsApp message containing the product title, optional internal
  reference, and canonical URL.
- Do not show price, stock, weight, variant, shipping, or checkout controls.

### Live rates

- Match the data and behavior of DDAJewels while using the selected DDA Silver
  visual system.
- Support public live rates and authenticated personalized-rate visibility.
- Link to the existing DDAJewels TV display.
- Promote the mobile apps.
- Never invent, derive, or silently substitute a rate.

### Contact

- Provide WhatsApp, click-to-call, map/directions, hours, and Google Business
  Profile.
- Do not include a contact form.

### Authentication

- Redirect sign-in to DDAJewels.
- Preserve existing DDA accounts.
- Create a separate secure DDASilver session after a one-time callback.
- Provide no DDASilver profile or account-management pages.

### Legal and consent

- Provide privacy, terms, cookie, and rates-disclaimer pages.
- Provide accept, reject, and manage-preferences controls for optional
  analytics.
- Require owner/legal approval of production legal copy.

## Success and acceptance

The replacement is ready for owner launch review only when:

- The owner approves one of three visual concepts and all public copy.
- Initial catalog content and image alt text are complete.
- Product enquiry links contain correct non-sensitive context.
- Live rates pass normal, closed-market, stale, disconnected, and recovery
  scenarios.
- Existing DDA accounts complete the redirected login flow and receive the
  correct rate visibility.
- Contact, maps, app-store, sister-brand, and TV-display links work on real
  mobile and desktop devices.
- Accessibility, performance, SEO, analytics-consent, security, and rollback
  checks pass.

# Prerequisites and content intake

**Status:** Production infrastructure access and launch authorization obtained;
remaining content items are editorial follow-up

## Engineering access

- [ ] DDAJewels backend repository.
- [ ] DDAJewels local-development instructions.
- [ ] DDAJewels staging URL.
- [ ] Rate API and SSE implementation ownership.
- [ ] Identity/auth implementation ownership.
- [x] Oracle Coolify and Cloudflare Tunnel administrative access available.
- [x] Dedicated Sanity project created for DDA Silver with a public
  `production` dataset.
- [ ] GA4 property ID or approval to create a separate property.
- [ ] Search Console ownership verification path.
- [x] Cloudflare production DNS and named Tunnel access.
- [x] Oracle `coolify-a1` and Coolify production access.

Do not place credentials or tokens in this checklist.

## Brand assets

- [x] Owner directed the site to use the DDA Jewels website logo.
- [x] Transparent PNG downloaded from the official DDA Jewels public brand
  asset endpoint.
- [ ] Editable/vector master for the DDA Jewels family mark.
- [ ] Approved monochrome/dark-background versions, if available.
- [ ] Brand-name spelling and legal footer name.
- [ ] Existing font licenses, if any.
- [ ] App icons and approved store badges.

## Photography

- [ ] Showroom exterior.
- [ ] Showroom interior.
- [ ] Family/heritage images approved for publication.
- [ ] Product masters for initial catalog.
- [ ] Image ownership/permission confirmed.
- [ ] Missing or poor-quality shots recorded in the asset inventory.
- [ ] Targeted reshoot completed for launch-blocking gaps.

## Catalog spreadsheet

Use [templates/catalog-import-template.csv](templates/catalog-import-template.csv).

Required per product:

- Title.
- Category.
- Short description.
- At least one matching image filename.
- Alt text for each meaningful image.
- Display order.

Optional:

- Collection names.
- Featured flag.
- Internal reference.

Do not include price, inventory, customer information, or unpublished supplier
secrets.

## Business facts

- [x] Public brand: DDA Silver.
- [x] Heritage year resolved as 1977 by the owner on 29 July 2026.
- [x] Phone: 0562-4099980.
- [x] WhatsApp: +91 7060001491.
- [x] Location description: MG Road, opposite Nagar Nigam, Agra.
- [x] Hours: Tuesday–Sunday, 12:00–20:00.
- [ ] Exact formatted postal address.
- [ ] Verified Google Maps URL.
- [ ] Verified Google Business Profile/review URL.
- [ ] Approved short brand description.
- [ ] Approved About narrative and supporting facts.
- [ ] Approved purity/craft/service claims.
- [ ] Legal business name for footer and policies.

## External links

- [x] DDAJewels sister-brand URL.
- [x] DDAJewels TV URL.
- [x] Android app URL.
- [x] iOS app URL.
- [ ] Final privacy contact.
- [ ] Any approved social profile URLs.

## Copy approval

The implementation team may draft English copy only from verified facts.

Before production:

- [ ] Owner approves homepage and About copy.
- [ ] Owner approves category and collection copy.
- [ ] Catalog admin approves every product description.
- [ ] Owner/legal reviewer approves privacy, terms, cookies, and rate disclaimer.
- [ ] Owner approves all structured-data facts.

## Production-only prerequisites

These are not needed to begin local work:

- [x] Production migration to Oracle Coolify authorized on 25 August 2026.
- [x] Current DNS and tunnel configuration identified for export at cutover.
- [x] Cloudflare zone and non-web routes preserved by the migration plan.
- [x] Former hosting project and domain registration removed after cutover.
- [x] Coolify image/Git rollback procedure and operator confirmed.
- [ ] Legacy URL inventory complete.
- [ ] Search Console and monitoring ready.

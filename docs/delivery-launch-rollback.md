# Delivery, launch, and rollback

**Status:** Hard operational control  
**Production authority:** Not granted

## Absolute launch gate

No DNS, nameserver, custom-domain, production-alias, current-server, live
redirect, or search-indexing change may occur until the owner gives this exact
instruction:

> Go live on ddasilver.com.

Statements such as “finish it,” “deploy a preview,” “make it ready,” “show the
team,” or “prepare production” do not satisfy the gate.

## Delivery phases

### 1. Prerequisites

- Obtain source and staging access for DDAJewels rates and identity.
- Obtain Vercel, future Cloudflare, Sanity, GA4, and Search Console access.
- Collect logo masters, photography, product spreadsheet, map/profile URLs,
  and owner-approved facts.
- Export current DNS and legacy URL inventory without changing them.

### 2. Visual direction

- Audit logo and photography.
- Draft copy from verified facts.
- Create exactly three homepage/product visual directions.
- Obtain owner selection.
- Define the selected responsive design tokens and component behavior.

No production UI implementation begins before this selection.

### 3. Foundation

- Scaffold Next.js, TypeScript, Tailwind, Sanity, and tests.
- Configure environment separation.
- Establish preview-only CI/CD.
- Add preview noindex and robots controls.
- Build global layout, catalog, content routes, and legal placeholders.

### 4. Shared services

- Implement/extend DDAJewels rate snapshot contract.
- Add allowlisted CORS and staging contract tests.
- Build public SSE state handling.
- Implement redirected login/code exchange.
- Implement personalized stream ticket.
- Add health monitoring and safe failure states.

### 5. Content and quality

- Import product drafts.
- Attach/crop images and resolve asset issues.
- Complete owner copy review.
- Run automated, visual, accessibility, security, and real-device testing.
- Conduct owner UAT on the unlisted Vercel preview.

### 6. Launch preparation

Preparation may include documents, dry runs, and inactive configuration only:

- Cloudflare zone and DNS change plan.
- Vercel custom-domain plan.
- Current DNS backup.
- TLS and redirect checklist.
- Search Console and sitemap checklist.
- Monitoring and escalation contacts.
- Rollback commands and DNS values.

Do not attach or route the live domain during preparation.

## Preview policy

- Unlisted Vercel URL only.
- Publicly reachable to reviewers with the link.
- `noindex, nofollow` header.
- Robots disallow all.
- Separate/non-production secrets.
- No live DDASilver domain or `www` alias.
- Preview content must not contain unapproved private or customer information.

## Approved cutover runbook

Execute only after the exact launch instruction.

### Pre-cutover

1. Confirm owner approval timestamp and responsible operator.
2. Confirm the approved commit and immutable Vercel deployment.
3. Re-run production build, smoke, auth, rate, link, accessibility, and
   redirect checks.
4. Export current Namecheap DNS records and record the current legacy origin.
5. Verify the Cloudflare zone contains all necessary non-web records before
   nameserver changes.
6. Verify Vercel domain records and certificate requirements.
7. Confirm old Apache origin remains available for rollback.

### Cutover

1. Add/verify apex and `www` with Vercel.
2. Activate the approved Cloudflare DNS/proxy configuration.
3. Change nameservers or DNS records according to the reviewed runbook.
4. Verify TLS and hostname redirects.
5. Verify home, products, product detail, rates, login callback, contact, legal,
   robots, and sitemap on both hostnames.
6. Enable production indexing and production GA4 consented tracking.
7. Submit sitemap in Search Console.
8. Begin enhanced monitoring.

### Required redirects

```text
/index.php/c_booking/index              -> /rates
/index.php/c_client_main/Contactus      -> /contact
```

Apply the reviewed legacy redirect inventory. Preserve query strings only when
safe and useful. Avoid redirect chains.

## Post-launch monitoring

For at least the first 24 hours:

- Availability and TLS.
- 4xx/5xx rates.
- Rate snapshot and SSE health.
- Auth callback and exchange failures.
- Personalized ticket failures.
- Sanity fetch/revalidation failures.
- Web Vitals.
- Broken external actions.
- Search-engine crawl errors.

Keep the old server unchanged for at least 14 days.

## Rollback triggers

Rollback or disable an affected feature when:

- The site is broadly unavailable.
- TLS or hostname routing is unsafe.
- Incorrect rates are presented as live.
- Authentication exposes data or consistently blocks existing users.
- Critical catalog/contact journeys fail.
- A security incident is suspected.

## Rollback actions

### Application-only failure

- Roll Vercel back to the last approved immutable deployment.
- Recheck health, rates, auth, redirects, and consent.

### DNS/origin failure

- Restore the recorded legacy origin through the approved Cloudflare/DNS path.
- Verify the old site and certificate state.
- Keep the new deployment unaliased while investigating.

### Integration failure

- Prefer a controlled “rates unavailable” or public-only state over invented
  data.
- Disable personalized-rate entry if auth/ticket security is uncertain.
- Preserve catalog and contact access where safe.

## Decommissioning

The legacy server may be decommissioned only after:

- At least 14 stable days.
- Owner approval.
- Redirect and Search Console review.
- Backup retention confirmed.
- No rollback dependency remains.


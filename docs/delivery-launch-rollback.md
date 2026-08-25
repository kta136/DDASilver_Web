# Delivery, launch, and rollback

**Status:** Oracle Coolify production

**Authorized target:** `coolify-a1` through the existing named Cloudflare
Tunnel

**Rollback target:** previous healthy Coolify image or Git commit

The production controls in this document supersede the pre-launch hosting
runbook. Detailed application, network, and environment settings are in
[Oracle Coolify production deployment](oracle-coolify-deployment.md).

## Release gate

Only commits to `main` may deploy to the production application. The GitHub
Actions production workflow must complete `npm ci` and `npm run check` before
calling the deploy-only Coolify webhook. Coolify repository auto-deploy stays
off, and superseded workflow runs are cancelled.

The existing general CI workflow also runs Playwright desktop/mobile journeys.
Branch protection should require both workflows' checks before direct updates
to `main` where repository policy permits.

## Pre-cutover record

Capture these values without printing credentials into logs or documentation:

- The exact Cloudflare DNS record IDs, types, names, values, proxy state, and
  TTLs for apex and `www`.
- The complete named-tunnel ingress configuration, including existing panel,
  SSH, and vault routes.
- The former hosting deployment URL, aliases, domain bindings, and commit for
  the migration audit record.
- Coolify application UUID, production deployment webhook, and last healthy
  image.

Production environment values were transferred through a temporary ignored
file. The temporary file was removed after Coolify received the values. The
cookie secret remains preserved exactly; unused preview, OIDC, ticket, and
service-token values were excluded.

## Pre-cutover validation

1. Run lint, type checking, unit tests, production build, and Playwright
   desktop/mobile journeys.
2. Build the ARM64 image on `coolify-a1` and confirm the server runs as a
   non-root user.
3. Confirm the image contains no environment files and `/api/health` reports
   the source commit.
4. Validate through an Access-protected temporary hostname and by sending
   server-local requests with both production Host headers.
5. Check catalog/Sanity content, generated product social images, metadata,
   robots, sitemap, legacy redirects, contact/WhatsApp, auth redirects,
   same-origin logout, rate snapshots, and a several-minute SSE connection.
6. Perform a health-checked rolling replacement while continuously probing the
   application; no probe may fail.
7. Back up DNS and tunnel state, then add the two production-host tunnel rules
   before the catch-all without changing panel, SSH, or vault routes.

## Cutover

1. Replace the former origin records for `ddasilver.com` and
   `www.ddasilver.com` with proxied CNAMEs to
   `61e8ad96-2e1a-4e4f-b82c-7dbecac951e5.cfargotunnel.com`.
2. Keep Cloudflare Always Use HTTPS enabled and keep `/api/*` out of cache.
3. Verify HTTP and HTTPS for apex and `www`, one-hop apex canonicalization,
   TLS/HSTS, health, catalog, signed Sanity revalidation, GA consent loading,
   forwarded visitor IPs, rates, SSE reconnection, and auth/logout.
4. Confirm production responses contain no stale origin-provider headers.
5. Remove the temporary validation hostname.
6. Close OCI public ingress for ports `80`, `443`, and `8000` after confirming
   website, panel, SSH, and vault access through the tunnel.
7. After the observation window, remove the retired hosting project and its
   account-level `ddasilver.com` domain registration.

## Required redirects

```text
http://ddasilver.com/:path*                 -> https://www.ddasilver.com/:path*
https://ddasilver.com/:path*                -> https://www.ddasilver.com/:path*
/index.php/c_booking/index                  -> /rates
/index.php/c_client_main/Contactus          -> /contact
```

Paths and query strings are preserved by the apex redirect. Avoid a Coolify
canonical redirect so there is only one application-owned host redirect.

## Post-cutover monitoring

For the first 24 hours monitor:

- Coolify deployment and container health logs.
- Cloudflare Tunnel connection health and 5xx traffic.
- `/api/health`, catalog/Sanity errors, and signed revalidation.
- Rate snapshot failures, SSE reconnects, and history errors.
- Auth redirects, callback failures, logout, and cookie validation.
- Cloudflare cache behavior for API routes and any unexpected origin-provider
  response headers.

Test one later `main` push: the GitHub checks must gate the Coolify rolling
deployment and the reported health commit must update.

## Rollback triggers

Rollback when the site is broadly unavailable, TLS/host routing is unsafe,
critical catalog or contact journeys fail, rates are incorrect, authentication
exposes data or consistently fails, or a security incident is suspected.

## Rollback procedure

1. Identify the last healthy source commit and retained Coolify image.
2. Prefer reverting the faulty `main` commit so the normal GitHub checks gate
   the recovery deployment.
3. For urgent recovery, redeploy the retained healthy image in Coolify and
   reconcile `main` immediately afterward.
4. Keep Cloudflare DNS and tunnel routing unchanged, then verify TLS, apex
   redirect, `/api/health`, catalog, rates, SSE, auth, logout, contact, robots,
   and sitemap.
5. Record the incident, failed commit/deployment, rollback time, and validation
   evidence before resuming releases.

There is no dormant Vercel origin. A host-level failure requires restoring the
Oracle/Coolify origin or provisioning a separately authorized replacement.

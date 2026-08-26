# Oracle Coolify production deployment

**Production origin:** Oracle host `coolify-a1`

**Orchestrator:** Coolify 4

**Public edge:** Cloudflare

**Application port:** `3000` (internal only)

**Rollback target:** previous healthy Coolify image or Git commit

## Request path

```text
Browser
  -> Cloudflare proxy/TLS/WAF
  -> named Tunnel 61e8ad96-2e1a-4e4f-b82c-7dbecac951e5
  -> http://localhost:80 on coolify-a1
  -> Coolify Traefik
  -> DDA Silver container:3000
```

The tunnel has explicit ingress rules for `ddasilver.com` and
`www.ddasilver.com` before its catch-all rule. It must continue to preserve the
existing panel, SSH, and vault routes. Cloudflare owns public TLS; Traefik and
the application receive the tunnel's HTTP origin traffic. Neither the Docker
container nor Coolify publishes a host port.

The application permanently redirects the apex host to
`https://www.ddasilver.com/:path*`. Coolify routes both hosts and does not apply
a second canonical redirect. Cloudflare's Always Use HTTPS setting handles
HTTP at the edge. `/api/*` must not be cached, and chunked streaming must remain
enabled for the rates SSE connection.

## Coolify application settings

| Setting | Production value |
| --- | --- |
| Repository | `kta136/DDASilver_Web` |
| Branch | `main` |
| Build pack | Dockerfile |
| Dockerfile | `/Dockerfile` |
| Internal port | `3000` |
| Public host port | none |
| Instances | 1 |
| CPU limit | 2 vCPU |
| Memory limit | 2 GiB |
| Stop grace period | 30 seconds |
| Retained images | 3 |
| Container name | Coolify default |
| Health check | Dockerfile health check enabled |
| Include source commit in build | enabled |
| Coolify Git auto-deploy | disabled |
| Persistent storage/cache/Redis | Optional catalog recovery volume; see below |

The Docker image is based on the multi-architecture
`node:24.19.0-bookworm-slim` image and runs the Next.js standalone server as
the image's non-root `node` user. A pinned multi-architecture BusyBox stage
contributes only the static `wget` applet required by Coolify's generated
container health probe; the final application base remains Debian. `SOURCE_COMMIT` becomes
`NEXT_DEPLOYMENT_ID` during the build and `APP_VERSION` at runtime. This keeps
Next.js build assets aligned during a health-checked rolling replacement and
exposes the current commit through `/api/health`.

Coolify's Traefik service labels actively check `/api/health` every five
seconds for each site router. On `SIGTERM`, the container marks that endpoint
as draining, waits eight seconds for Traefik to remove the old backend, and
then forwards the signal to Next.js. Keep Coolify's stop grace period at 30
seconds. This drain window is required for a rolling replacement without
failed requests; do not replace it with a retry middleware shared by duplicate
router definitions.

## Environment ownership

Coolify production is the sole hosting environment and source of truth for the
active origin. Real values must never be committed, placed in the Docker build
context, or printed in logs.

### Build and runtime

- `NEXT_PUBLIC_SITE_URL=https://www.ddasilver.com`
- `NEXT_PUBLIC_SITE_ENV=production`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_GA_ID`
- `ENABLE_LEGACY_REDIRECTS`

### Runtime only

- `SANITY_REVALIDATE_SECRET`
- `DDAJEWELS_RATES_SNAPSHOT_URL`
- `DDAJEWELS_RATES_STREAM_URL`
- `DDAJEWELS_AUTH_COOKIE_NAME`
- `DDAJEWELS_AUTH_AUTHORIZE_URL`
- `DDAJEWELS_AUTH_TOKEN_URL`
- `DDAJEWELS_AUTH_INTROSPECT_URL`
- `DDAJEWELS_AUTH_REVOKE_URL`
- `DDAJEWELS_AUTH_CLIENT_ID`
- `DDAJEWELS_AUTH_CLIENT_SECRET`
- `AUTH_COOKIE_SECRET`

`AUTH_COOKIE_SECRET` must be preserved byte-for-byte across Coolify releases so
existing sessions remain valid. Do not add unused preview, OIDC, ticket, or
service-token variables.

## Release flow

1. A commit is pushed to `main`.
2. GitHub Actions installs Node 24.19 and dependencies with `npm ci`.
3. The deployment workflow runs `npm run check`.
4. Only after those checks pass, the workflow calls the authenticated Coolify
   deployment webhook.
5. Coolify builds the exact source commit, waits for the Docker health check,
   switches Traefik to the healthy replacement, and stops the old container.

The GitHub `production` environment owns the deploy-only `COOLIFY_TOKEN` and
`COOLIFY_WEBHOOK` secrets. Coolify's repository auto-deploy option stays off so
an unverified webhook and the verified workflow cannot race or deploy twice.
Superseded GitHub workflow runs are cancelled and production runs are
serialized.

GitHub reaches only
`https://coolify-deploy.kartikeyagarwal.com/api/v1/deploy`. The named tunnel
matches that exact hostname and path and forwards it to the Coolify API;
every other path on the hostname falls through to `http_status:404`. The
Coolify bearer token is deploy-only, and the panel remains protected by
Cloudflare Access.

## Validation

Before changing public DNS, validate the container through an
Access-protected temporary hostname and with server-local requests carrying
the real production Host headers. Remove the temporary hostname after
cutover.

Required checks include:

- `/api/health` is healthy and reports the expected source commit.
- The process runs as a non-root user and the image contains no `.env` files.
- Catalog and Sanity content, generated social images, canonical metadata,
  robots, sitemap, contact/WhatsApp links, auth redirects and same-origin
  logout work.
- Snapshot rates work and the SSE connection stays open for several minutes.
- The apex host redirects once to `www` while preserving the path and query.
- A rolling replacement completes without a failed request.
- Responses have Cloudflare headers and no stale hosting-provider headers.

## Cloudflare and origin controls

Back up the exact current DNS record identifiers/values and tunnel ingress
configuration before changes. The active proxied records are CNAMEs to:

```text
61e8ad96-2e1a-4e4f-b82c-7dbecac951e5.cfargotunnel.com
```

After public verification, the attached OCI security list was confirmed to
have no ingress rules for ports `80`, `443`, or `8000`; direct connection tests
to all three ports timed out. Its only ingress rule remains TCP/22 from the
operator `/32`, so no OCI control-plane mutation was required. Website,
Coolify panel, SSH, and vault access continue over the outbound-only tunnel.

## Cutover record

Production moved to Oracle Coolify on 2026-08-25. Cloudflare “Always Use
HTTPS” is on, the apex and `www` records are proxied CNAMEs to the named
tunnel, and tunnel configuration version 9 retains the existing panel, SSH,
vault, DDA Silver, deploy-only webhook, and catch-all routes. The temporary
cutover DNS record, ingress rule, and Access application were removed.

The initial gated `main` release was commit `a715768275d3`. GitHub
[CI run 32833152312](https://github.com/kta136/DDASilver_Web/actions/runs/32833152312)
and
[production run 32833152316](https://github.com/kta136/DDASilver_Web/actions/runs/32833152316)
passed before Coolify deployed it. Validation included 317/317 uninterrupted
page requests during a rolling replacement, 223/223 during the workflow-driven
replacement, a signed Sanity revalidation, and one 180-second SSE connection
that delivered 961 frames. Public responses reported the Coolify commit and no
stale origin headers.

On 2026-08-25, after the Oracle release was stable, Vercel project
`dda-silver-web` and all of its deployments were permanently deleted. The
`ddasilver.com` account-level domain registration was also removed from
Vercel. Vercel is no longer a rollback target.

## Coolify rollback

Keep the Cloudflare DNS and tunnel routes pointed at Oracle during an
application rollback.

1. Identify the last healthy source commit and retained Coolify image.
2. Prefer reverting the faulty `main` commit and allowing the gated GitHub
   workflow to deploy the resulting commit.
3. For an urgent recovery, use Coolify to redeploy the retained healthy image,
   then reconcile `main` immediately afterward.
4. Verify `/api/health`, TLS, apex redirect, catalog, signed revalidation,
   rates, SSE, authentication, logout, and contact journeys.
5. Record the failed and restored commits, deployment times, and validation
   evidence before resuming releases.

No DNS reversal is required for an application rollback. A host-level failure
requires restoring Oracle/Coolify or provisioning a separately authorized
origin; no dormant hosting copy exists.

## Sanity catalog rollout

Follow the filter/projection in [the content model](content-model.md#signed-publish-webhook),
including deity and image-asset events. Existing hosted webhook settings are not
changed by deploying the application. Keep `/api/catalog` and draft responses
uncached at the reverse proxy.

For recovery across container replacement, mount a writable directory such as
`/app/catalog-recovery` and set `SANITY_CATALOG_CACHE_DIR` to that path. Snapshots
contain only published query results, with at most 200 entries and a 24-hour age
limit. Without the volume, recovery lasts only for the current container. This
cache is not a Sanity backup; a cold outage displays an unavailable state.

Set `NEXT_PUBLIC_SITE_ENV=production` and the correct public Sanity project/dataset
at build time. No migration is required to read existing products. Before renaming
legacy category slugs, explicitly set Product fields in Studio and review homepage
order, visibility and image source. Assign collections on products. Deployment
must not run upload scripts or publish documents automatically.

Before promotion, run `npm run sanity:typegen`, `npm run check`, and browser
journeys. After an authorized deploy, verify listing page 2, a filtered share URL,
a product detail, the full sitemap and one approved publish/unpublish webhook
cycle. Live publishing checks require separate owner authorization.

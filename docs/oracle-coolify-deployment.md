# Oracle Coolify production deployment

**Production origin:** Oracle host `coolify-a1`

**Orchestrator:** Coolify 4

**Public edge:** Cloudflare

**Application port:** `3000` (internal only)

**Fallback:** dormant Vercel production deployment

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
| Persistent storage/cache/Redis | none |

The Docker image is based on the multi-architecture
`node:24.19.0-bookworm-slim` image and runs the Next.js standalone server as
the image's non-root `node` user. A pinned multi-architecture BusyBox stage
contributes only the static `wget` applet required by Coolify's generated
container health probe; the final application base remains Debian. `SOURCE_COMMIT` becomes
`NEXT_DEPLOYMENT_ID` during the build and `APP_VERSION` at runtime. This keeps
Next.js build assets aligned during a health-checked rolling replacement and
exposes the current commit through `/api/health`.

## Environment ownership

Coolify production is the source of truth for the active origin. Vercel keeps
an unchanged production copy solely for DNS rollback. Real values must never
be committed, placed in the Docker build context, or printed in logs.

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

`AUTH_COOKIE_SECRET` must be copied byte-for-byte so existing sessions remain
valid. Do not migrate `VERCEL_OIDC_TOKEN`, preview credentials, or unused
ticket/service-token variables.

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
- After cutover, responses have Cloudflare headers but no `x-vercel-*`
  headers.

## Cloudflare and origin controls

Back up the exact current DNS record identifiers/values and tunnel ingress
configuration before changes. The active proxied records are CNAMEs to:

```text
61e8ad96-2e1a-4e4f-b82c-7dbecac951e5.cfargotunnel.com
```

After public verification, OCI public ingress for ports `80`, `443`, and
`8000` is closed. Website, Coolify panel, SSH, and vault access continue over
the outbound-only tunnel.

## Vercel fallback and rollback

Keep the Vercel project, custom domains, production environment, aliases, and
last healthy production deployment unchanged. `vercel.json` disables Git
deployments, and the Git repository is disconnected from Vercel after the
Coolify cutover succeeds.

If cutover validation fails:

1. Restore the captured proxied Vercel A records for apex and `www`.
2. Confirm both hosts resolve to the retained Vercel deployment.
3. Recheck `/api/health`, TLS, apex redirect, catalog, rates, and auth.
4. Leave the failed Coolify release available for investigation but do not
   delete or alter the Vercel fallback.

Rollback is a DNS reversal; no secret, domain, alias, or data migration is
required.

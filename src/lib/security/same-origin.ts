export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    const allowedOrigins = new Set([new URL(request.url).origin]);
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (configuredSiteUrl) {
      try {
        const configuredOrigin = new URL(configuredSiteUrl);
        if (
          configuredOrigin.protocol === "https:" ||
          configuredOrigin.protocol === "http:"
        ) {
          allowedOrigins.add(configuredOrigin.origin);
        }
      } catch {
        // Invalid deployment configuration must not widen the allowed origins.
      }
    }
    return allowedOrigins.has(origin);
  }

  return request.headers.get("sec-fetch-site") === "same-origin";
}

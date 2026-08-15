import { siteConfig } from "@/lib/site";
import { isAllowedDdaJewelsUrl } from "@/lib/security/external-service";

export const authConfig = {
  authorizeUrl: process.env.DDAJEWELS_AUTH_AUTHORIZE_URL,
  tokenUrl: process.env.DDAJEWELS_AUTH_TOKEN_URL,
  introspectUrl: process.env.DDAJEWELS_AUTH_INTROSPECT_URL,
  revokeUrl: process.env.DDAJEWELS_AUTH_REVOKE_URL,
  clientId: process.env.DDAJEWELS_AUTH_CLIENT_ID,
  clientSecret: process.env.DDAJEWELS_AUTH_CLIENT_SECRET,
  cookieSecret: process.env.AUTH_COOKIE_SECRET,
} as const;

export const isAuthConfigured = Boolean(
  authConfig.authorizeUrl &&
  authConfig.tokenUrl &&
  authConfig.introspectUrl &&
  authConfig.revokeUrl &&
  authConfig.clientId &&
  authConfig.clientSecret &&
  authConfig.cookieSecret &&
  authConfig.cookieSecret.length >= 32 &&
  isAllowedAuthEndpoint(
    authConfig.authorizeUrl,
    "/api/v1/auth/sso/authorize",
  ) &&
  isAllowedAuthEndpoint(authConfig.tokenUrl, "/api/v1/auth/sso/token") &&
  isAllowedAuthEndpoint(
    authConfig.introspectUrl,
    "/api/v1/auth/sso/introspect",
  ) &&
  isAllowedAuthEndpoint(authConfig.revokeUrl, "/api/v1/auth/sso/revoke"),
);

export const authOrigin = new URL(siteConfig.url).origin;
export const authCookiesSecure = authOrigin.startsWith("https://");
export const authTransactionCookie = authCookiesSecure
  ? "__Host-dda_auth_transaction"
  : "dda_auth_transaction";
export const sessionCookie = authCookiesSecure
  ? "__Host-dda_session"
  : "dda_session";
// Chromium caps persistent cookies at 400 days. Active sessions renew this
// transport horizon without changing the authoritative server session.
export const sessionCookieMaxAgeSeconds = 400 * 24 * 60 * 60;

function isAllowedAuthEndpoint(value: string, pathname: string) {
  if (!isAllowedDdaJewelsUrl(value)) return false;
  const url = new URL(value);
  return (
    url.pathname === pathname &&
    !url.username &&
    !url.password &&
    !url.search &&
    !url.hash
  );
}

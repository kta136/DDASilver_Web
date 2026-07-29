import { siteConfig } from "@/lib/site";
import { isAllowedDdaJewelsUrl } from "@/lib/security/external-service";

export const authConfig = {
  authorizeUrl: process.env.DDAJEWELS_AUTH_AUTHORIZE_URL,
  tokenUrl: process.env.DDAJEWELS_AUTH_TOKEN_URL,
  clientId: process.env.DDAJEWELS_AUTH_CLIENT_ID,
  clientSecret: process.env.DDAJEWELS_AUTH_CLIENT_SECRET,
  cookieSecret: process.env.AUTH_COOKIE_SECRET,
} as const;

export const isAuthConfigured = Boolean(
  authConfig.authorizeUrl &&
    authConfig.tokenUrl &&
    authConfig.clientId &&
    authConfig.clientSecret &&
    authConfig.cookieSecret &&
    authConfig.cookieSecret.length >= 32 &&
    isAllowedDdaJewelsUrl(authConfig.authorizeUrl) &&
    isAllowedDdaJewelsUrl(authConfig.tokenUrl),
);

export const authOrigin = new URL(siteConfig.url).origin;
export const authTransactionCookie =
  process.env.NODE_ENV === "production"
    ? "__Host-dda_auth_transaction"
    : "dda_auth_transaction";
export const sessionCookie =
  process.env.NODE_ENV === "production"
    ? "__Host-dda_session"
    : "dda_session";

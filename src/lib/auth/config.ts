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
    authConfig.cookieSecret.length >= 32,
);

export const authTransactionCookie = "dda_auth_transaction";
export const sessionCookie = "dda_session";

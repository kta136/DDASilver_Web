import { NextResponse } from "next/server";

import {
  authConfig,
  authCookiesSecure,
  authOrigin,
  authTransactionCookie,
  isAuthConfigured,
} from "@/lib/auth/config";
import {
  createAuthTransaction,
  createPkceChallenge,
  isSafeReturnTo,
  signAuthTransaction,
} from "@/lib/auth/transaction";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(request, "auth-login", 10, 60_000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many login attempts. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  if (!isAuthConfigured || !authConfig.authorizeUrl || !authConfig.clientId) {
    return Response.json(
      { error: "Shared account login is not configured in this preview." },
      { status: 503 },
    );
  }

  const requestUrl = new URL(request.url);
  const returnTo = isSafeReturnTo(requestUrl.searchParams.get("returnTo"));
  const transaction = createAuthTransaction(returnTo);
  const challenge = createPkceChallenge(transaction.verifier);
  const callbackUrl = new URL("/auth/callback", authOrigin);
  const authorizeUrl = new URL(authConfig.authorizeUrl);

  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", authConfig.clientId);
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl.toString());
  authorizeUrl.searchParams.set("state", transaction.state);
  authorizeUrl.searchParams.set("nonce", transaction.nonce);
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(
    authTransactionCookie,
    signAuthTransaction(transaction),
    {
      httpOnly: true,
      secure: authCookiesSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
    },
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}

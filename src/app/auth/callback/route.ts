import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  authConfig,
  authCookiesSecure,
  authOrigin,
  authTransactionCookie,
  isAuthConfigured,
  sessionCookie,
} from "@/lib/auth/config";
import {
  safeEqual,
  verifyAuthTransaction,
} from "@/lib/auth/transaction";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { readBoundedJson } from "@/lib/security/external-service";

const tokenResponseSchema = z.object({
  session_token: z.string().min(20),
  expires_in: z.number().int().positive().max(60 * 60 * 24 * 30),
  nonce: z.string().min(20),
});

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(request, "auth-callback", 20, 60_000);
  if (!rateLimit.allowed) {
    return loginFailure("temporarily_unavailable");
  }

  if (
    !isAuthConfigured ||
    !authConfig.tokenUrl ||
    !authConfig.clientId ||
    !authConfig.clientSecret
  ) {
    return loginFailure("not_configured");
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const transaction = verifyAuthTransaction(
    cookieStore.get(authTransactionCookie)?.value,
  );

  if (
    !transaction ||
    !code ||
    !state ||
    !safeEqual(state, transaction.state)
  ) {
    cookieStore.delete(authTransactionCookie);
    return loginFailure("handoff_failed");
  }

  const callbackUrl = new URL("/auth/callback", authOrigin);
  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(authConfig.tokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: callbackUrl.toString(),
        client_id: authConfig.clientId,
        client_secret: authConfig.clientSecret,
        code_verifier: transaction.verifier,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    cookieStore.delete(authTransactionCookie);
    return loginFailure("temporarily_unavailable");
  }

  if (!tokenResponse.ok) {
    cookieStore.delete(authTransactionCookie);
    return loginFailure("handoff_failed");
  }

  let tokenPayload: unknown;
  try {
    tokenPayload = await readBoundedJson(tokenResponse);
  } catch {
    cookieStore.delete(authTransactionCookie);
    return loginFailure("handoff_failed");
  }
  const parsed = tokenResponseSchema.safeParse(tokenPayload);
  if (
    !parsed.success ||
    !safeEqual(parsed.data.nonce, transaction.nonce)
  ) {
    cookieStore.delete(authTransactionCookie);
    return loginFailure("handoff_failed");
  }

  cookieStore.delete(authTransactionCookie);
  cookieStore.set(sessionCookie, parsed.data.session_token, {
    httpOnly: true,
    secure: authCookiesSecure,
    sameSite: "lax",
    path: "/",
    maxAge: parsed.data.expires_in,
  });

  return NextResponse.redirect(new URL(transaction.returnTo, authOrigin));
}

function loginFailure(
  error: "handoff_failed" | "not_configured" | "temporarily_unavailable",
) {
  const url = new URL("/login", authOrigin);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

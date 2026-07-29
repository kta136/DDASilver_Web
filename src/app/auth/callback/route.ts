import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  authConfig,
  authTransactionCookie,
  isAuthConfigured,
  sessionCookie,
} from "@/lib/auth/config";
import {
  safeEqual,
  verifyAuthTransaction,
} from "@/lib/auth/transaction";
import { checkRateLimit } from "@/lib/security/rate-limit";

const tokenResponseSchema = z.object({
  session_token: z.string().min(20),
  expires_in: z.number().int().positive().max(60 * 60 * 24 * 30),
  nonce: z.string().min(20),
});

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(request, "auth-callback", 20, 60_000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many callback attempts." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  if (
    !isAuthConfigured ||
    !authConfig.tokenUrl ||
    !authConfig.clientId ||
    !authConfig.clientSecret
  ) {
    return Response.json(
      { error: "Shared account login is not configured." },
      { status: 503 },
    );
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
    return Response.json(
      { error: "The login handoff is invalid or has expired." },
      { status: 400 },
    );
  }

  const callbackUrl = new URL("/auth/callback", requestUrl.origin);
  const tokenResponse = await fetch(authConfig.tokenUrl, {
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
  });

  if (!tokenResponse.ok) {
    cookieStore.delete(authTransactionCookie);
    return Response.json(
      { error: "DDAJewels rejected or could not complete the login handoff." },
      { status: 502 },
    );
  }

  const parsed = tokenResponseSchema.safeParse(await tokenResponse.json());
  if (
    !parsed.success ||
    !safeEqual(parsed.data.nonce, transaction.nonce)
  ) {
    cookieStore.delete(authTransactionCookie);
    return Response.json(
      { error: "The DDAJewels token response failed validation." },
      { status: 502 },
    );
  }

  cookieStore.delete(authTransactionCookie);
  cookieStore.set(sessionCookie, parsed.data.session_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: parsed.data.expires_in,
  });

  return NextResponse.redirect(new URL(transaction.returnTo, requestUrl.origin));
}

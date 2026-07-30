import { cookies } from "next/headers";

import {
  authConfig,
  isAuthConfigured,
  sessionCookie,
} from "@/lib/auth/config";
import { isSameOriginRequest } from "@/lib/security/same-origin";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(sessionCookie)?.value;
  if (
    sessionToken &&
    isAuthConfigured &&
    authConfig.revokeUrl &&
    authConfig.clientId &&
    authConfig.clientSecret
  ) {
    try {
      await fetch(authConfig.revokeUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: authConfig.clientId,
          client_secret: authConfig.clientSecret,
          session_token: sessionToken,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
    } catch {
      // Local logout must still succeed if DDAJewels is temporarily unavailable.
    }
  }
  cookieStore.delete(sessionCookie);

  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}

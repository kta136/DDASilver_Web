import { cookies } from "next/headers";
import { z } from "zod";

import {
  authConfig,
  isAuthConfigured,
  sessionCookie,
} from "@/lib/auth/config";
import { ddaJewelsSessionCookieHeader } from "@/lib/rates/upstream-session";
import { readBoundedJson } from "@/lib/security/external-service";

const introspectionSchema = z.discriminatedUnion("active", [
  z.object({ active: z.literal(false) }),
  z.object({
    active: z.literal(true),
    user: z.object({
      subject: z.string().min(1),
      display_name: z.string().min(1).max(200),
      auth_status: z.enum([
        "pending_verification",
        "pending_approval",
        "approved",
      ]),
    }),
    expires_at: z.string().datetime({ offset: true }),
  }),
]);

const ddaJewelsMeSchema = z.object({
  user: z
    .object({
      id: z.string().min(1),
      name: z.string().min(1).max(200),
      isApproved: z.boolean(),
      emailVerified: z.boolean(),
      canViewCharts: z.boolean().optional(),
      canViewBuyingPrice: z.boolean().optional(),
    })
    .nullable(),
});

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(sessionCookie)?.value;
  if (!sessionToken) {
    return privateJson({ user: null });
  }
  if (
    !isAuthConfigured ||
    !authConfig.introspectUrl ||
    !authConfig.clientId ||
    !authConfig.clientSecret
  ) {
    return privateJson({ user: null }, 503);
  }

  let response: Response;
  try {
    response = await fetch(authConfig.introspectUrl, {
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
    return privateJson({ user: null }, 502);
  }
  if (!response.ok) {
    return privateJson({ user: null }, response.status === 401 ? 401 : 502);
  }

  let payload: unknown;
  try {
    payload = await readBoundedJson(response, 16_000);
  } catch {
    return privateJson({ user: null }, 502);
  }
  const parsed = introspectionSchema.safeParse(payload);
  if (!parsed.success) {
    return privateJson({ user: null }, 502);
  }
  if (!parsed.data.active) {
    cookieStore.delete(sessionCookie);
    return privateJson({ user: null });
  }

  const permissions = await readDdaJewelsUser(sessionToken);
  const approved = parsed.data.user.auth_status === "approved";

  return privateJson({
    user: {
      id: parsed.data.user.subject,
      name: parsed.data.user.display_name,
      authStatus: parsed.data.user.auth_status,
      isApproved: permissions?.isApproved ?? approved,
      emailVerified: permissions?.emailVerified ?? approved,
      canViewCharts: permissions?.canViewCharts ?? approved,
      canViewBuyingPrice: permissions?.canViewBuyingPrice ?? false,
    },
  });
}

async function readDdaJewelsUser(sessionToken: string) {
  if (!authConfig.introspectUrl) return null;

  const meUrl = new URL("/api/v1/auth/me", authConfig.introspectUrl);
  let response: Response;
  try {
    response = await fetch(meUrl, {
      headers: {
        Accept: "application/json",
        Cookie: ddaJewelsSessionCookieHeader(sessionToken),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;

  try {
    const parsed = ddaJewelsMeSchema.safeParse(
      await readBoundedJson(response, 16_000),
    );
    return parsed.success ? parsed.data.user : null;
  } catch {
    return null;
  }
}

function privateJson(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      Vary: "Cookie",
    },
  });
}

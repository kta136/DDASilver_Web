import { cookies } from "next/headers";
import { z } from "zod";

import { sessionCookie } from "@/lib/auth/config";
import {
  isAllowedDdaJewelsUrl,
  readBoundedJson,
} from "@/lib/security/external-service";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/same-origin";

const ticketResponseSchema = z.object({
  ticket: z.string().min(20),
  expiresAt: z.string().datetime({ offset: true }),
});

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const rateLimit = checkRateLimit(request, "rate-ticket", 30, 60_000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many ticket requests." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  const ticketUrl = process.env.DDAJEWELS_RATE_TICKET_URL;
  const serviceToken = process.env.DDAJEWELS_SERVICE_TOKEN;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(sessionCookie)?.value;

  if (!sessionToken) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!isAllowedDdaJewelsUrl(ticketUrl) || !serviceToken) {
    return Response.json(
      { error: "Personalized rate tickets are not configured." },
      { status: 503 },
    );
  }

  let ticketResponse: Response;
  try {
    ticketResponse = await fetch(ticketUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${serviceToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionToken,
        scope: "rates",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return Response.json(
      { error: "DDAJewels did not issue a rate ticket." },
      { status: 502 },
    );
  }

  if (!ticketResponse.ok) {
    return Response.json(
      { error: "DDAJewels did not issue a rate ticket." },
      { status: ticketResponse.status === 401 ? 401 : 502 },
    );
  }

  let ticketPayload: unknown;
  try {
    ticketPayload = await readBoundedJson(ticketResponse, 16_000);
  } catch {
    return Response.json(
      { error: "The rate ticket response failed validation." },
      { status: 502 },
    );
  }
  const parsed = ticketResponseSchema.safeParse(ticketPayload);
  if (!parsed.success) {
    return Response.json(
      { error: "The rate ticket response failed validation." },
      { status: 502 },
    );
  }

  return Response.json(parsed.data, {
    headers: {
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer",
    },
  });
}

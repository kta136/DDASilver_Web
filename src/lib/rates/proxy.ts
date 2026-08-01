import { cookies } from "next/headers";

import { sessionCookie } from "@/lib/auth/config";
import { ddaJewelsSessionCookieHeader } from "@/lib/rates/upstream-session";
import { isAllowedDdaJewelsUrl } from "@/lib/security/external-service";

type RateProxyTarget =
  | "snapshot"
  | "stream"
  | "history"
  | "source-history"
  | "source-history-catalog";

const maximumJsonBytes = 1_000_000;
const targetConfig: Record<
  RateProxyTarget,
  { pathname: string; query: readonly string[] }
> = {
  snapshot: { pathname: "/api/v1/rates/current", query: ["view"] },
  stream: {
    pathname: "/sse/rates",
    query: ["view", "seeded", "surface", "viewerId", "presenceProtocol"],
  },
  history: {
    pathname: "/api/v1/rates/history",
    query: ["itemId", "mode", "range", "from", "to"],
  },
  "source-history": {
    pathname: "/api/v1/sources/history",
    query: ["sourceId", "mode", "range", "from", "to"],
  },
  "source-history-catalog": {
    pathname: "/api/v1/sources/history/catalog",
    query: [],
  },
};

export async function proxyDdaJewelsRates(
  request: Request,
  target: RateProxyTarget,
) {
  const upstreamUrl = resolveUpstreamUrl(request, target);
  if (!upstreamUrl) {
    return Response.json(
      { error: "The DDA Jewels rate service is not configured." },
      { status: 503, headers: privateHeaders() },
    );
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(sessionCookie)?.value;
  const headers = new Headers({
    Accept:
      target === "stream" ? "text/event-stream" : "application/json",
  });
  if (sessionToken) {
    headers.set("Cookie", ddaJewelsSessionCookieHeader(sessionToken));
  }
  const lastEventId = request.headers.get("last-event-id");
  if (target === "stream" && lastEventId) {
    headers.set("Last-Event-ID", lastEventId.slice(0, 200));
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers,
      cache: "no-store",
      signal:
        target === "stream"
          ? request.signal
          : AbortSignal.any([
              request.signal,
              AbortSignal.timeout(10_000),
            ]),
    });
  } catch {
    return Response.json(
      { error: "The DDA Jewels rate service is unavailable." },
      { status: 502, headers: privateHeaders() },
    );
  }

  if (target === "stream") {
    return proxyStreamResponse(upstream);
  }
  return proxyJsonResponse(upstream);
}

function resolveUpstreamUrl(request: Request, target: RateProxyTarget) {
  const config = targetConfig[target];
  const configuredUrl =
    target === "stream"
      ? process.env.DDAJEWELS_RATES_STREAM_URL
      : process.env.DDAJEWELS_RATES_SNAPSHOT_URL;
  if (!isAllowedDdaJewelsUrl(configuredUrl)) {
    return null;
  }

  const upstream = new URL(configuredUrl);
  upstream.pathname = config.pathname;
  upstream.search = "";
  upstream.hash = "";

  const incoming = new URL(request.url);
  for (const key of config.query) {
    const value = incoming.searchParams.get(key);
    if (value !== null) {
      upstream.searchParams.set(key, value.slice(0, 200));
    }
  }
  return upstream;
}

async function proxyJsonResponse(upstream: Response) {
  const contentLength = Number(upstream.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > maximumJsonBytes
  ) {
    return Response.json(
      { error: "The DDA Jewels rate response was too large." },
      { status: 502, headers: privateHeaders() },
    );
  }

  let body: ArrayBuffer;
  try {
    body = await upstream.arrayBuffer();
  } catch {
    return Response.json(
      { error: "The DDA Jewels rate response was interrupted." },
      { status: 502, headers: privateHeaders() },
    );
  }
  if (body.byteLength > maximumJsonBytes) {
    return Response.json(
      { error: "The DDA Jewels rate response was too large." },
      { status: 502, headers: privateHeaders() },
    );
  }

  const headers = privateHeaders();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
  );
  const retryAfter = upstream.headers.get("retry-after");
  if (retryAfter) headers.set("Retry-After", retryAfter);
  return new Response(body, { status: upstream.status, headers });
}

function proxyStreamResponse(upstream: Response) {
  const headers = privateHeaders();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") ?? "text/event-stream; charset=utf-8",
  );
  headers.set("Connection", "keep-alive");
  headers.set("X-Accel-Buffering", "no");
  const retryAfter = upstream.headers.get("retry-after");
  if (retryAfter) headers.set("Retry-After", retryAfter);
  return new Response(upstream.body, { status: upstream.status, headers });
}

function privateHeaders() {
  return new Headers({
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
    Vary: "Cookie",
  });
}

import { getCatalogListing } from "@/sanity/lib/catalog";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const limit = checkRateLimit(request, "catalog", 120, 60_000);
  const headers = { "Cache-Control": "private, no-store" };
  if (!limit.allowed)
    return Response.json(
      { error: "Too many catalog requests. Please try again shortly." },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(limit.retryAfter) },
      },
    );
  const params = new URL(request.url).searchParams;
  try {
    const { result } = await getCatalogListing(
      params,
      "",
      params.get("collection") ?? "",
    );
    return Response.json(result, { headers });
  } catch {
    return Response.json(
      { error: "The catalog is temporarily unavailable. Please try again." },
      { status: 503, headers },
    );
  }
}

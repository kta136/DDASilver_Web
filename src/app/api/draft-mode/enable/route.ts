import { timingSafeEqual } from "node:crypto";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import { isSafeReturnTo } from "@/lib/auth/transaction";
import { isSanityConfigured } from "@/sanity/env";
import { checkRateLimit } from "@/lib/security/rate-limit";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(request, "draft-enable", 20, 60_000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many preview requests." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  const previewSecret = process.env.SANITY_PREVIEW_SECRET;
  const readToken = process.env.SANITY_API_READ_TOKEN;
  const requestUrl = new URL(request.url);
  const suppliedSecret = requestUrl.searchParams.get("secret");

  if (
    !isSanityConfigured ||
    !previewSecret ||
    !readToken ||
    !suppliedSecret ||
    !safeEqual(previewSecret, suppliedSecret)
  ) {
    return Response.json(
      { error: "Invalid or unavailable preview configuration." },
      { status: 401 },
    );
  }

  const returnTo = isSafeReturnTo(requestUrl.searchParams.get("redirect"));
  const draft = await draftMode();
  draft.enable();
  redirect(returnTo);
}

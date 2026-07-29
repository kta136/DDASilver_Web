import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { z } from "zod";

import { checkRateLimit } from "@/lib/security/rate-limit";

const webhookBodySchema = z.object({
  _type: z.enum(["product", "category", "collection", "page", "siteSettings"]),
  slug: z.string().optional(),
});

const typeTags: Record<z.infer<typeof webhookBodySchema>["_type"], string[]> = {
  product: ["product"],
  category: ["category", "product"],
  collection: ["collection", "product"],
  page: ["page"],
  siteSettings: ["siteSettings"],
};

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "sanity-webhook", 60, 60_000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many webhook requests." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json(
      { error: "Webhook secret is not configured." },
      { status: 503 },
    );
  }

  const { body, isValidSignature } = await parseBody<unknown>(request, secret);
  if (!isValidSignature) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  const parsed = webhookBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid webhook body." }, { status: 400 });
  }

  const tags = typeTags[parsed.data._type];
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: tags });
}

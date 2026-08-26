import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { z } from "zod";

import { checkRateLimit } from "@/lib/security/rate-limit";
import { CATALOG_TAG } from "@/sanity/lib/read";

const webhookBodySchema = z.object({
  _type: z.enum([
    "product",
    "category",
    "collection",
    "deity",
    "sanity.imageAsset",
    "page",
    "siteSettings",
  ]),
  _id: z.string().max(200).optional(),
  slug: z.string().max(120).nullish(),
});

const typeTags: Record<z.infer<typeof webhookBodySchema>["_type"], string[]> = {
  product: ["product"],
  category: ["category", "product"],
  collection: ["collection", "product"],
  deity: ["deity", "product"],
  "sanity.imageAsset": [
    "sanity.imageAsset",
    "product",
    "category",
    "collection",
  ],
  page: ["page"],
  siteSettings: ["siteSettings"],
};

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 1_000_000) {
    return Response.json(
      { error: "Webhook body is too large." },
      { status: 413 },
    );
  }

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

  let body: unknown;
  let isValidSignature: boolean | null;
  try {
    ({ body, isValidSignature } = await parseBody<unknown>(request, secret));
  } catch {
    return Response.json(
      { error: "Invalid webhook request." },
      { status: 400 },
    );
  }
  if (!isValidSignature) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  const parsed = webhookBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid webhook body." }, { status: 400 });
  }

  if (parsed.data._id?.startsWith("drafts."))
    return Response.json({ revalidated: [] });
  const tags = [CATALOG_TAG, ...typeTags[parsed.data._type]];
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }
  revalidatePath("/sitemap.xml");
  if (
    parsed.data._type === "product" &&
    parsed.data.slug &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parsed.data.slug)
  ) {
    revalidatePath(`/api/og/product/${parsed.data.slug}`);
  }

  return Response.json({ revalidated: tags });
}

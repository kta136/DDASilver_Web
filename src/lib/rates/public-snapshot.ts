import {
  extractRateValue,
  isRateSnapshotFresh,
  normalizeFeedStatus,
  rateSnapshotSchema,
} from "@/lib/rates/contract";
import { z } from "zod";
import {
  isAllowedDdaJewelsUrl,
  readBoundedJson,
} from "@/lib/security/external-service";

export type PublicRateSnapshot = {
  serverTime: string;
  marketStatus: "live" | "closed";
  validUntil: string;
  items: { id: string; name: string; unit: string; value: number }[];
};

const marketSessionSchema = z.object({
  phase: z.string().trim().min(1).max(40),
  isOpen: z.boolean(),
  nextOpenAt: z.string().datetime({ offset: true }).nullable().optional(),
  nextCloseAt: z.string().datetime({ offset: true }).nullable().optional(),
});

const marketEnvelopeSchema = z.object({
  feedStatus: z.object({
    marketSession: marketSessionSchema.optional(),
    marketState: z
      .object({ marketSession: marketSessionSchema.optional() })
      .optional(),
  }),
});

const publicItems: Record<string, { name: string; unit: string }> = {
  // Public DDAJewels item IDs verified against the anonymous feed, 2026-08-26.
  cmomripbx000204js90s51q0x: { name: "Gold 999", unit: "PER_10_GRAM" },
  cmomrj7er000004l5137q5fx4: { name: "Silver Bank", unit: "PER_KG" },
  cmomws5tw000004i5k5t6yrnw: { name: "Agra Mohar", unit: "PER_KG" },
  cmollgs4k000004jxjixqjukh: { name: "Silver Coin 10 g", unit: "PER_10_GRAM" },
};

export function decodePublicRateSnapshot(
  raw: unknown,
  now = Date.now(),
  { allowClosed = false }: { allowClosed?: boolean } = {},
): PublicRateSnapshot | null {
  const parsed = rateSnapshotSchema.safeParse(raw);
  if (!parsed.success) return null;
  const snapshot = parsed.data;
  const envelope = marketEnvelopeSchema.safeParse(raw);
  const session = envelope.success
    ? envelope.data.feedStatus.marketSession ??
      envelope.data.feedStatus.marketState?.marketSession
    : undefined;
  const normalizedStatus = normalizeFeedStatus(snapshot.feedStatus);
  const marketStatus =
    session?.isOpen === false && session.phase === "closed"
      ? "closed"
      : normalizedStatus;
  if (
    snapshot.view !== "default" ||
    (marketStatus !== "live" && !(allowClosed && marketStatus === "closed")) ||
    !isRateSnapshotFresh(snapshot.serverTime, now)
  )
    return null;
  const sessionBoundary =
    marketStatus === "closed" ? session?.nextOpenAt : session?.nextCloseAt;
  const boundaryTime = Date.parse(sessionBoundary ?? "");
  const fallbackLiveBoundary = new Date(
    new Date(snapshot.serverTime).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    }) + "T23:59:59.999+05:30",
  ).toISOString();
  const validUntil =
    Number.isFinite(boundaryTime) && boundaryTime > now
      ? new Date(boundaryTime).toISOString()
      : marketStatus === "live" && Date.parse(fallbackLiveBoundary) > now
        ? fallbackLiveBoundary
        : null;
  // A closed-market price is valid only when the authoritative feed supplies
  // the next opening boundary. Never retain it indefinitely on a bare status.
  if (!validUntil) return null;
  const items = snapshot.items.flatMap((item) => {
    const allowed = publicItems[item.id];
    const value = extractRateValue(item);
    if (!allowed || item.unit !== allowed.unit || value === null) return [];
    // Explicit allowlist: never serialize buying rates, premiums, sources or
    // future private fields from the upstream contract into a public page.
    return [{ id: item.id, name: allowed.name, unit: allowed.unit, value }];
  });
  return items.length
    ? {
        serverTime: snapshot.serverTime,
        marketStatus,
        validUntil,
        items,
      }
    : null;
}

export async function getPublicRateSnapshot(): Promise<PublicRateSnapshot | null> {
  const configured = process.env.DDAJEWELS_RATES_SNAPSHOT_URL;
  if (!isAllowedDdaJewelsUrl(configured)) return null;
  const url = new URL(configured);
  if (url.username || url.password) return null;
  url.pathname = "/api/v1/rates/current";
  url.search = "";
  url.hash = "";
  try {
    // Deliberately separate from the session-aware rate proxy. No incoming
    // request, cookies, authorization, user view or redirect can be forwarded.
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      credentials: "omit",
      redirect: "error",
      cache: "force-cache",
      next: { revalidate: 15 },
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) return null;
    return decodePublicRateSnapshot(await readBoundedJson(response));
  } catch {
    return null;
  }
}

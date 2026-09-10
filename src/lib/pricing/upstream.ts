import { decodePublicRateSnapshot } from "@/lib/rates/public-snapshot";
import {
  isAllowedDdaJewelsUrl,
  readBoundedJson,
} from "@/lib/security/external-service";
import { SILVER_BANK_ID } from "./store";
import type { SilverReference } from "./model";

/** The gallery's durable record is its cache. Do not add next.revalidate here. */
export async function fetchGalleryReference(): Promise<SilverReference | null> {
  const configured = process.env.DDAJEWELS_RATES_SNAPSHOT_URL;
  if (!isAllowedDdaJewelsUrl(configured)) return null;
  const url = new URL(configured);
  if (url.username || url.password) return null;
  url.pathname = "/api/v1/rates/current";
  url.search = "";
  url.hash = "";
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) return null;
    const snapshot = decodePublicRateSnapshot(await readBoundedJson(response));
    const item = snapshot?.items.find(
      (item) =>
        item.id === SILVER_BANK_ID && item.unit === "PER_KG" && item.value > 0,
    );
    return item && snapshot
      ? {
          itemId: item.id,
          unit: "PER_KG",
          value: item.value,
          snapshotAsOf: snapshot.serverTime,
        }
      : null;
  } catch {
    return null;
  }
}

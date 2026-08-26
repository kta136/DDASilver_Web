import { join } from "node:path";
import type { QueryParams } from "next-sanity";

import { sanityDataset, sanityProjectId } from "@/sanity/env";
import type { sanityClient } from "@/sanity/lib/client";
import type { Decoded } from "@/sanity/lib/contract";
import { createSnapshotStore, type SnapshotStore } from "@/sanity/lib/snapshot";

export const CATALOG_TAG = "sanity-catalog";
export const CATALOG_REVALIDATE_SECONDS = 300;
export const catalogTags = [
  CATALOG_TAG,
  "product",
  "category",
  "collection",
  "deity",
  "sanity.imageAsset",
];
const snapshots = createSnapshotStore(
  process.env.SANITY_CATALOG_CACHE_DIR?.trim() ||
    join(process.cwd(), ".next", "cache", "sanity-catalog"),
);

export class CatalogUnavailableError extends Error {
  constructor() {
    super(
      "The product catalog is temporarily unavailable. Please try again shortly.",
    );
    this.name = "CatalogUnavailableError";
  }
}

export function createSanityReader(
  client: typeof sanityClient,
  {
    draft = false,
    store = snapshots,
  }: { draft?: boolean; store?: SnapshotStore } = {},
) {
  return async function read<T>(
    query: string,
    params: QueryParams,
    decode: (raw: unknown, previous?: T) => Decoded<T>,
  ): Promise<Decoded<T>> {
    const key = JSON.stringify([
      "v1",
      sanityProjectId,
      sanityDataset,
      query,
      params,
    ]);
    // Drafts never read or write published recovery data, including on failures.
    const stored = draft ? undefined : await store.get(key);
    let previous: T | undefined;
    if (stored !== undefined) {
      try {
        previous = decode(stored).value;
      } catch {
        /* Ignore snapshots from an incompatible contract. */
      }
    }
    let raw: unknown;
    try {
      raw = await client.fetch(
        query,
        params,
        draft
          ? { cache: "no-store" }
          : {
              cache: "force-cache",
              next: {
                revalidate: CATALOG_REVALIDATE_SECONDS,
                tags: catalogTags,
              },
            },
      );
    } catch {
      try {
        raw = await client.fetch(query, params, { cache: "no-store" });
      } catch {
        console.error("Sanity query failed", {
          draft,
          recovered: previous !== undefined,
        });
        if (previous !== undefined) return { value: previous, degraded: true };
        throw new CatalogUnavailableError();
      }
    }
    try {
      const result = decode(raw, previous);
      if (!draft && !result.degraded) await store.set(key, raw);
      return result;
    } catch {
      console.error("Sanity response failed validation", {
        draft,
        recovered: previous !== undefined,
      });
      if (previous !== undefined) return { value: previous, degraded: true };
      throw new CatalogUnavailableError();
    }
  };
}

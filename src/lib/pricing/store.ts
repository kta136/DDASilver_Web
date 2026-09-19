import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import { join } from "node:path";
import lockfile from "proper-lockfile";
import type { SilverReference } from "./model";

export const SILVER_BANK_ID = "cmomrj7er000004l5137q5fx4";
export const REFRESH_INTERVAL_MS = 300_000;
const LOCK_STALE_MS = 30_000;
export type PricingRecord = {
  version: 1;
  generation: number;
  reference: SilverReference | null;
  refresh: {
    lastAttemptAt: number;
    nextAttemptAt: number;
    outcome: "pending" | "accepted" | "failed";
  };
};
export type StoreRead = {
  record: PricingRecord | null;
  recovery: "primary" | "backup" | "missing";
};

export function validReference(value: unknown): value is SilverReference {
  if (!value || typeof value !== "object") return false;
  const r = value as SilverReference;
  return (
    r.itemId === SILVER_BANK_ID &&
    r.unit === "PER_KG" &&
    Number.isFinite(r.value) &&
    r.value > 0 &&
    typeof r.snapshotAsOf === "string" &&
    Number.isFinite(Date.parse(r.snapshotAsOf)) &&
    (r.marketStatus === undefined ||
      r.marketStatus === "live" ||
      r.marketStatus === "closed") &&
    (r.validUntil === undefined ||
      (typeof r.validUntil === "string" &&
        Number.isFinite(Date.parse(r.validUntil))))
  );
}
function validRecord(value: unknown): value is PricingRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as PricingRecord;
  return (
    r.version === 1 &&
    Number.isSafeInteger(r.generation) &&
    r.generation >= 1 &&
    (r.reference === null || validReference(r.reference)) &&
    Boolean(r.refresh) &&
    Number.isSafeInteger(r.refresh.lastAttemptAt) &&
    r.refresh.lastAttemptAt > 0 &&
    Number.isSafeInteger(r.refresh.nextAttemptAt) &&
    r.refresh.nextAttemptAt >= r.refresh.lastAttemptAt + REFRESH_INTERVAL_MS &&
    ["pending", "accepted", "failed"].includes(r.refresh.outcome)
  );
}

/** Dedicated durable record: no age expiry, no catalog-cache eviction, no process-global read cache. */
export class GalleryRateStore {
  readonly directory: string;
  constructor(directory: string) {
    this.directory = directory;
  }

  async read(): Promise<StoreRead> {
    const read = async (name: string) => {
      try {
        const file = await open(join(this.directory, name), "r");
        try {
          if ((await file.stat()).size > 16_384) return null;
          const raw: unknown = JSON.parse(await file.readFile("utf8"));
          return validRecord(raw) ? raw : null;
        } finally {
          await file.close();
        }
      } catch {
        return null;
      }
    };
    const [primary, backup] = await Promise.all([
      read("reference.json"),
      read("reference.backup.json"),
    ]);
    // Backup is written first. Prefer its newer gate after an interrupted primary write.
    if (backup && (!primary || backup.generation > primary.generation))
      return { record: backup, recovery: "backup" };
    if (primary) return { record: primary, recovery: "primary" };
    return { record: null, recovery: "missing" };
  }

  private async atomicWrite(
    name: string,
    value: unknown,
    assertOwner: () => Promise<void>,
  ) {
    const path = join(this.directory, name);
    const temporary = `${path}.${randomUUID()}.tmp`;
    try {
      const file = await open(temporary, "wx", 0o600);
      try {
        await file.writeFile(JSON.stringify(value));
        await file.sync();
      } finally {
        await file.close();
      }
      await assertOwner();
      await rename(temporary, path);
    } finally {
      await unlink(temporary).catch(() => undefined);
    }
  }

  async refresh(
    fetchReference: () => Promise<SilverReference | null>,
    now = Date.now(),
  ): Promise<string> {
    let release: (() => Promise<void>) | undefined;
    let compromised = false;
    const startedAt = Date.now();
    const owner = randomUUID();
    const ownerPath = join(this.directory, "refresh-owner");
    try {
      await mkdir(this.directory, { recursive: true });
      try {
        release = await lockfile.lock(this.directory, {
          lockfilePath: join(this.directory, "refresh.lock"),
          stale: LOCK_STALE_MS,
          update: 5_000,
          retries: 0,
          onCompromised: () => {
            compromised = true;
          },
        });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ELOCKED")
          return "locked";
        throw error;
      }
      const ownerFile = await open(ownerPath, "w", 0o600);
      try {
        await ownerFile.writeFile(owner);
      } finally {
        await ownerFile.close();
      }
      const assertOwner = async () => {
        if (
          compromised ||
          Date.now() - startedAt >= LOCK_STALE_MS ||
          (await readFile(ownerPath, "utf8")) !== owner
        )
          throw new Error("Gallery pricing refresh lost lock ownership.");
      };
      const { record } = await this.read();
      if (record && record.refresh.nextAttemptAt > now) return "skipped";
      const next: PricingRecord = {
        version: 1,
        generation: (record?.generation ?? 0) + 1,
        reference: record?.reference ?? null,
        refresh: {
          lastAttemptAt: now,
          nextAttemptAt: now + REFRESH_INTERVAL_MS,
          outcome: "pending",
        },
      };
      const persist = async () => {
        await this.atomicWrite("reference.backup.json", next, assertOwner);
        await this.atomicWrite("reference.json", next, assertOwner);
        // Ensure rename metadata is durable on the production Linux filesystem.
        if (process.platform !== "win32") {
          const dir = await open(this.directory, "r");
          try {
            await dir.sync();
          } finally {
            await dir.close();
          }
        }
      };
      await persist(); // Commit the throttle before any network request, including the first seed.
      let candidate: SilverReference | null = null;
      try {
        candidate = await fetchReference();
      } catch {
        /* Keep the last accepted reference. */
      }
      await assertOwner();
      const accepted =
        validReference(candidate) &&
        (!next.reference ||
          Date.parse(candidate.snapshotAsOf) >=
            Date.parse(next.reference.snapshotAsOf));
      if (accepted) next.reference = candidate;
      next.generation += 1;
      next.refresh.outcome = accepted ? "accepted" : "failed";
      await persist();
      if (!accepted)
        console.warn(
          "[gallery-pricing] Refresh failed; retaining the last accepted reference.",
        );
      return next.refresh.outcome;
    } catch (error) {
      console.warn(
        "[gallery-pricing] Storage/lock failure; refresh skipped.",
        error instanceof Error ? error.message : "Unknown error",
      );
      return "storage-error";
    } finally {
      if (
        release &&
        !compromised &&
        (await readFile(ownerPath, "utf8").catch(() => "")) === owner
      )
        await release().catch(() => undefined);
    }
  }
}

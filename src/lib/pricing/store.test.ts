// @vitest-environment node
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  utimes,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GalleryRateStore, REFRESH_INTERVAL_MS, SILVER_BANK_ID } from "./store";

let directory: string;
const now = Date.now();
const reference = {
  itemId: SILVER_BANK_ID,
  unit: "PER_KG" as const,
  value: 100_000,
  snapshotAsOf: new Date(now).toISOString(),
};
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "dda-pricing-test-"));
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(async () => {
  vi.restoreAllMocks();
  const local = relative(resolve(tmpdir()), resolve(directory));
  if (!local.startsWith("dda-pricing-test-") || local.includes(".."))
    throw new Error("Unsafe cleanup target");
  await rm(directory, { recursive: true, force: true });
});
describe("durable gallery reference", () => {
  it("persists failures, keeps an arbitrarily old accepted reference and survives restarts", async () => {
    const store = new GalleryRateStore(directory);
    expect(await store.refresh(async () => reference, now)).toBe("accepted");
    const old = (await store.read()).record!;
    const failure = vi.fn().mockRejectedValue(new Error("outage"));
    const nextDay = now + 48 * 60 * 60 * 1000;
    expect(
      await new GalleryRateStore(directory).refresh(failure, nextDay),
    ).toBe("failed");
    expect(
      await new GalleryRateStore(directory).refresh(failure, nextDay + 1),
    ).toBe("skipped");
    expect(failure).toHaveBeenCalledTimes(1);
    const saved = (await store.read()).record!;
    expect(saved.reference).toEqual(old.reference);
    expect(saved.refresh).toMatchObject({
      lastAttemptAt: nextDay,
      nextAttemptAt: nextDay + REFRESH_INTERVAL_MS,
    });
  });
  it("commits the attempt gate before starting the request and excludes concurrent callers", async () => {
    const store = new GalleryRateStore(directory);
    const fetcher = vi.fn(async () => {
      expect((await store.read()).record?.refresh).toMatchObject({
        outcome: "pending",
        nextAttemptAt: now + REFRESH_INTERVAL_MS,
      });
      await new Promise((resolve) => setTimeout(resolve, 50));
      return reference;
    });
    await Promise.all(
      Array.from({ length: 12 }, () =>
        new GalleryRateStore(directory).refresh(fetcher, now),
      ),
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("uses a good backup on primary corruption, but reports loss of both copies", async () => {
    const store = new GalleryRateStore(directory);
    await store.refresh(async () => reference, now);
    await writeFile(join(directory, "reference.json"), "broken");
    expect(await store.read()).toMatchObject({
      recovery: "backup",
      record: { reference },
    });
    await store.refresh(async () => reference, now + REFRESH_INTERVAL_MS);
    expect((await store.read()).recovery).toBe("primary");
    await writeFile(join(directory, "reference.json"), "broken");
    await writeFile(join(directory, "reference.backup.json"), "broken");
    expect(await store.read()).toEqual({ recovery: "missing", record: null });
  });
  it("prefers a newer backup attempt gate after an interrupted primary rename", async () => {
    const store = new GalleryRateStore(directory);
    await store.refresh(async () => reference, now);
    const record = (await store.read()).record!;
    await writeFile(
      join(directory, "reference.backup.json"),
      JSON.stringify({
        ...record,
        generation: record.generation + 1,
        refresh: {
          lastAttemptAt: now + REFRESH_INTERVAL_MS,
          nextAttemptAt: now + 2 * REFRESH_INTERVAL_MS,
          outcome: "pending",
        },
      }),
    );
    const fetcher = vi.fn();
    expect(await store.refresh(fetcher, now + REFRESH_INTERVAL_MS + 1)).toBe(
      "skipped",
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("recovers abandoned locks and refuses writes after losing ownership", async () => {
    const store = new GalleryRateStore(directory);
    const lock = join(directory, "refresh.lock");
    await mkdir(lock);
    await utimes(lock, new Date(now - 60_000), new Date(now - 60_000));
    expect(await store.refresh(async () => reference, now)).toBe("accepted");
    expect(
      await store.refresh(async () => {
        await writeFile(join(directory, "refresh-owner"), "replacement-owner");
        return { ...reference, value: 200_000 };
      }, now + REFRESH_INTERVAL_MS),
    ).toBe("storage-error");
    expect((await store.read()).record?.reference).toEqual(reference);
  });
  it("rejects invalid identity, zero rates and backwards snapshots", async () => {
    const store = new GalleryRateStore(directory);
    await store.refresh(async () => reference, now);
    for (const [index, candidate] of [
      { ...reference, itemId: "private" },
      { ...reference, value: 0 },
      { ...reference, snapshotAsOf: "2020-01-01T00:00:00Z" },
    ].entries())
      expect(
        await store.refresh(
          async () => candidate,
          now + (index + 1) * REFRESH_INTERVAL_MS,
        ),
      ).toBe("failed");
    expect((await store.read()).record?.reference).toEqual(reference);
  });
  it("does not contact upstream when the gate cannot be persisted", async () => {
    const file = join(directory, "not-a-directory");
    await writeFile(file, "file");
    const fetcher = vi.fn();
    expect(await new GalleryRateStore(file).refresh(fetcher, now)).toBe(
      "storage-error",
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("shares one attempt across independent Node processes", async () => {
    const storeModule = pathToFileURL(resolve("src/lib/pricing/store.ts")).href;
    const script = `import { GalleryRateStore } from ${JSON.stringify(storeModule)};
      import { appendFile } from 'node:fs/promises';
      const store = new GalleryRateStore(${JSON.stringify(directory)});
      await store.refresh(async () => { await appendFile(${JSON.stringify(join(directory, "attempts"))}, 'attempt\\n');
        await new Promise(r => setTimeout(r, 100)); return ${JSON.stringify(reference)}; }, ${now});`;
    await Promise.all(
      Array.from({ length: 5 }, () =>
        promisify(execFile)(
          process.execPath,
          ["--input-type=module", "-e", script],
          { windowsHide: true },
        ),
      ),
    );
    expect(
      (await readFile(join(directory, "attempts"), "utf8")).trim().split("\n"),
    ).toHaveLength(1);
    expect(
      (await new GalleryRateStore(directory).read()).record?.reference,
    ).toEqual(reference);
  }, 20_000);
});
